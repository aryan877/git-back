import { auth, clerkClient } from '@clerk/nextjs';
import { Octokit } from '@octokit/rest';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const repo = url.searchParams.get('repo');
  const owner = url.searchParams.get('owner');
  const { userId } = auth();
  if (!userId) {
    return new Response('Missing userId', { status: 400 });
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const privateMetadata = user.privateMetadata || {};
    const githubToken = privateMetadata.githubToken;

    if (!githubToken) {
      return new Response('GitHub token not found for user', { status: 404 });
    }

    const octokit = new Octokit({
      auth: githubToken,
    });

    // Fetch repository details as an authenticated user
    const { data: repoDetails } = await octokit.repos.get({
      owner: owner!,
      repo: repo as string,
    });

    // Fetch the latest commit
    const { data: latestCommit } = await octokit.repos.getCommit({
      owner: owner!,
      repo: repo as string,
      ref: repoDetails.default_branch,
    });

    // Fetch branches
    const { data: branches } = await octokit.repos.listBranches({
      owner: owner!,
      repo: repo as string,
    });

    return new Response(
      JSON.stringify({
        repoDetails: {
          ...repoDetails,
        },
        latestCommit,
        branches: branches.map((branch) => branch.name),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching repository details:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
