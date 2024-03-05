import type { PrivateMetadata, PublicMetadata } from "@/types/metadata";
import { auth, clerkClient } from "@clerk/nextjs";

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return Response.json("Missing userId", { status: 400 });
  }

  try {
    const {
      awsAccessKey,
      awsSecretKey,
      s3FolderPath,
      awsRegion,
      s3BucketName,
    } = await request.json();

    const user = await clerkClient.users.getUser(userId);
    const existingPrivateMetadata: PrivateMetadata = user.privateMetadata || {};
    const existingPublicMetadata: PublicMetadata = user.publicMetadata || {};

    const updatedPrivateMetadata: PrivateMetadata = {
      ...existingPrivateMetadata,
      awsAccessKey,
      awsSecretKey,
      s3FolderPath,
      awsRegion,
      s3BucketName,
    };
    const updatedPublicMetadata: PublicMetadata = {
      ...existingPublicMetadata,
      awsKeysAdded: true,
    };

    await clerkClient.users.updateUser(userId, {
      privateMetadata: updatedPrivateMetadata,
      publicMetadata: updatedPublicMetadata,
    });

    return Response.json("AWS keys and S3 bucket name added", { status: 200 });
  } catch (error) {
    console.error("Error adding AWS keys and S3 bucket name:", error);
    if (error instanceof SyntaxError) {
      return Response.json("Invalid JSON format", { status: 400 });
    }
    return Response.json("Failed to add AWS keys and S3 bucket name", {
      status: 500,
    });
  }
}
