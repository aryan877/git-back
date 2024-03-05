import { z } from 'zod';

const validAwsRegions = [
  'us-east-1', // N. Virginia
  'us-east-2', // Ohio
  'us-west-1', // N. California
  'us-west-2', // Oregon
  'af-south-1', // Cape Town
  'ap-east-1', // Hong Kong
  'ap-south-1', // Mumbai
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'ap-northeast-3', // Osaka
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-southeast-3', // Jakarta
  'ca-central-1', // Canada (Central)
  'eu-central-1', // Frankfurt
  'eu-west-1', // Ireland
  'eu-west-2', // London
  'eu-west-3', // Paris
  'eu-south-1', // Milan
  'eu-north-1', // Stockholm
  'me-south-1', // Bahrain
  'sa-east-1', // São Paulo
] as const;

export const addAWSSchema = z.object({
  awsAccessKey: z.string().length(20, 'Invalid AWS Access Key'),
  awsSecretKey: z.string().length(40, 'Invalid AWS Secret Key'),
  s3FolderPath: z.string().optional(),
  awsRegion: z.enum([...validAwsRegions]),
  s3BucketName: z.string().min(1, 'Invalid S3 Bucket Name'),
});
