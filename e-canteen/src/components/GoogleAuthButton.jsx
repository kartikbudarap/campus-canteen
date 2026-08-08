import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function GoogleAuthButton({ onGoogleAuth, setError, disabled = false }) {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
          <span className="h-px flex-1 bg-surface-200" /> or continue with <span className="h-px flex-1 bg-surface-200" />
        </div>
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-surface-200 bg-white px-4 py-3 text-sm font-semibold text-surface-400 opacity-75"
        >
          <span className="text-base font-black">G</span>
          Continue with Google
        </button>
        <p className="mt-2 text-center text-xs text-amber-700">
          Google sign-in needs a client ID in the environment settings.
        </p>
      </div>
    );
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
        <span className="h-px flex-1 bg-surface-200" /> or continue with <span className="h-px flex-1 bg-surface-200" />
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={({ credential }) => onGoogleAuth(credential)}
          onError={() => setError('Google sign-in was cancelled or failed')}
          useOneTap={false}
          shape="pill"
          size="large"
          width="400"
          text="continue_with"
        />
      </div>
      <p className="mt-3 text-center text-xs text-surface-400">
        Google accounts are registered as Student accounts.
      </p>
    </div>
  );
}
