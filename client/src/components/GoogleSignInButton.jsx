import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

const GoogleSignInButton = ({ usertype, recaptchaVerified, onSuccess, onError, disabled }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!usertype) {
      onError('Please select a User Type first.');
      return;
    }
    if (!recaptchaVerified) {
      onError('Please complete the reCAPTCHA verification first.');
      return;
    }

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get the Firebase ID token for the backend to verify
      const idToken = await result.user.getIdToken();
      
      // Pass the token to the parent component
      onSuccess(idToken);
    } catch (error) {
      console.error("Firebase Google Sign-In Error:", error);
      onError('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FcGoogle className="text-xl" />
      {loading ? "Signing in..." : "Continue with Google"}
    </button>
  );
};

export default GoogleSignInButton;
