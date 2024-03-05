"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useDebounce } from "usehooks-ts";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Alert, { AlertProps } from "@/components/Alert";
import FileList from "@/components/FileList";
import { RepoItem } from "@/types/repoItem";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicMetadata } from "@/types/metadata";
import { Github, Cloud } from "lucide-react";
import Link from "next/link";
import { useAlert } from "@/context/AlertProvider";

function Page() {
  const { user } = useUser();
  const publicMetadata: PublicMetadata = user?.publicMetadata || {};
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [hasMoreRepos, setHasMoreRepos] = useState(true);
   const { showAlert } = useAlert();

  const { data: repos, isLoading } = useQuery<RepoItem[], Error>({
    queryKey: ["repos", currentPage, debouncedSearchTerm],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/read-repos?page=${currentPage}&search=${debouncedSearchTerm}`
        );
        showAlert("GitHub repos fetched successfully.", "success");
        return response.data;
      } catch (error) {
        const err = error as AxiosError;
        if (axios.isAxiosError(error)) {
          showAlert(
            `Failed to fetch GitHub repos: ${err.response?.data}`,
            "error"
          );
          throw new Error(error.message);
        } else {
          showAlert("An unexpected error occurred", "error");
          throw new Error("An unexpected error occurred");
        }
      }
    },
  });

  useEffect(() => {
    setHasMoreRepos(repos?.length === 10);
  }, [repos]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      router.push("/dashboard/?page=" + (currentPage - 1));
    }
  };

  const handleNextPage = () => {
    if (hasMoreRepos) {
      router.push("/dashboard/?page=" + (currentPage + 1));
    }
  };

  if (!publicMetadata.githubId) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Please add your GitHub account to proceed.
        </h2>
        <Link
          href="/dashboard/connect-github"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <Github className="w-5 h-5" />
          Connect GitHub
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          If you have already connected your GitHub account, please refresh the
          page.
        </p>
      </div>
    );
  }

  if (!publicMetadata.awsKeysAdded) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Please add your AWS configuration to proceed.
        </h2>
        <Link
          href="/dashboard/aws-keys"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <Cloud className="w-5 h-5" />
          Configure AWS
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          If you have already configured your AWS keys, please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-16 relative">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">GitBack Repository Backup</h1>
        <p className="text-lg font-semibold text-gray-600">
          Securely back up your GitHub repositories with GitBack.
        </p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search repositories..."
          className="input input-bordered w-full max-w-xs"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="mt-8">
        <h2 className="text-lg ont-semibold mb-4  text-gray-500">
          {" "}
          Connected Repositories - Page {currentPage}
        </h2>

        <FileList loading={isLoading} repos={repos} />
      </div>

      <div className="flex justify-between mt-4">
        <button
          className={`btn ${currentPage <= 1 ? "btn-disabled" : ""}`}
          onClick={handlePreviousPage}
        >
          Previous
        </button>
        <button
          className={`btn ${!hasMoreRepos ? "btn-disabled" : ""}`}
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center mt-4">
          <div
            className="radial-progress animate-spin"
            //@ts-ignore
            style={{ "--value": 50, "--size": "3rem" }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default Page;
