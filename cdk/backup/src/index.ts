import { Octokit } from '@octokit/rest';
import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as archiver from 'archiver';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mongoose, { Schema, model, connect, disconnect } from 'mongoose';

const git: SimpleGit = simpleGit();

interface IBackup {
  _id: mongoose.Types.ObjectId;
  repoName: string;
  owner: string;
  s3Key?: string;
  state: 'pending' | 'success' | 'fail';
  failReason?: string;
}

const BackupSchema = new Schema<IBackup>({
  repoName: { type: String, required: true },
  owner: { type: String, required: true },
  s3Key: String,
  state: { type: String, required: true, enum: ['pending', 'success', 'fail'] },
  failReason: String,
});

const BackupModel = model<IBackup>('Backup', BackupSchema);

async function updateBackupStatus(
  backupId: string,
  updateData: Pick<IBackup, 'state' | 's3Key' | 'failReason'>
): Promise<void> {
  await connect(process.env.MONGODB_URI!);
  await BackupModel.findByIdAndUpdate(backupId, updateData);
  await disconnect();
}

async function archiveAndUploadToS3(
  cloneDirectory: string,
  zipDirectory: string,
  s3FolderPath: string | undefined,
  s3BucketName: string,
  repoName: string,
  awsAccessKeyId: string,
  awsSecretAccessKey: string,
  awsRegion: string
): Promise<string> {
  const s3Client = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    },
  });

  const date: string = new Date().toISOString().split('T')[0];
  const randomDigits: string = Math.floor(Math.random() * 10000).toString();
  const zipFileName: string = `${repoName}-${randomDigits}.zip`;
  const zipPath: string = path.join(zipDirectory, zipFileName);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver.create('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(cloneDirectory, false);
  await archive.finalize();

  const fileStream = fs.createReadStream(zipPath);

  const keyPrefix = s3FolderPath ? `${s3FolderPath}/` : '';
  const s3Key = `${keyPrefix}${date}/${randomDigits}-${repoName}.zip`;

  const putParams = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: s3Key,
    Body: fileStream,
    ContentType: 'application/zip',
  });

  await s3Client.send(putParams);

  return s3Key;
}

function isValidRepoName(repo: string): boolean {
  return /^[a-z0-9-]+$/i.test(repo);
}

async function processRepository(
  backupId: string,
  repo: string,
  owner: string,
  s3FolderPath: string | undefined,
  s3BucketName: string,
  githubToken: string,
  awsAccessKeyId: string,
  awsSecretAccessKey: string,
  awsRegion: string
): Promise<void> {
  if (!repo || !owner || !isValidRepoName(repo)) {
    throw new Error('Missing or invalid parameters');
  }

  try {
    const octokit = new Octokit({ auth: githubToken });
    const { data: repoDetails } = await octokit.repos.get({ owner, repo });

    const cloneDirectory: string = path.join(process.cwd(), 'clone-temp');
    const zipDirectory: string = path.join(process.cwd(), 'zip-temp');
    fs.mkdirSync(cloneDirectory, { recursive: true });
    fs.mkdirSync(zipDirectory, { recursive: true });

    await git.clone(
      repoDetails.clone_url.replace('https://', `https://${githubToken}@`),
      cloneDirectory
    );

    const s3Key = await archiveAndUploadToS3(
      cloneDirectory,
      zipDirectory,
      s3FolderPath,
      s3BucketName,
      repo,
      awsAccessKeyId,
      awsSecretAccessKey,
      awsRegion
    );

    await updateBackupStatus(backupId, { state: 'success', s3Key });

    fs.rmSync(cloneDirectory, { recursive: true, force: true });
    fs.rmSync(zipDirectory, { recursive: true, force: true });
  } catch (error: any) {
    await updateBackupStatus(backupId, {
      state: 'fail',
      failReason: error.message,
    });
    throw error;
  }
}

async function handleError(error: Error): Promise<void> {
  console.error('Error:', error.message);
  process.exit(1);
}

async function main(): Promise<void> {
  try {
    const backupId = process.env.BACKUP_ID;
    const repo = process.env.REPO;
    const owner = process.env.OWNER;
    const s3FolderPath = process.env.S3_FOLDER_PATH || '';
    const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
    const githubToken = process.env.GITHUB_TOKEN;
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const awsRegion = process.env.AWS_REGION;

    if (
      !backupId ||
      !repo ||
      !owner ||
      !s3BucketName ||
      !githubToken ||
      !awsAccessKeyId ||
      !awsSecretAccessKey ||
      !awsRegion
    ) {
      throw new Error(
        'Missing required environment variables. Ensure BACKUP_ID, REPO, OWNER, S3_FOLDER_PATH, AWS_S3_BUCKET_NAME, GITHUB_TOKEN, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION are set.'
      );
    }

    await processRepository(
      backupId,
      repo,
      owner,
      s3FolderPath,
      s3BucketName,
      githubToken,
      awsAccessKeyId,
      awsSecretAccessKey,
      awsRegion
    );
    console.log('Repository processed successfully');
    process.exit(0);
  } catch (error: any) {
    await handleError(error);
  }
}

main();
