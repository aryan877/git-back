export type BackupHistoryItem = {
  id: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  date: string;
};
