export type PrivateMetadata = {
  awsAccessKey?: string | null;
  awsSecretKey?: string | null;
  s3FolderPath?: string | null;
  awsRegion?: string | null;
  githubToken?: string | null;
  s3BucketName?: string | null;
};

export type PublicMetadata = {
  awsKeysAdded?: boolean | null;
  githubUsername?: string | null;
  githubId?: number | null;
  githubAvatarUrl?: string | null;
};
