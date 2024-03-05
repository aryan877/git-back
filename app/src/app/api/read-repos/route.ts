import { clerkClient } from "@clerk/nextjs";
import { Octokit } from "@octokit/rest";
import { auth } from "@clerk/nextjs";
import type { PrivateMetadata, PublicMetadata } from "@/types/metadata";
import { RepoItem } from "@/types/repoItem";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const searchTerm = url.searchParams.get("search");
  const { userId } = auth();
  if (!userId) {
    return Response.json("Missing userId", { status: 400 });
  }

  try {
    // Retrieve the GitHub access token from Clerk
    const user = await clerkClient.users.getUser(userId);
    const privateMetadata: PrivateMetadata = user.privateMetadata || {};
    const publicMetadata: PublicMetadata = user.publicMetadata || {};
    const githubToken = privateMetadata.githubToken;

    if (!githubToken) {
      return Response.json("GitHub token not found for user", { status: 404 });
    }

    const octokit = new Octokit({
      auth: githubToken,
    });

    let repos;
    if (searchTerm) {
      // Search for repositories using the search term within the user's repositories
      const searchResults = await octokit.rest.search.repos({
        q: `${searchTerm} user:${publicMetadata.githubUsername}`,
        per_page: 10,
        sort: "updated",
        order: "desc",
      });
      repos = searchResults.data.items;
    } else {
      const repoResults = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: 10,
        page,
        sort: "updated",
        direction: "desc",
      });
      repos = repoResults.data;
    }

    const formattedRepos = repos.map((repo) => {
      const formattedRepo: RepoItem = {
        repoId: repo.id,
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        createdAt: new Date(repo.created_at!),
        updatedAt: new Date(repo.updated_at!),
        isPrivate: repo.private,
        defaultBranch: repo.default_branch,
        ownerName: repo.owner?.login || publicMetadata.githubUsername!,
      };
      return formattedRepo;
    });

    return Response.json(formattedRepos, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("GitHub fetch repos error:", error);
    return Response.json("Failed to fetch GitHub repositories", {
      status: 500,
    });
  }
}
