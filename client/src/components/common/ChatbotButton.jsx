import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, faLeaf, faArrowRight,
  faWheatAwn, faCloudSunRain, faChartLine
} from '@fortawesome/free-solid-svg-icons';

const ChatbotButton = () => {
  const navigate = useNavigate();
  const [isButtonPulsing, setIsButtonPulsing] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  
  // Simulate the welcome message after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(true);
      setIsButtonPulsing(true);
      setTimeout(() => setIsButtonPulsing(false), 5000);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Navigate to AI Assistant page
  const handleClick = () => {
    // Close greeting if it's open
    setShowGreeting(false);
    
    // Navigate to AI Assistant page
    navigate('/ai-assistant');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Greeting tooltip */}
      {showGreeting && (
        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-4 mb-4 shadow-xl max-w-xs animate-fade-in-up relative border border-green-100">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowGreeting(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-full mr-3 shadow-md">
              <FontAwesomeIcon icon={faLeaf} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">AgriSense AI at your service!</p>
              <p className="text-xs text-gray-600 mt-1">
                Get smart farming assistance with our AI-powered assistant!
              </p>
              <button 
                onClick={handleClick}
                className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-full transition-colors flex items-center"
              >
                <span>Open assistant</span>
                <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat button - redirects to AI Assistant page */}
      <button
        onClick={handleClick}
        className={`${
          isButtonPulsing ? 'animate-pulse-ring' : ''
        } relative bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl`}
        aria-label="Open AI Assistant"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-md opacity-70"></div>
        <div className="relative z-10 flex items-center justify-center">
          {/* Always show the leaf icon - permanent state */}
          <FontAwesomeIcon icon={faLeaf} className="text-white text-xl" />
        </div>
      </button>
    </div>
  );
};

export default ChatbotButton;
