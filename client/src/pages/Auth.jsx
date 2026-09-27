import { useState, useEffect, useRef } from 'react';
import { FcGoogle } from "react-icons/fc";
import { Lock, Mail, Eye, EyeOff, Check, User } from "lucide-react";
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;
const BRAND_GREEN = "#052e16";

const plans = [
  {
    name: "Basic Farmer",
    price: "Free",
    description: "Essential tools for small-scale farming and planning.",
    features: [
      "Basic Weather Forecast",
      "Standard Crop Recommendations",
      "Community Forum Access",
      "Market Price Updates (Daily)"
    ],
    buttonText: "Get Started",
    popular: false
  },
  {
    name: "Pro Farmer",
    price: "₹499",
    period: "/mo",
    description: "Advanced analytics and AI tools for commercial yield.",
    features: [
      "AI Plant Disease Detection",
      "Satellite Imagery (NDVI, Soil Moisture)",
      "Smart Irrigation Scheduling",
      "Priority Expert Support"
    ],
    buttonText: "Subscribe Now",
    popular: true
  },
  {
    name: "Trader / Enterprise",
    price: "₹1499",
    period: "/mo",
    description: "Comprehensive data and networking for agri-businesses.",
    features: [
      "Direct Farmer Connections",
      "Advanced Market Analytics",
      "Bulk Procurement Tools",
      "API Access & Custom Reports"
    ],
    buttonText: "Contact Sales",
    popular: false
  }
];

const OTPInput = ({ otp, setOtp }) => {
  const inputs = useRef([]);
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };
  return (
    <div className="flex gap-2 justify-center my-4">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => inputs.current[index] = el}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-slate-300 focus:border-[#052e16] focus:ring-2 focus:ring-[#052e16]/20 outline-none transition-all"
        />
      ))}
    </div>
  );
};

