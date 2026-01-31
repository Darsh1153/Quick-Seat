import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';
import { UserCheckIcon, CopyIcon, CheckCircleIcon } from 'lucide-react';

const MakeAdmin = () => {
  const { user } = useUser();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUserId = user?.id || '';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('User ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const makeAdmin = async (targetUserId) => {
    if (!targetUserId) {
      toast.error('Please enter a User ID');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/api/internal/make-admin', {
        method: 'POST',
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (response.success) {
        toast.success('User successfully promoted to admin!');
        setUserId('');
        // Refresh the page after a short delay to update admin status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to make user admin');
      }
    } catch (error) {
      console.error('Error making admin:', error);
      const errorMessage = error.message || 'Failed to make user admin. Please check the User ID.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeCurrentUserAdmin = () => {
    if (currentUserId) {
      makeAdmin(currentUserId);
    } else {
      toast.error('User ID not available. Please sign in.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <UserCheckIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Make User Admin</h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Use this page to promote users to admin. You can make yourself admin or enter another user's ID.
        </p>

        {/* Current User Section */}
        {user && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h2 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
              Your Account
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                  {user.primaryEmailAddress?.emailAddress || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  User ID
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 dark:text-gray-100 font-mono text-sm flex-1 break-all">
                    {currentUserId}
                  </p>
                  <button
                    onClick={() => copyToClipboard(currentUserId)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                    title="Copy User ID"
                  >
                    {copied ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <CopyIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={handleMakeCurrentUserAdmin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Make Me Admin'}
              </button>
            </div>
          </div>
        )}

        {/* Make Other User Admin */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3">Make Another User Admin</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user_xxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You can find User IDs in your Clerk Dashboard → Users
              </p>
            </div>
            <button
              onClick={() => makeAdmin(userId)}
              disabled={loading || !userId.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Make User Admin'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> After making yourself admin, you'll be redirected and can access the{' '}
            <a href="/admin" className="underline font-medium">admin dashboard</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MakeAdmin;
