"use client";

import React, { useState, useEffect } from "react";
import { Github } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

function ConnectGitHub() {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [isChecking, setIsChecking] = useState(true); // Add isChecking state

  useEffect(() => {
    const checkGithubConnection = async () => {
      try {
        const response = await axios.get("/api/check-github-connected");
        const { connected, githubUsername } = response.data;
        setIsConnected(connected);
        setGithubUsername(githubUsername || "");
      } catch (error) {
        console.error("Failed to check GitHub connection:", error);
        setIsConnected(false);
        setGithubUsername("");
      } finally {
        setIsChecking(false);
      }
    };

    if (user) {
      checkGithubConnection();
    }
  }, [user]);

  const handleConnectClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/api/github/callback`
    );
    const scope = encodeURIComponent("repo");
    const state = user?.id;

    const authorizationUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    window.location.href = authorizationUrl;
  };

  const handleDisconnectClick = async () => {
    try {
      await axios.post("/api/disconnect-github");
      setIsConnected(false);
      setGithubUsername("");
    } catch (error) {
      console.error("Failed to disconnect GitHub:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Connect GitHub</h2>

      <div className="card shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Github className="text-4xl mr-4 text-primary" />
          <h3 className="text-xl font-semibold">GitHub Integration</h3>
        </div>

        {isChecking ? (
          <div className="flex justify-center items-center">
            <div
              className="radial-progress animate-spin"
              //@ts-ignore
              style={{ "--value": 50, "--size": "3rem" }}
            ></div>
          </div>
        ) : isConnected ? (
          <>
            <p className="mb-4">
              You&apos;re currently connected to GitHub as {githubUsername}.
            </p>
            <button className="btn btn-error" onClick={handleDisconnectClick}>
              Disconnect
            </button>
          </>
        ) : (
          <>
            <p className="mb-4">
              Connect your GitHub account to enable awesome features!
            </p>
            <button className="btn btn-primary" onClick={handleConnectClick}>
              Connect GitHub
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ConnectGitHub;