const Auth = () => {
  const [view, setView] = useState('signin'); // 'signin', 'signup', 'forgot'
  
  const [loading, setLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const recaptchaRef = useRef(null);
  
  const [errors, setErrors] = useState({});
  const [emailCheckError, setEmailCheckError] = useState("");
  
  const [usertype, setUsertype] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

  // Resend OTP Timer
  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [timer]);

  // Google OAuth and reCAPTCHA configuration
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeHGdItAAAAAMkfo9nFUTdsQ-vEQeuBR9fQ-fJW';

  const backgroundVideoRef = useRef(null);
  const BACKGROUND_VIDEO_SRC = "/newvideo.mp4";

  // Reset state when switching views
  const switchView = (newView) => {
    setView(newView);
    setOtpSent(false);
    setTimer(0);
    setOtpValues(['', '', '', '', '', '']);
    setErrors({});
    setEmailCheckError("");
  };

  // Load Google OAuth script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) return;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => setErrors(prev => ({ ...prev, google: 'Failed to load Google OAuth.' }));
      document.head.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      if (window.google && GOOGLE_CLIENT_ID !== 'your-google-client-id') {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
          });
        } catch (error) {
          setErrors(prev => ({ ...prev, google: 'Failed to initialize Google OAuth.' }));
        }
      }
    };
    loadGoogleScript();
  }, [GOOGLE_CLIENT_ID, usertype]); 

  // Keep the login background video playing
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
        setRecaptchaLoaded(true);
        return;
      }
      window.recaptchaCallback = () => setRecaptchaLoaded(true);
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=recaptchaCallback&render=explicit`;
      script.async = true;
      script.defer = true;
      script.onerror = () => setErrors(prev => ({ ...prev, recaptcha: 'Failed to load reCAPTCHA.' }));
      document.head.appendChild(script);
    };
    loadRecaptchaScript();
    return () => {
      if (window.recaptchaCallback) delete window.recaptchaCallback;
    };
  }, []);

  useEffect(() => {
    if (recaptchaLoaded && window.grecaptcha && recaptchaRef.current) {
      if (!recaptchaRef.current.hasChildNodes()) {
        try {
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: () => {
              setRecaptchaVerified(true);
              setErrors(prev => ({ ...prev, recaptcha: '' }));
            },
            'expired-callback': () => {
              setRecaptchaVerified(false);
              setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA expired. Please verify again.' }));
            },
            'error-callback': () => {
              setRecaptchaVerified(false);
              setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA error. Please try again.' }));
            }
          });
        } catch (error) {
          setErrors(prev => ({ ...prev, recaptcha: 'Failed to initialize reCAPTCHA.' }));
        }
      }
    }
  }, [recaptchaLoaded]);

  // Check email on blur
  const checkEmailExists = async () => {
    if (!email || view !== 'signup') return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.exists) {
        setEmailCheckError("Account already exists with this email.");
      } else {
        setEmailCheckError("");
      }
    } catch (err) {
      console.error('Email check failed', err);
    }
  };

  // Google OAuth Response
  const handleGoogleResponse = async (response) => {
    if (!usertype) {
        setErrors({ general: 'Please select a User Type before signing in with Google.' });
        return;
    }
    
    try {
      setLoading(true);
      setErrors({});
      
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential, user_type: usertype })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErrors({ general: data.message || 'Google authentication failed.' });
      } else {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (window.grecaptcha && recaptchaRef.current) {
          window.grecaptcha.reset();
        }
        
        alert(`Google authentication successful! Welcome ${data.user.name}!`);
        window.location.href = data.user.user_type === "Farmer" ? '/dashboard' : '/trader';
      }
    } catch (error) {
      setErrors({ general: 'Server error during Google authentication.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!usertype) {
      setErrors({ general: 'Please select a User Type first.' });
      return;
    }
    if (!recaptchaVerified) {
      setErrors({ general: 'Please complete the reCAPTCHA verification first.' });
      return;
    }

    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      setErrors({ general: 'Google OAuth is loading. Please wait.' });
    }
  };

  // Flow: SIGN IN
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password || !usertype) {
      setErrors({ general: 'Please fill all fields' });
      return;
    }
    if (!recaptchaVerified) {
      setErrors({ general: 'Please complete the reCAPTCHA' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, user_type: usertype })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErrors({ general: data.message || 'Login failed' });
      } else {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = data.user.user_type === "Farmer" ? '/dashboard' : '/trader';
      }
    } catch (err) {
      setErrors({ general: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Flow: SIGN UP (Init -> Verify)
  const handleSignUpInit = async (e) => {
    e.preventDefault();
    if (emailCheckError) return;
    if (!name || !email || !password || !usertype) {
        setErrors({ general: 'Please fill all fields' });
        return;
    }
    if (!recaptchaVerified) {
      setErrors({ general: 'Please complete the reCAPTCHA' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, user_type: usertype })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErrors({ general: data.message || 'Signup failed' });
      } else {
        setOtpSent(true);
        setTimer(10);
      }
    } catch (err) {
      setErrors({ general: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpVerify = async (e) => {
    e.preventDefault();
    const otpCode = otpValues.join('');
    if (otpCode.length < 6) {
        setErrors({ general: 'Please enter the complete 6-digit OTP' });
        return;
    }
    
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, user_type: usertype, otp: otpCode })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErrors({ general: data.message || 'Verification failed' });
      } else {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert("Sign up successful!");
        window.location.href = data.user.user_type === "Farmer" ? '/dashboard' : '/trader';
      }
    } catch (err) {
      setErrors({ general: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Flow: FORGOT PASSWORD (Init -> Verify)
  const handleForgotInit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrors({ general: 'Please enter your email.' });
      return;
    }
    if (!recaptchaVerified) {
      setErrors({ general: 'Please complete the reCAPTCHA' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.message || 'Failed to send reset code.' });
      } else {
        setOtpSent(true);
        setTimer(10);
      }
    } catch (err) {
      setErrors({ general: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async (e) => {
    e.preventDefault();
    const otpCode = otpValues.join('');
    if (otpCode.length < 6) {
        setErrors({ general: 'Please enter the complete 6-digit OTP' });
        return;
    }
    if (!password) {
        setErrors({ general: 'Please enter a new password' });
        return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, new_password: password })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.message || 'Failed to reset password.' });
      } else {
        alert("Password reset successfully! You can now sign in.");
        switchView('signin');
      }
    } catch (err) {
      setErrors({ general: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };


  // Master Submit Handler
  const handleSubmit = (e) => {
    if (view === 'signin') {
      handleSignIn(e);
    } else if (view === 'signup') {
      if (otpSent) handleSignUpVerify(e);
      else handleSignUpInit(e);
    } else if (view === 'forgot') {
      if (otpSent) handleForgotVerify(e);
      else handleForgotInit(e);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 flex flex-col font-sans">
      
      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 sm:px-8 py-1.5 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Farmmate Logo" className="w-9 h-9 object-contain" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-[#052e16] leading-tight">Farmmate</h1>
            <h2 className="text-[10px] font-medium text-slate-600 tracking-wide">Smart & Climate Resilient Agriculture</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <a href="#documentation" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-[#052e16] transition-colors">Documentation</a>
          <a href="#subscription" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-[#052e16] transition-colors">Subscription</a>
          <button 
            onClick={() => {
              switchView('signin');
              document.getElementById('signin-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-1.5 bg-[#052e16] text-white text-sm font-medium rounded-full shadow-md hover:bg-[#052e16]/90 transition-all hover:shadow-lg"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* ── Hero / Auth Section ───────────────────────────────────────── */}
      <div id="signin-section" className="relative min-h-screen flex items-center justify-center pt-16">
        
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
          <video
            ref={backgroundVideoRef}
            className="h-full w-full object-cover opacity-80"
            src={BACKGROUND_VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-[640px] px-4 py-10">
          <div className="w-full rounded-[28px] border border-white/70 bg-white px-7 sm:px-10 py-8 shadow-[0_24px_60px_rgba(5,46,22,0.18)] transition-all">
            
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-slate-900">
              {view === 'signup' ? "Create an account" : view === 'forgot' ? "Reset Password" : "Welcome back"}
            </h1>
            <p className="mt-1 text-[15px] text-slate-500 mb-6">
              {view === 'signup' ? "Join Farmmate to manage your agriculture." 
               : view === 'forgot' ? "Enter your email to receive a password reset code." 
               : "Sign in to continue to your dashboard."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* === VIEW: FORGOT PASSWORD === */}
              {view === 'forgot' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-700">
                      EMAIL ADDRESS <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email Address"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#052e16] focus:ring-2 focus:ring-[#052e16]/15"
                        required
                        disabled={otpSent}
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="mb-1.5 mt-4 block text-[11px] font-bold tracking-wide text-slate-700 text-center">
                        ENTER 6-DIGIT OTP
                      </label>
                      <OTPInput otp={otpValues} setOtp={setOtpValues} />
                      
                      <div className="mt-2 flex justify-center">
                        {timer > 0 ? (
                          <span className="text-xs text-slate-400 font-medium">Resend OTP in {timer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleForgotInit}
                            className="text-xs font-semibold hover:underline" style={{ color: BRAND_GREEN }}
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-700">
                          NEW PASSWORD <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter New Password"
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-[15px] text-slate-800 outline-none transition focus:border-[#052e16] focus:ring-2 focus:ring-[#052e16]/15"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* === VIEW: SIGN IN / SIGN UP === */}
              {view !== 'forgot' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-700">
                      USER TYPE <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={usertype}
                      onChange={(e) => setUsertype(e.target.value)}
                      disabled={otpSent}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-[15px] text-slate-800 outline-none transition focus:border-[#052e16] focus:ring-2 focus:ring-[#052e16]/15 disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value="" disabled>Select User</option>
                      <option value="Farmer">Farmer</option>
                      <option value="Trader">Trader</option>
                    </select>
                  </div>

                  {view === 'signup' && (
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-700">
                        FULL NAME <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={otpSent}
                          placeholder="Enter your full name"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#052e16] focus:ring-2 focus:ring-[#052e16]/15 disabled:bg-slate-50"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-700">
                      EMAIL ADDRESS <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={checkEmailExists}
                        disabled={otpSent}
                        placeholder="Enter Email Address"
                        className={`h-12 w-full rounded-xl border ${emailCheckError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#052e16] focus:ring-[#052e16]/15'} bg-white pl-10 pr-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50`}
                        required
                      />
                    </div>
                    {emailCheckError && <p className="mt-1 text-xs text-red-500">{emailCheckError}</p>}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-[11px] font-bold tracking-wide text-slate-700">
                        PASSWORD <span className="text-red-500">*</span>
                      </label>
                      {view === 'signin' && (
                        <button type="button" onClick={() => switchView('forgot')} className="text-[13px] font-medium hover:underline" style={{ color: BRAND_GREEN }}>
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={otpSent}
                        placeholder="Enter Password"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#052e16] focus:ring-2 focus:ring-[#052e16]/15 disabled:bg-slate-50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {view === 'signin' && (
                    <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#052e16]"
                      />
                      Remember device for 30 days
                    </label>
                  )}
                  
                  {/* OTP Block for Sign Up */}
                  {view === 'signup' && otpSent && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="mb-1.5 mt-4 block text-[11px] font-bold tracking-wide text-slate-700 text-center">
                        ENTER 6-DIGIT OTP
                      </label>
                      <OTPInput otp={otpValues} setOtp={setOtpValues} />
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <p className="text-xs text-slate-500 text-center">
                          Check your email for the OTP.
                        </p>
                        {timer > 0 ? (
                          <span className="text-xs text-slate-400 font-medium">Resend OTP in {timer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSignUpInit}
                            className="text-xs font-semibold hover:underline" style={{ color: BRAND_GREEN }}
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* === COMMON: RECAPTCHA & SUBMIT BUTTON === */}
              
              <div className={otpSent ? "hidden" : "block"}>
                <div ref={recaptchaRef} className="flex justify-center overflow-x-auto my-3"></div>
                {errors.recaptcha && <p className="mt-2 text-center text-sm text-red-500">{errors.recaptcha}</p>}
              </div>

              {errors.general && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!recaptchaVerified && !otpSent) || !!emailCheckError}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed mt-2"
                style={{ backgroundColor: BRAND_GREEN }}
              >
                {loading ? "Processing..." : (
                  view === 'signin' ? "Sign In" : 
                  view === 'signup' ? (otpSent ? "Verify & Create Account" : "Send 6-Digit OTP") :
                  (otpSent ? "Verify & Reset Password" : "Send Reset OTP")
                )}
              </button>

              {/* === OR CONTINUE WITH GOOGLE === */}
              {view !== 'forgot' && (
                <>
                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[11px] font-semibold tracking-[0.14em] text-slate-400">
                      OR {view === 'signup' ? "SIGN UP" : "SIGN IN"} WITH GOOGLE
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading || !!emailCheckError}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FcGoogle className="text-xl" />
                    Continue with Google
                  </button>
                </>
              )}
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              {view === 'signup' ? "Already have an account? " : view === 'forgot' ? "Remember your password? " : "Don't have an account? "}
              <button 
                onClick={() => switchView(view === 'signin' ? 'signup' : 'signin')}
                className="font-semibold cursor-pointer hover:underline" 
                style={{ color: BRAND_GREEN }}
              >
                {view === 'signin' ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ── Subscription Section ───────────────────────────────────────── */}
      <div id="subscription" className="relative z-20 bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Choose the perfect plan for your farming needs. Upgrade or downgrade at any time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-3xl bg-white p-8 shadow-xl transition-transform duration-300 hover:-translate-y-2 flex flex-col ${
                  plan.popular ? 'ring-2 ring-[#052e16] scale-105 md:-mt-4 md:mb-4' : 'border border-slate-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#052e16] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 h-10">{plan.description}</p>
                </div>
                
                <div className="mb-8 flex items-baseline text-slate-900">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-lg text-slate-500 ml-1 font-medium">{plan.period}</span>}
                </div>
                
                <ul className="mb-8 space-y-4 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mr-3" />
                      <span className="text-sm text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    plan.popular 
                      ? 'bg-[#052e16] text-white hover:bg-[#052e16]/90 hover:shadow-md' 
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* ── Documentation Placeholder (Optional Footer) ────────────────── */}
      <div id="documentation" className="bg-slate-900 text-slate-400 py-12 px-6 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Farmmate. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
        </div>
      </div>

    </div>
  );
};

export default Auth;