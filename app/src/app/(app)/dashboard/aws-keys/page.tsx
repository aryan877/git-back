'use client';

import { useAlert } from '@/context/AlertProvider';
import { addAWSSchema } from '@/schemas/addAWSSchema';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormData = z.infer<typeof addAWSSchema>;

function ConnectAWS() {
  const { user } = useUser();
  const [keysAdded, setKeysAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingKeys, setIsCheckingKeys] = useState(true);
  const { showAlert } = useAlert();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(addAWSSchema),
  });

  useEffect(() => {
    const checkAwsConnection = async () => {
      try {
        const response = await axios.get('/api/check-aws-connected');
        const { connected } = response.data;
        setKeysAdded(connected);
      } catch (error) {
        console.error('Failed to check AWS connection:', error);
        setKeysAdded(false);
      } finally {
        setIsCheckingKeys(false);
      }
    };

    if (user) {
      checkAwsConnection();
    }
  }, [user]);

  const handleSaveClick = async (formData: FormData) => {
    try {
      setIsLoading(true);
      await axios.post('/api/add-aws-keys', formData);
      setKeysAdded(true);
      showAlert('AWS keys saved successfully!', 'success');
      reset();
    } catch (error) {
      console.error('Failed to save AWS keys:', error);
      showAlert('Failed to save AWS keys', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    try {
      setIsLoading(true);
      await axios.post('/api/delete-aws-keys');
      setKeysAdded(false);
      showAlert('AWS keys deleted successfully!', 'success');
      reset();
    } catch (error) {
      console.error('Failed to delete AWS keys:', error);
      showAlert('Failed to delete AWS keys. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Connect AWS</h2>
      {isCheckingKeys ? (
        <div className="flex justify-center items-center">
          <div
            className="radial-progress animate-spin"
            //@ts-ignore
            style={{ '--value': 50, '--size': '3rem' }}
          ></div>
        </div>
      ) : (
        <div className="card shadow-lg p-6">
          {keysAdded ? (
            <>
              <p className="mb-4">Your AWS keys are configured.</p>
              <button
                className="btn btn-error"
                onClick={handleDeleteClick}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Keys'}
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit(handleSaveClick)}>
              <div className="mb-4">
                <input
                  {...register('awsAccessKey')}
                  type="text"
                  placeholder="AWS Access Key"
                  className="input input-bordered w-full"
                />
                {errors.awsAccessKey && (
                  <p className="text-red-500">{errors.awsAccessKey.message}</p>
                )}
              </div>
              <div className="mb-4">
                <input
                  {...register('awsSecretKey')}
                  type="text"
                  placeholder="AWS Secret Key"
                  className="input input-bordered w-full"
                />
                {errors.awsSecretKey && (
                  <p className="text-red-500">{errors.awsSecretKey.message}</p>
                )}
              </div>
              <div className="mb-4">
                <input
                  {...register('s3BucketName')}
                  type="text"
                  placeholder="S3 Bucket Name"
                  className="input input-bordered w-full"
                />
                {errors.s3BucketName && (
                  <p className="text-red-500">{errors.s3BucketName.message}</p>
                )}
              </div>
              <div className="mb-4">
                <input
                  {...register('s3FolderPath')}
                  type="text"
                  placeholder="S3 Bucket Path (optional)"
                  className="input input-bordered w-full"
                />
                {errors.s3FolderPath && (
                  <p className="text-red-500">{errors.s3FolderPath.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  If not specified, defaults to the root of the bucket. For
                  example, use github-backup/user to specify a folder, but avoid
                  trailing slashes.
                </p>
              </div>
              <div className="mb-4">
                <input
                  {...register('awsRegion')}
                  type="text"
                  placeholder="AWS Region"
                  className="input input-bordered w-full"
                />
                {errors.awsRegion && (
                  <p className="text-red-500">{errors.awsRegion.message}</p>
                )}
              </div>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Keys'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default ConnectAWS;
