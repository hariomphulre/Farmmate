import { useState, useEffect, useRef } from 'react';
import { FcGoogle } from "react-icons/fc";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const recaptchaRef = useRef(null);
  
  // Error state
  const [errors, setErrors] = useState({});

  // Google OAuth and reCAPTCHA configuration
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  // Background image path (now in public folder)
  const backgrd_img = "/forest_img.jpg";
  
  let usertype="";

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
    console.log('Form submitted!');
    
    const usernameInput = document.querySelector('input[placeholder="Username"]').value;
    const passwordInput = document.querySelector('input[placeholder="Password"]').value;
    
    if (!usernameInput || !passwordInput) {
      setErrors({ general: 'Please enter both username and password' });
      return;
    }
    
    if (!recaptchaVerified) {
      console.log('Validation failed: reCAPTCHA not verified');
      setErrors({ general: 'Please complete the reCAPTCHA verification' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    setTimeout(() => {
      if (passwordInput === "admin12345" && usernameInput === "Hariom") {
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify({ 
          username: usernameInput, 
          loginTime: new Date().toISOString() 
        }));
        if(usertype=="Farmer" || usertype=="Trader"){
          window.location.href = usertype=="Farmer" ? '/dashboard' : '/trader';
        }
        else{
          setErrors({general: 'Please select user type.'});
        }
      } else {
        setErrors({ general: 'Invalid username or password.' });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen">
      <img 
        src={backgrd_img} 
        alt="Forest background" 
        className="fixed brightness-80 inset-0 w-full h-full object-cover -z-10"
      />
      
      <div className="flex flex-wrap relative z-10">
        <img src="/logo.png" alt="logo loading..." className="w-10 h-10 sm:w-15 sm:h-15 position-fixed overflow-y-hidden m-2 sm:m-3"/>
        <h1 style={{fontFamily: "sans-serif"}} className={`sm:pt-5 text-xl sm:text-3xl font-bold text-gray-200`}>Smart & Climate Resilient Agriculture</h1>
      </div>

      <div style={{justifySelf: "center"}} className="flex items-center flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-sm w-full space-y-8 relative z-10">

        <div className="flex flex-col bg-white backdrop-blur-sm shadow-2xl rounded-2xl pl-6 pr-6 pb-6 pt-3 space-y-0">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <form onSubmit={checkDetails} className="space-y-4">
            <div>
              <h1 style={{fontFamily: "arial"}} className="font-bold text-3xl">Sign in</h1>
            </div>
            <div className="flex flex-col gap-3 pt-0">
              <select onChange={(e)=>{usertype=e.target.value; console.log(usertype)}} className="pl-1 text-lg border w-76 h-9 rounded-xs" id="">
                <option disabled selected hidden>Select User</option>
                <option>Farmer</option>
                <option>Trader</option>
              </select>
              <input 
                type="text" 
                placeholder='Username' 
                className="border black rounded-xs p-1 pl-2 text-lg"
                required
              />
              <input 
                type="password" 
                placeholder='Password' 
                className="border black rounded-xs p-1 pl-2 text-lg"
                required
              />
            </div>
            <div>
              <div 
                ref={recaptchaRef}
                className="flex justify-center"
              ></div>
              {errors.recaptcha && <p className="mt-2 text-sm text-red-500 text-center">{errors.recaptcha}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !recaptchaVerified}
              className="w-full cursor-pointer hover:bg-blue-700 flex justify-center py-3 px-4 border border-transparent rounded-xs shadow-sm text-white bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Sign in
            </button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm pt-1 pb-1">
              <span className="px-2 bg-white text-gray-500">or</span> 
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || !recaptchaVerified}
              className="w-full cursor-pointer flex flex-row gap-12 items-center py-3 border border-gray-300 rounded-xs shadow-sm bg-white hover:bg-gray-100 transition-all disabled:cursor-not-allowed"
            >
              <FcGoogle className="ml-4 text-2xl"/>
              Sign in with Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-white">
          <p>Secured with Google OAuth 2.0 and reCAPTCHA</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;