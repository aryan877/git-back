import BackupModel, { IBackup } from '@/model/BackUp';
import { PrivateMetadata } from '@/types/metadata';
import dbConnect from '@/utils/dbConnect';
import { Document } from 'mongoose';
import {
  DescribeSubnetsCommand,
  DescribeVpcsCommand,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { auth, clerkClient } from '@clerk/nextjs';

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  await dbConnect();
  const { repo, owner } = await request.json();

  if (!repo || !owner) {
    return new Response('Missing required parameters', { status: 400 });
  }

  const { userId } = auth();

  if (!userId) {
    return new Response('Missing userId', { status: 400 });
  }

  let response;

  try {
    const user = await clerkClient.users.getUser(userId);
    const privateMetadata: PrivateMetadata = user.privateMetadata;
    const githubToken = privateMetadata.githubToken;
    const awsAccessKeyId = privateMetadata.awsAccessKey;
    const awsSecretAccessKey = privateMetadata.awsSecretKey;
    const awsRegion = privateMetadata.awsRegion;
    const s3FolderPath = privateMetadata.s3FolderPath || '';
    const s3BucketName = privateMetadata.s3BucketName;

    if (!githubToken) {
      throw new Error('GitHub token not found for user');
    }

    if (!awsAccessKeyId) {
      throw new Error('AWS Access Key ID not found for user');
    }

    if (!awsSecretAccessKey) {
      throw new Error('AWS Secret Access Key not found for user');
    }

    if (!awsRegion) {
      throw new Error('AWS Region not found for user');
    }

    if (!s3BucketName) {
      throw new Error('S3 Bucket Name not found for user');
    }

    const { Vpcs } = await ec2Client.send(
      new DescribeVpcsCommand({
        Filters: [{ Name: 'isDefault', Values: ['true'] }],
      })
    );

    const defaultVpcId = Vpcs?.[0]?.VpcId ?? null;

    const { Subnets } = await ec2Client.send(
      new DescribeSubnetsCommand({
        Filters: [{ Name: 'vpc-id', Values: [defaultVpcId!] }],
      })
    );

    const subnetIds: string[] = Subnets?.map(
      (subnet) => subnet.SubnetId
    ).filter(Boolean) as string[];

    const newBackup: Omit<IBackup, keyof Document> = {
      repoName: repo,
      owner: owner,
      state: 'pending'
    };

    const backup = await BackupModel.create(newBackup);

    const runTaskCommand = new RunTaskCommand({
      cluster: process.env.ECS_CLUSTER_NAME,
      taskDefinition: process.env.ECS_TASK_DEFINITION_ARN,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: subnetIds,
          assignPublicIp: 'ENABLED',
          securityGroups: [process.env.ECS_SECURITY_GROUP_ID!],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: process.env.ECS_CONTAINER_NAME,
            environment: [
              { name: 'REPO', value: repo },
              { name: 'OWNER', value: owner },
              { name: 'BACKUP_ID', value: backup._id.toString() },
              { name: 'GITHUB_TOKEN', value: githubToken },
              { name: 'S3_FOLDER_PATH', value: s3FolderPath },
              {
                name: 'AWS_S3_BUCKET_NAME',
                value: s3BucketName,
              },
              {
                name: 'AWS_ACCESS_KEY_ID',
                value: awsAccessKeyId,
              },
              {
                name: 'AWS_SECRET_ACCESS_KEY',
                value: awsSecretAccessKey,
              },
              {
                name: 'MONGODB_URI',
                value: process.env.MONGODB_URI!,
              },
            ],
          },
        ],
      },
    });

    await ecsClient.send(runTaskCommand);

    response = Response.json(
      {
        message: 'ECS task triggered successfully',
        backup: backup,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    response = Response.json('Failed to trigger ECS task', { status: 500 });
  }

  return response;
}
