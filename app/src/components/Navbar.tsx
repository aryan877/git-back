'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { truncate } from '@/helpers/truncate';
import { useClerk } from '@clerk/nextjs';

function Navbar() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="navbar bg-base-200 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4">
        <a href="#" className="font-bold text-xl text-primary">
          GitBack
        </a>

        {/* User Info & Actions */}
        <div className="flex items-center">
          {isSignedIn ? (
            <>
              <span className="mr-4 text-base-content">
                Welcome,{' '}
                {truncate(
                  user.firstName ||
                    user.username ||
                    user.emailAddresses[0].emailAddress
                )}
              </span>
              <button
                className="btn btn-sm btn-outline btn-accent"
                onClick={() => {
                  signOut();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/sign-in" className="btn btn-sm btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
