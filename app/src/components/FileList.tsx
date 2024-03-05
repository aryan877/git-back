import React from 'react';
import dayjs from 'dayjs';
import { RepoItem } from '@/types/repoItem';
import { Lock, Globe, GitBranch } from 'lucide-react';
import Link from 'next/link';

type FileListProps = {
  loading: boolean;
  repos: RepoItem[] | undefined;
};

const FileList: React.FC<FileListProps> = ({ loading, repos }) => {
  if (repos?.length === 0 && !loading) {
    return <div className="text-center">No repos connected yet.</div>;
  }
  const formatDate = (timestamp: Date) =>
    dayjs(timestamp).format('DD MMM YYYY HH:mm');

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Visibility</th>
            <th>Branches</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {repos?.map((repo, index) => (
            <tr key={index}>
              <td>
                <div className="flex items-center">
                  {repo.isPrivate ? (
                    <Lock size={18} className="mr-2 text-red-500" />
                  ) : (
                    <Globe size={18} className="mr-2" />
                  )}
                  <Link
                    href={`/dashboard/backup?repo=${repo.name}&owner=${repo.ownerName}`}
                    className="link link-primary"
                  >
                    {repo.name}
                  </Link>
                </div>
              </td>
              <td>{repo.isPrivate ? 'Private' : 'Public'}</td>
              <td>
                <GitBranch size={18} className="mr-2" />
                {repo.defaultBranch}
              </td>
              <td>{formatDate(repo.updatedAt)}</td>
              <td>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={repo.url}
                  className="btn btn-xs btn-outline mr-2"
                >
                  Open
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
