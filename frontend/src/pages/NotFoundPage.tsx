import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-extrabold text-brand-600 dark:text-brand-400">404</h1>
      <h2 className="text-xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">Page Not Found</h2>
      <p className="text-xs text-zinc-500 mt-1 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary" size="md">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
