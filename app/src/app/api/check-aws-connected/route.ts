import { PublicMetadata } from "@/types/metadata";
import { auth, clerkClient } from "@clerk/nextjs";

export async function GET(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return Response.json("Missing userId", { status: 400 });
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const publicMetadata: PublicMetadata = user.publicMetadata;

    if (publicMetadata && publicMetadata.awsKeysAdded) {
      return Response.json({ connected: true }, { status: 200 });
    } else {
      return Response.json({ connected: false }, { status: 200 });
    }
  } catch (error) {
    console.error("Error checking AWS connection:", error);
    return Response.json("Failed to check AWS connection", { status: 500 });
  }
}
