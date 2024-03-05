import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { Octokit } from "@octokit/rest";
import { clerkClient } from "@clerk/nextjs";
import type { PrivateMetadata, PublicMetadata } from "@/types/metadata";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code) {
    return Response.json("Missing authorization code", { status: 400 });
  }

  const auth = createOAuthAppAuth({
    clientType: "oauth-app",
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  });

  try {
    const { token } = await auth({ type: "oauth-user", code });

    const octokit = new Octokit({ auth: token });

    const { data: userData } = await octokit.rest.users.getAuthenticated();

    const githubUserData = {
      id: userData.id,
      login: userData.login,
      avatar_url: userData.avatar_url,
    };

    console.log("Username:", githubUserData.login);
    console.log("Full User Data:", githubUserData);

    const user = await clerkClient.users.getUser(userId!);
    const existingPrivateMetadata: PrivateMetadata = user.privateMetadata || {};
    const existingPublicMetadata: PublicMetadata = user.publicMetadata || {};

    const updatedPrivateMetadata: PrivateMetadata = {
      ...existingPrivateMetadata,
      githubToken: token,
    };
    const updatedPublicMetadata: PublicMetadata = {
      ...existingPublicMetadata,
      githubId: githubUserData.id,
      githubUsername: githubUserData.login,
      githubAvatarUrl: githubUserData.avatar_url,
    };

    await clerkClient.users.updateUser(userId!, {
      privateMetadata: updatedPrivateMetadata,
      publicMetadata: updatedPublicMetadata,
    });

    const redirectUrl = `${url.origin}/dashboard/connect-github`;
    return Response.redirect(redirectUrl);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return Response.json("GitHub OAuth failed", { status: 500 });
  }
}
