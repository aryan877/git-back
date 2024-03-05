import type { PrivateMetadata, PublicMetadata } from "@/types/metadata";
import { auth, clerkClient } from "@clerk/nextjs";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return Response.json("Missing userId", { status: 400 });
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const existingPrivateMetadata: PrivateMetadata = user.privateMetadata || {};
    const existingPublicMetadata: PublicMetadata = user.publicMetadata || {};

    const updatedPrivateMetadata: PrivateMetadata = {
      ...existingPrivateMetadata,
      awsAccessKey: null,
      awsSecretKey: null,
      s3FolderPath: null,
      awsRegion: null,
      s3BucketName: null,
    };

    const updatedPublicMetadata: PublicMetadata = {
      ...existingPublicMetadata,
      awsKeysAdded: false,
    };

    await clerkClient.users.updateUser(userId, {
      privateMetadata: updatedPrivateMetadata,
      publicMetadata: updatedPublicMetadata,
    });

    return Response.json("AWS keys deleted", { status: 200 });
  } catch (error) {
    console.error("Error deleting AWS keys:", error);
    return Response.json("Failed to delete AWS keys", { status: 500 });
  }
}
