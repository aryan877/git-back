import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { auth, clerkClient } from "@clerk/nextjs";
import { Octokit } from "@octokit/rest";
import type { PrivateMetadata, PublicMetadata } from "@/types/metadata";

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return Response.json("Missing userId", { status: 400 });
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const privateMetadata: PrivateMetadata = user.privateMetadata || {};
    const publicMetadata: PublicMetadata = user.publicMetadata || {};
    const githubToken = privateMetadata.githubToken;

    if (!githubToken) {
      return Response.json("GitHub token not found for user", { status: 404 });
    }

    const appOctokit = new Octokit({
      authStrategy: createOAuthAppAuth,
      auth: {
        clientType: "oauth-app",
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    });

    const resetResponse = await appOctokit.request(
      "DELETE /applications/{client_id}/token",
      {
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
        access_token: githubToken,
      }
    );

    if (resetResponse.status !== 204) {
      console.error("Failed to reset GitHub token:", resetResponse);
    }

    const updatedPrivateMetadata: PrivateMetadata = {
      ...privateMetadata,
      githubToken: null,
    };
    const updatedPublicMetadata: PublicMetadata = {
      ...publicMetadata,
      githubId: null,
      githubUsername: null,
      githubAvatarUrl: null,
    };

    await clerkClient.users.updateUser(userId, {
      privateMetadata: updatedPrivateMetadata,
      publicMetadata: updatedPublicMetadata,
    });

    return Response.json("GitHub integration removed", { status: 200 });
  } catch (error) {
    console.error("GitHub disconnect error:", error);
    return Response.json("Failed to disconnect GitHub", { status: 500 });
  }
}
