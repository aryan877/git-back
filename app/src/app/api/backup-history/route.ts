import BackupModel from '@/model/BackUp';
import dbConnect from '@/utils/dbConnect';
import { auth } from '@clerk/nextjs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const repo = url.searchParams.get('repo');
  const owner = url.searchParams.get('owner');
  const { userId } = auth();
  if (!userId) {
    return new Response('Missing userId', { status: 400 });
  }

  try {
    await dbConnect();

    // Fetch backup history from the database
    const backupHistory = await BackupModel.aggregate([
      {
        $match: {
          repoName: repo as string,
          owner: owner as string,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return new Response(
      JSON.stringify({
        backupHistory,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching backup history:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
