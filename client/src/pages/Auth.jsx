import { useState, useEffect, useRef } from 'react';
import { FcGoogle } from "react-icons/fc";
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";

const BRAND_GREEN = "#052e16";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const recaptchaRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [usertype, setUsertype] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Google OAuth and reCAPTCHA configuration
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  const backgroundVideoRef = useRef(null);
  const BACKGROUND_VIDEO_SRC = "/newvideo.mp4";

  // Load Google OAuth script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        console.log('Google OAuth already loaded');
        return;
      }
      
      console.log('Loading Google OAuth script...');
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Failed to load Google OAuth script');
        setErrors(prev => ({ ...prev, google: 'Failed to load Google OAuth. Please refresh the page.' }));
      };
      document.head.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      if (window.google && GOOGLE_CLIENT_ID !== 'your-google-client-id') {
        try {
          console.log('Initializing Google OAuth with client ID:', GOOGLE_CLIENT_ID);
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
          });
          console.log('Google OAuth initialized successfully');
        } catch (error) {
          console.error('Google OAuth initialization error:', error);
          setErrors(prev => ({ ...prev, google: 'Failed to initialize Google OAuth.' }));
        }
      } else {
        console.warn('Google OAuth client ID not configured properly');
      }
    };

    loadGoogleScript();
  }, [GOOGLE_CLIENT_ID]);

  // Keep the login background video playing whenever this page is shown
  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    playVideo();
    video.addEventListener("canplay", playVideo);
    video.addEventListener("pause", playVideo);

    return () => {
      video.removeEventListener("canplay", playVideo);
      video.removeEventListener("pause", playVideo);
    };
  }, []);

  // Load reCAPTCHA script
  useEffect(() => {
    const loadRecaptchaScript = () => {
      if (window.grecaptcha) {
        console.log('reCAPTCHA already loaded');
        setRecaptchaLoaded(true);
        return;
      }
      
      console.log('Loading reCAPTCHA script...');
      
      // Set up callback function
      window.recaptchaCallback = () => {
        console.log('reCAPTCHA script loaded successfully');
        setRecaptchaLoaded(true);
      };

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=recaptchaCallback&render=explicit`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script');
        setErrors(prev => ({ ...prev, recaptcha: 'Failed to load reCAPTCHA. Please refresh the page.' }));
      };
      document.head.appendChild(script);
    };

    loadRecaptchaScript();

    return () => {
      if (window.recaptchaCallback) {
        delete window.recaptchaCallback;
      }
    };
  }, []);

  useEffect(() => {
    if (recaptchaLoaded && window.grecaptcha && recaptchaRef.current) {
      try {
        console.log('Rendering reCAPTCHA with site key:', RECAPTCHA_SITE_KEY);
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: handleRecaptchaResponse,
          'expired-callback': handleRecaptchaExpired,
          'error-callback': handleRecaptchaError
        });
        console.log('reCAPTCHA rendered successfully');
      } catch (error) {
        console.error('reCAPTCHA render error:', error);
        setErrors(prev => ({ ...prev, recaptcha: 'Failed to initialize reCAPTCHA. Please refresh the page.' }));
      }
    }
  }, [recaptchaLoaded]);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);
      console.log('Google OAuth response received:', response);
      
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const googleUser = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        };

        console.log('Google user authenticated:', googleUser);
        
        localStorage.setItem('authToken', response.credential);
        localStorage.setItem('user', JSON.stringify(googleUser));
        
        setTimeout(() => {
          alert(`Google authentication successful! Welcome ${googleUser.name}!`);
          setLoading(false);
          
          if (window.grecaptcha && recaptchaRef.current) {
            window.grecaptcha.reset();
            setRecaptchaVerified(false);
          }
          
          window.location.href = '/dashboard';
        }, 1000);
        
      } catch (decodeError) {
        console.error('Error decoding Google token:', decodeError);
        setErrors({ general: 'Google authentication failed. Invalid token received.' });
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Google auth error:', error);
      setErrors({ general: 'Google authentication failed. Please try again.' });
      setLoading(false);
    }
  };

  const handleRecaptchaResponse = (token) => {
    console.log('reCAPTCHA verified:', token);
    setRecaptchaVerified(true);
    setErrors(prev => ({ ...prev, recaptcha: '' }));
  };

  const handleRecaptchaExpired = () => {
    console.log('reCAPTCHA expired');
    setRecaptchaVerified(false);
    setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA expired. Please verify again.' }));
  };

  const handleRecaptchaError = () => {
    console.log('reCAPTCHA error');
    setRecaptchaVerified(false);
    setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA error. Please try again.' }));
  };

  const handleGoogleSignIn = () => {
    if (!recaptchaVerified) {
      setErrors({ general: 'Please complete the reCAPTCHA verification first.' });
      return;
    }

    if (window.google && window.google.accounts) {
      try {
        console.log('Initiating Google sign-in...');
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error('Google sign-in error:', error);
        setErrors({ general: 'Failed to initiate Google sign-in. Please try again.' });
      }
    } else {
      console.log('Google OAuth not ready yet');
      setErrors({ general: 'Google OAuth is loading. Please wait a moment and try again.' });
    }
  };

  const checkDetails = (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setErrors({ general: 'Please enter both username and password' });
      return;
    }
    
    if (!recaptchaVerified) {
      setErrors({ general: 'Please complete the reCAPTCHA verification' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    setTimeout(() => {
      if (password === "admin12345" && username === "Hariom") {
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify({ 
          username, 
          loginTime: new Date().toISOString(),
          rememberDevice
        }));
        if (usertype === "Farmer" || usertype === "Trader") {
          window.location.href = usertype === "Farmer" ? '/dashboard' : '/trader';
        } else {
          setErrors({ general: 'Please select user type.' });
        }
      } else {
        setErrors({ general: 'Invalid username or password.' });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      <video
        ref={backgroundVideoRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
        src={BACKGROUND_VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/35" aria-hidden="true" />

      <div className="flex flex-wrap relative z-10">
        <img src="/logo.png" alt="logo loading..." className="w-10 h-10 sm:w-15 sm:h-15 position-fixed overflow-y-hidden m-2 sm:m-3"/>
        <div className='flex gap-4'>
          <h1 style={{fontFamily: "sans-serif"}} className={`sm:pt-5 text-xl text-[#052e16] sm:text-3xl font-bold `}>Ex-Farmer</h1>
          <h2 style={{fontFamily: "sans-serif"}} className={`sm:pt-5 text-[10px] sm:text-3xl font-medium text-gray-200`}>Smart & Climate Resilient Agriculture</h2>
        </div>
        
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[640px] flex-col items-center px-4 py-8 sm:py-10">
        <div className="w-full rounded-[28px] border border-white/70 bg-white px-7 sm:px-10 py-8 shadow-[0_24px_60px_rgba(5,46,22,0.18)]">
          
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1 text-[15px] text-slate-500 mb-4">Sign in to continue to your Ex-Farmer dashboard.</p>


          <form onSubmit={checkDetails} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-700">
                USER TYPE <span className="text-red-500">*</span>
              </label>
              <select
                value={usertype}
                onChange={(e) => setUsertype(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-[15px] text-slate-800 outline-none transition focus:border-[#052e16] focus:ring-2 focus:ring-[#052e16]/15"
              >
                <option value="" disabled>Select User</option>
                <option value="Farmer">Farmer</option>
                <option value="Trader">Trader</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-700">
                USERNAME <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#052e16] focus:ring-2 focus:ring-[#052e16]/15"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[11px] font-bold tracking-wide text-slate-700">
                  PASSWORD <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  className="text-[13px] font-medium"
                  style={{ color: BRAND_GREEN }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#052e16] focus:ring-2 focus:ring-[#052e16]/15"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-slate-700">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-[#052e16]"
              />
              Remember device for 30 days
            </label>

            <div>
              <div ref={recaptchaRef} className="flex justify-center overflow-x-auto"></div>
              {errors.recaptcha && <p className="mt-2 text-center text-sm text-red-500">{errors.recaptcha}</p>}
            </div>
            <button
              type="submit"
              disabled={loading || !recaptchaVerified}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed"
              style={{ backgroundColor: BRAND_GREEN }}
            >
              {loading ? "Signing in..." : "Sign In"}
             
            </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-semibold tracking-[0.14em] text-slate-400">OR SIGN IN WITH GOOGLE</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          {errors.general && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <span className="font-semibold" style={{ color: BRAND_GREEN }}>
              Contact your administrator
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;