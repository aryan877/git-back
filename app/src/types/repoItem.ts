// Type definition for a single repository item in the table list
export type RepoItem = {
  repoId: number; 
  name: string;
  url: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
  defaultBranch: string;
  ownerName: string;
};
