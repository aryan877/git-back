import mongoose, { Schema, Document } from 'mongoose';

export interface IBackup extends Document {
  repoName: string;
  owner: string;
  s3Key?: string;
  state: 'pending' | 'success' | 'fail';
  failReason?: string;
  createdAt?: Date;
}

const BackupSchema: Schema<IBackup> = new mongoose.Schema(
  {
    repoName: {
      type: String,
      required: [true, 'Repository name is required'],
    },
    owner: {
      type: String,
      required: [true, 'Owner is required'],
    },
    s3Key: {
      type: String,
    },
    state: {
      type: String,
      required: [true, 'Backup state is required'],
      enum: ['pending', 'success', 'fail'],
      default: 'pending',
    },
    failReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const BackupModel =
  (mongoose.models.Backup as mongoose.Model<IBackup>) ||
  mongoose.model<IBackup>('Backup', BackupSchema);

export default BackupModel;
