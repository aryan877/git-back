'use client';
import { CheckCircle, Shield, Clock } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-base-100 py-16 md:py-24 mt-16 md:mt-24">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            GitHub Backups Made Simple with
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
              {' GitBack'}
            </span>
            <br /> Powered by AWS S3.
          </h1>
          <p className="max-w-md mx-auto mb-8">
            Protect your hard work with automated, secure backups of your GitHub
            repositories.
          </p>
          <div>
            <button className="btn btn-primary mr-4">Get Started</button>
            {/* <button className="btn btn-outline">Learn More</button> */}
          </div>
        </div>
      </section>

      {/* Pain Points & Solution */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Take Control of Your GitHub Backups
          </h2>
          <p className="text-center mb-12 max-w-sm mx-auto">
            No more manual backups, security worries, or complex setups. Secure
            your code with ease.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card shadow-lg text-center p-8">
              <Shield className="mx-auto mb-4 text-secondary w-10 h-10" />
              <h3 className="text-lg font-semibold mb-2">
                Your Keys, Your Control
              </h3>
              <p className="text-base-content">
                Bring your own AWS credentials for full ownership of your
                backups.
              </p>
            </div>
            <div className="card shadow-lg text-center p-8">
              <CheckCircle className="mx-auto mb-4 text-secondary w-10 h-10" />
              <h3 className="text-lg font-semibold mb-2">Effortless Setup</h3>
              <p className="text-base-content">
                Connect your GitHub account via OAuth in a few clicks.
              </p>
            </div>
            <div className="card shadow-lg text-center p-8">
              <Clock className="mx-auto mb-4 text-secondary w-10 h-10" />
              <h3 className="text-lg font-semibold mb-2">
                Private & Public Covered
              </h3>
              <p className="text-base-content">
                Securely back up all your repositories, regardless of
                visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center p-6 bg-base-200">
        © 2023 S3 GitHub Backup. All rights reserved.
      </footer>
    </>
  );
}
