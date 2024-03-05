'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  Database,
  GitBranch,
  RefreshCw,
  Copy,
} from 'lucide-react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { IBackup } from '@/model/BackUp';
import { CommitType } from '@/types/commitType';
import { RepositoryType } from '@/types/repositoryType';
import { useAlert } from '@/context/AlertProvider';

function Backup() {
  const searchParams = useSearchParams();
  const repo = searchParams.get('repo');
  const owner = searchParams.get('owner');
  const [repoDetails, setRepoDetails] = useState<RepositoryType | null>(null);
  const [latestCommit, setLatestCommit] = useState<CommitType | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [backupHistory, setBackupHistory] = useState<IBackup[]>([]);
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingBackupRequest, setLoadingBackupRequest] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  const fetchRepoDetails = useCallback(async () => {
    setLoadingRepo(true);
    try {
      const response = await axios.get(
        `/api/repo-details?repo=${repo}&owner=${owner}`
      );
      setRepoDetails(response.data.repoDetails);
      setLatestCommit(response.data.latestCommit);
      setBranches(response.data.branches);
      setSelectedBranch(response.data.repoDetails.default_branch);
    } catch (error) {
      console.error('Failed to fetch repo details:', error);
    } finally {
      setLoadingRepo(false);
    }
  }, [repo, owner]);

  const fetchBackupHistory = useCallback(async () => {
    setLoadingBackup(true);
    try {
      const response = await axios.get(
        `/api/backup-history?repo=${repo}&owner=${owner}`
      );
      setBackupHistory(response.data.backupHistory);
    } catch (error) {
      console.error('Failed to fetch backup history:', error);
    } finally {
      setLoadingBackup(false);
    }
  }, [repo, owner]);

  useEffect(() => {
    fetchRepoDetails();
    fetchBackupHistory();
  }, [fetchRepoDetails, fetchBackupHistory]);

  const handleBackupConfirm = async () => {
    setIsBackupDialogOpen(false);
    setLoadingBackupRequest(true);
    showAlert('Backup initiated...', 'info');
    try {
      const response = await axios.post('/api/backup', {
        branchName: selectedBranch,
        repo: repo,
        owner: owner,
      });
      const newBackupEntry = response.data.backup;
      setBackupHistory((prevBackupHistory) => [
        newBackupEntry,
        ...prevBackupHistory,
      ]);
    } catch (error) {
      console.error('Failed to initiate backup:', error);
    } finally {
      setLoadingBackupRequest(false);
    }
  };

  const copyToClipboard = (text: string | undefined) => {
    if (!text) text = '';
    navigator.clipboard.writeText(text);
    showAlert('Copied to clipboard!', 'success');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <button className="btn btn-ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      <>
        {loadingRepo ? (
          <div className="flex justify-center items-center h-64">
            <div
              className="radial-progress animate-spin"
              //@ts-ignore
              style={{ '--value': 50, '--size': '3rem' }}
            ></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Database className="text-primary w-6 h-6" />
                Backup:{' '}
                <span className="text-gray-700">{repoDetails?.name}</span>
              </h2>
              <button className="btn btn-primary" onClick={fetchRepoDetails}>
                <div className="tooltip" data-tip="Refresh Repo Details">
                  <RefreshCw className="w-5 h-5" />
                </div>
              </button>
            </div>
            <div className="card shadow-lg p-4 mb-6">
              <h3 className="text-xl font-semibold mb-2">Repository Details</h3>
              <div className="flex flex-col gap-4">
                <p>
                  <strong>Full Name:</strong>{' '}
                  <a
                    href={repoDetails?.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    {repoDetails?.full_name}
                  </a>
                </p>
                <p>
                  <strong>Description:</strong>{' '}
                  {repoDetails?.description || 'No description'}
                </p>
                <p>
                  <strong>Default Branch:</strong> {repoDetails?.default_branch}
                </p>
                {latestCommit && (
                  <p>
                    <strong>Latest Commit:</strong>{' '}
                    <span className="text-primary">
                      {latestCommit.commit.message}
                    </span>{' '}
                    by{' '}
                    <span className="text-secondary">
                      {latestCommit.author?.login}
                    </span>{' '}
                    on{' '}
                    {
                      <div className="badge badge-outline">
                        {latestCommit.commit.author?.date
                          ? dayjs(latestCommit.commit.author?.date).format(
                              'MMMM D, YYYY h:mm A'
                            )
                          : 'Unknown'}
                      </div>
                    }
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <strong>Branches:</strong>
                  <div className="dropdown">
                    <button className="btn m-1 flex items-center gap-2">
                      <GitBranch className="text-secondary" />
                      {selectedBranch} <ChevronDown className="ml-2" />
                    </button>
                    <ul className="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
                      {branches.map((branch) => (
                        <li key={branch}>
                          <a
                            className="cursor-pointer"
                            onClick={() => setSelectedBranch(branch)}
                          >
                            {branch}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="my-4">
                <button
                  className="btn btn-primary"
                  onClick={() => setIsBackupDialogOpen(true)}
                >
                  Start Backup
                </button>
              </div>
            </div>
          </>
        )}

        {isBackupDialogOpen && (
          <ConfirmationDialog
            isOpen={isBackupDialogOpen}
            onClose={() => setIsBackupDialogOpen(false)}
            onConfirm={() => {
              handleBackupConfirm();
              setIsBackupDialogOpen(false);
            }}
            title="Confirm Backup"
            message={`Are you sure you want to start a backup for the branch ${selectedBranch}?`}
          />
        )}

        <div className="card shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">Backup History</h3>
            <button className="btn btn-primary" onClick={fetchBackupHistory}>
              <div className="tooltip" data-tip="Refresh Backup History">
                <RefreshCw className="w-5 h-5" />
              </div>
            </button>
          </div>
          {loadingBackup ? (
            <div className="flex justify-center items-center h-64">
              <div
                className="radial-progress animate-spin"
                //@ts-ignore
                style={{ '--value': 50, '--size': '3rem' }}
              ></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Repository</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>S3 Key</th>
                  </tr>
                </thead>
                <tbody>
                  {backupHistory.map((item) => (
                    <tr key={item._id}>
                      <td>{item._id}</td>
                      <td>{item.repoName}</td>
                      <td>{item.owner}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.state === 'success'
                              ? 'badge-success'
                              : item.state === 'fail'
                              ? 'badge-error'
                              : 'badge-warning'
                          }`}
                        >
                          {item.state.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-2">
                          <Clock className="text-muted" />
                          {dayjs(item.createdAt).format('MMMM D, YYYY h:mm A')}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {item.s3Key}
                          <Copy
                            className="cursor-pointer"
                            onClick={() => copyToClipboard(item.s3Key)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
      {loadingBackupRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="radial-progress animate-spin"
            //@ts-ignore
            style={{ '--value': 50, '--size': '4rem' }}
          ></div>
          <p className="ml-2">Initiating Backup...</p>
        </div>
      )}
    </div>
  );
}

export default Backup;
