// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAppContext } from '../context/AppContext';
// import { fetchFields, fetchFieldData, fetchWeatherByCoordinates, fetchWeatherByLocation } from '../services/dataService';
// import NewsFarmer from '../components/financial-aid/NewsFarmer';

// const Dashboard = () => {
//   // Initial weather data from your state
//   const [weatherData, setWeatherData] = useState({
//     country: '',
//     feels_like: 0,
//     humidity: 0,
//     place: 'Unknown',
//     temperature: 0,
//     weather: 'clear',
//     wind_speed: 0
//   });

//   const [fieldData, setFieldData] = useState({
//     name: 'Main Field',
//     location: 'Unknown',
//     size: 0,
//     crop: 'Unknown',
//     createdAt: new Date().toISOString(),
//     coordinates: []
//   });

//   const [loading, setLoading] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [isNight, setIsNight] = useState(false);

//   // Context and fields state for dynamic data
//   const contextValue = useAppContext() || {};
//   const {
//     selectedField = '',
//     setSelectedField = () => {},
//     fields = [],
//     refreshFields = async () => {}
//   } = contextValue;
//   const [allFields, setAllFields] = useState([]);
//   const [fieldCount, setFieldCount] = useState(0);

//   // Update time and check if night
//   useEffect(() => {
//     const updateTime = () => {
//       const now = new Date();
//       setCurrentTime(now);
//       const hour = now.getHours();
//       setIsNight(hour >= 18 || hour <= 6);
//     };
    
//     updateTime();
//     const timer = setInterval(updateTime, 60000);
//     return () => clearInterval(timer);
//   }, []);

//   // Load all fields from backend
//   useEffect(() => {
//     const loadAllFields = async () => {
//       try {
//         const fetched = await fetchFields();
//         setAllFields(fetched);
//         setFieldCount(fetched.length);
//         // Select first field if none selected
//         if (!selectedField && fetched.length > 0) {
//           setSelectedField(fetched[0].id);
//         }
//       } catch (e) {
//         // keep defaults
//       }
//     };
//     loadAllFields();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Load selected field details and weather
//   useEffect(() => {
//     const loadSelected = async () => {
//       try {
//         if (!selectedField && fields.length === 0 && allFields.length === 0) return;
//         const activeId = selectedField || (fields[0]?.id || allFields[0]?.id);
//         if (!activeId) return;
//         setLoading(true);
//         const field = await fetchFieldData(activeId);
//         setFieldData(field);
//         // Prefer location-based lookup
//         if (field.location && String(field.location).trim().length > 0) {
//           const w = await fetchWeatherByLocation(String(field.location).trim());
//           if (w) setWeatherData(w);
//         } else if (Array.isArray(field.coordinates) && field.coordinates.length > 0) {
//           const n = field.coordinates.length;
//           const centroid = field.coordinates.reduce(
//             (acc, p) => ({ lat: acc.lat + p.lat / n, lng: acc.lng + p.lng / n }),
//             { lat: 0, lng: 0 }
//           );
//           const w = await fetchWeatherByCoordinates(centroid);
//           if (w) setWeatherData(w);
//         }
//       } catch (e) {
//         // leave defaults
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadSelected();
//   }, [selectedField, fields, allFields]);

//   // Enhanced weather theme with night mode
//   const getWeatherTheme = (weather, isNight) => {
//     const weatherLower = weather.toLowerCase();
    
//     const baseTheme = {
//       night: isNight,
//       starField: isNight,
//     };

//     if (weatherLower.includes('cloud')) {
//       return {
//         ...baseTheme,
//         primary: isNight ? 'from-slate-900 via-gray-800 to-slate-700' : 'from-gray-300 via-slate-400 to-gray-500',
//         secondary: isNight ? 'bg-slate-800' : 'bg-gray-100',
//         accent: isNight ? 'text-slate-200' : 'text-gray-800',
//         glowColor: isNight ? 'rgba(148, 163, 184, 0.3)' : 'rgba(107, 114, 128, 0.3)',
//         particleColor: isNight ? '#64748b' : '#9ca3af',
//         cardBg: isNight ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
//         animation: 'clouds'
//       };
//     } else if (weatherLower.includes('rain')) {
//       return {
//         ...baseTheme,
//         primary: isNight ? 'from-slate-900 via-blue-900 to-gray-800' : 'from-blue-400 via-slate-500 to-blue-600',
//         secondary: isNight ? 'bg-blue-900' : 'bg-blue-50',
//         accent: isNight ? 'text-blue-200' : 'text-blue-900',
//         glowColor: isNight ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.2)',
//         particleColor: isNight ? '#3b82f6' : '#60a5fa',
//         cardBg: isNight ? 'rgba(30, 58, 138, 0.8)' : 'rgba(255, 255, 255, 0.9)',
//         animation: 'rain'
//       };
//     } else if (weatherLower.includes('sun') || weatherLower.includes('clear')) {
//       return {
//         ...baseTheme,
//         primary: isNight ? 'from-indigo-900 via-purple-900 to-slate-900' : 'from-orange-300 via-yellow-400 to-amber-500',
//         secondary: isNight ? 'bg-indigo-900' : 'bg-orange-50',
//         accent: isNight ? 'text-purple-200' : 'text-orange-900',
//         glowColor: isNight ? 'rgba(139, 92, 246, 0.4)' : 'rgba(251, 146, 60, 0.3)',
//         particleColor: isNight ? '#8b5cf6' : '#fb923c',
//         cardBg: isNight ? 'rgba(76, 29, 149, 0.8)' : 'rgba(255, 255, 255, 0.9)',
//         animation: isNight ? 'stars' : 'sun'
//       };
//     }
    
//     return {
//       ...baseTheme,
//       primary: isNight ? 'from-emerald-900 via-teal-800 to-green-900' : 'from-green-300 via-emerald-400 to-teal-500',
//       secondary: isNight ? 'bg-emerald-900' : 'bg-green-50',
//       accent: isNight ? 'text-emerald-200' : 'text-green-900',
//       glowColor: isNight ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.2)',
//       particleColor: isNight ? '#10b981' : '#34d399',
//       cardBg: isNight ? 'rgba(6, 95, 70, 0.8)' : 'rgba(255, 255, 255, 0.9)',
//       animation: 'default'
//     };
//   };

//   const theme = getWeatherTheme(weatherData.weather, isNight);

//   // Map temperature to UI background color
//   const getTemperatureColor = (tempC) => {
//     if (tempC == null || isNaN(tempC)) return '#32CD32'; // default pleasant green
//     if (tempC < 0) return '#00BFFF'; // Ice Blue
//     if (tempC < 10) return '#1E90FF'; // Cool Blue
//     if (tempC < 20) return '#32CD32'; // Fresh Green
//     if (tempC < 30) return '#FFD700'; // Warm Yellow
//     if (tempC < 40) return '#FF8C00'; // Orange
//     return '#FF4500'; // Red
//   };
//   const temperatureColor = getTemperatureColor(weatherData.temperature);
 
//   // Advanced particle systems
//   const AdvancedParticles = () => {
//     const weatherLower = weatherData.weather.toLowerCase();
    
//     if (theme.night && (weatherLower.includes('clear') || weatherLower.includes('sun'))) {
//       // Stars for clear nights
//       return (
//         <div className="fixed inset-0 overflow-hidden pointer-events-none">
//           {[...Array(100)].map((_, i) => (
//             <motion.div
//               key={`star-${i}`}
//               className="absolute w-1 h-1 bg-white rounded-full"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//               }}
//               animate={{
//                 opacity: [0.3, 1, 0.3],
//                 scale: [0.5, 1.2, 0.5]
//               }}
//               transition={{
//                 duration: 2 + Math.random() * 3,
//                 repeat: Infinity,
//                 delay: Math.random() * 5
//               }}
//             />
//           ))}
//           {/* Shooting stars */}
//           {[...Array(3)].map((_, i) => (
//             <motion.div
//               key={`shooting-${i}`}
//               className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
//               style={{
//                 left: `${Math.random() * 50}%`,
//                 top: `${Math.random() * 50}%`,
//               }}
//               animate={{
//                 x: [0, 200],
//                 y: [0, 100],
//                 opacity: [0, 1, 0]
//               }}
//               transition={{
//                 duration: 1.5,
//                 repeat: Infinity,
//                 delay: i * 8 + Math.random() * 5,
//                 repeatDelay: 15
//               }}
//             />
//           ))}
//         </div>
//       );
//     }
    
//     if (weatherLower.includes('cloud')) {
//       return (
//         <div className="fixed inset-0 overflow-hidden pointer-events-none">
//           {[...Array(12)].map((_, i) => (
//             <motion.div
//               key={`cloud-${i}`}
//               className="absolute rounded-full opacity-20"
//               style={{
//                 width: `${60 + Math.random() * 100}px`,
//                 height: `${30 + Math.random() * 50}px`,
//                 background: theme.particleColor,
//                 top: `${Math.random() * 80}%`,
//                 left: `-10%`,
//               }}
//               animate={{
//                 x: ['0vw', '110vw'],
//                 y: [0, -30, 0, 20, 0],
//                 scale: [0.8, 1.2, 0.9, 1.1, 1],
//                 opacity: [0.1, 0.3, 0.2, 0.4, 0.1]
//               }}
//               transition={{
//                 duration: 25 + i * 3,
//                 repeat: Infinity,
//                 ease: "linear",
//                 delay: i * 2
//               }}
//             />
//           ))}
//           {/* Floating particles */}
//           {[...Array(30)].map((_, i) => (
//             <motion.div
//               key={`particle-${i}`}
//               className="absolute w-2 h-2 rounded-full opacity-30"
//               style={{
//                 background: theme.particleColor,
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//               }}
//               animate={{
//                 y: [-20, -40, -20],
//                 x: [-10, 10, -10],
//                 opacity: [0.2, 0.6, 0.2],
//                 scale: [0.5, 1, 0.5]
//               }}
//               transition={{
//                 duration: 4 + Math.random() * 3,
//                 repeat: Infinity,
//                 delay: Math.random() * 3
//               }}
//             />
//           ))}
//         </div>
//       );
//     }
    
//     if (weatherLower.includes('rain')) {
//       return (
//         <div className="fixed inset-0 overflow-hidden pointer-events-none">
//           {/* Heavy rain effect */}
//           {[...Array(150)].map((_, i) => (
//             <motion.div
//               key={`rain-${i}`}
//               className="absolute w-0.5 bg-gradient-to-b from-transparent via-blue-300 to-transparent rounded-full"
//               style={{
//                 height: `${20 + Math.random() * 30}px`,
//                 left: `${Math.random() * 100}%`,
//                 top: '-50px',
//                 opacity: 0.4 + Math.random() * 0.4
//               }}
//               animate={{
//                 y: ['0vh', '120vh']
//               }}
//               transition={{
//                 duration: 0.8 + Math.random() * 0.4,
//                 repeat: Infinity,
//                 ease: "linear",
//                 delay: Math.random() * 2
//               }}
//             />
//           ))}
//           {/* Splash effects */}
//           {[...Array(20)].map((_, i) => (
//             <motion.div
//               key={`splash-${i}`}
//               className="absolute w-1 h-1 bg-blue-400 rounded-full"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 bottom: '10px'
//               }}
//               animate={{
//                 scale: [0, 1.5, 0],
//                 y: [0, -20, 0],
//                 opacity: [0, 0.7, 0]
//               }}
//               transition={{
//                 duration: 0.6,
//                 repeat: Infinity,
//                 delay: Math.random() * 2,
//                 repeatDelay: 1
//               }}
//             />
//           ))}
//         </div>
//       );
//     }
    
//     if (weatherLower.includes('sun') && !theme.night) {
//       return (
//         <div className="fixed inset-0 overflow-hidden pointer-events-none">
//           {/* Sun rays */}
//           {[...Array(20)].map((_, i) => (
//             <motion.div
//               key={`ray-${i}`}
//               className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-200 to-transparent rounded-full opacity-20"
//               style={{
//                 height: '200px',
//                 left: `${Math.random() * 100}%`,
//                 top: '-100px',
//                 transformOrigin: 'bottom center',
//                 transform: `rotate(${Math.random() * 30 - 15}deg)`
//               }}
//               animate={{
//                 opacity: [0.1, 0.4, 0.1],
//                 scaleY: [0.8, 1.2, 0.8]
//               }}
//               transition={{
//                 duration: 3 + Math.random() * 2,
//                 repeat: Infinity,
//                 delay: Math.random() * 3
//               }}
//             />
//           ))}
//           {/* Floating light particles */}
//           {[...Array(40)].map((_, i) => (
//             <motion.div
//               key={`light-${i}`}
//               className="absolute w-3 h-3 bg-yellow-200 rounded-full opacity-20"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//               }}
//               animate={{
//                 y: [-30, 30, -30],
//                 x: [-20, 20, -20],
//                 opacity: [0.1, 0.5, 0.1],
//                 scale: [0.5, 1.2, 0.5]
//               }}
//               transition={{
//                 duration: 6 + Math.random() * 3,
//                 repeat: Infinity,
//                 delay: Math.random() * 4
//               }}
//             />
//           ))}
//         </div>
//       );
//     }
    
//     return null;
//   };

//   // Enhanced weather icon with 3D effects
//   const WeatherIcon3D = ({ weather, size = 'w-16 h-16' }) => {
//     const weatherLower = weather.toLowerCase();
    
//     return (
//       <motion.div
//         className={`${size} relative flex items-center justify-center`}
//         initial={{ scale: 0, rotateY: -180 }}
//         animate={{ scale: 1, rotateY: 0 }}
//         transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
//         whileHover={{ scale: 1.1, rotateY: 15 }}
//       >
//         {weatherLower.includes('cloud') && (
//           <motion.div className="relative transform-gpu">
//             <motion.div
//               className="w-12 h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full shadow-lg relative"
//               style={{
//                 filter: `drop-shadow(0 4px 8px ${theme.glowColor})`
//               }}
//               animate={{
//                 y: [0, -8, 0],
//                 rotateX: [0, 5, 0],
//                 scale: [1, 1.05, 1]
//               }}
//               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//             >
//               <motion.div 
//                 className="w-8 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full absolute -top-2 left-2"
//                 animate={{ scale: [1, 1.1, 1] }}
//                 transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
//               />
//               <motion.div 
//                 className="w-6 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full absolute -top-1 right-1"
//                 animate={{ scale: [1, 1.05, 1] }}
//                 transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
//               />
//               {/* Lightning for storm clouds */}
//               <motion.div
//                 className="absolute w-1 h-6 bg-yellow-300 top-6 left-5"
//                 style={{ clipPath: 'polygon(20% 0%, 40% 40%, 60% 35%, 80% 100%, 60% 65%, 40% 70%)' }}
//                 animate={{ opacity: [0, 1, 0] }}
//                 transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
//               />
//             </motion.div>
//           </motion.div>
//         )}
        
//         {weatherLower.includes('rain') && (
//           <motion.div className="relative transform-gpu">
//             <motion.div
//               className="w-10 h-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full relative mb-2 shadow-lg"
//               style={{
//                 filter: `drop-shadow(0 4px 8px ${theme.glowColor})`
//               }}
//               animate={{ scale: [1, 1.05, 1] }}
//               transition={{ duration: 2, repeat: Infinity }}
//             >
//               <div className="w-7 h-5 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full absolute -top-1 left-1.5" />
//             </motion.div>
//             {[...Array(5)].map((_, i) => (
//               <motion.div
//                 key={i}
//                 className="absolute w-0.5 h-4 bg-gradient-to-b from-blue-300 to-blue-500 rounded-full shadow-sm"
//                 style={{ 
//                   left: `${i * 3 + 8}px`, 
//                   top: '28px',
//                   filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
//                 }}
//                 animate={{
//                   y: [0, 20, 0],
//                   opacity: [1, 0.3, 1],
//                   scaleY: [1, 0.8, 1]
//                 }}
//                 transition={{
//                   duration: 1.2,
//                   repeat: Infinity,
//                   delay: i * 0.15,
//                   ease: "easeInOut"
//                 }}
//               />
//             ))}
//           </motion.div>
//         )}
        
//         {(weatherLower.includes('sun') || weatherLower.includes('clear')) && !theme.night && (
//           <motion.div
//             className="relative transform-gpu"
//             animate={{ rotate: 360 }}
//             transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
//           >
//             <motion.div
//               className="w-10 h-10 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full relative shadow-lg"
//               style={{
//                 filter: `drop-shadow(0 0 20px ${theme.glowColor})`
//               }}
//               animate={{
//                 scale: [1, 1.1, 1],
//                 boxShadow: [
//                   '0 0 20px rgba(251, 146, 60, 0.3)',
//                   '0 0 30px rgba(251, 146, 60, 0.5)',
//                   '0 0 20px rgba(251, 146, 60, 0.3)'
//                 ]
//               }}
//               transition={{ duration: 2, repeat: Infinity }}
//             >
//               {[...Array(12)].map((_, i) => (
//                 <motion.div
//                   key={i}
//                   className="absolute w-1 h-4 bg-gradient-to-t from-yellow-200 to-orange-300 rounded-full"
//                   style={{
//                     transform: `rotate(${i * 30}deg) translate(0, -22px)`,
//                     transformOrigin: '50% 22px'
//                   }}
//                   animate={{
//                     scaleY: [0.8, 1.2, 0.8],
//                     opacity: [0.6, 1, 0.6]
//                   }}
//                   transition={{
//                     duration: 1.5,
//                     repeat: Infinity,
//                     delay: i * 0.1
//                   }}
//                 />
//               ))}
//             </motion.div>
//           </motion.div>
//         )}

//         {theme.night && (weatherLower.includes('sun') || weatherLower.includes('clear')) && (
//           <motion.div className="relative transform-gpu">
//             <motion.div
//               className="w-10 h-10 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full relative shadow-lg"
//               style={{
//                 filter: `drop-shadow(0 0 15px ${theme.glowColor})`
//               }}
//               animate={{
//                 scale: [1, 1.05, 1],
//                 opacity: [0.8, 1, 0.8]
//               }}
//               transition={{ duration: 3, repeat: Infinity }}
//             >
//               {/* Crescent shape for moon */}
//               <div 
//                 className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-full"
//                 style={{
//                   clipPath: 'ellipse(60% 100% at 80% 50%)'
//                 }}
//               />
//               {/* Stars around moon */}
//               {[...Array(6)].map((_, i) => (
//                 <motion.div
//                   key={i}
//                   className="absolute w-1 h-1 bg-white rounded-full"
//                   style={{
//                     left: `${15 + Math.cos(i * 60 * Math.PI / 180) * 25}px`,
//                     top: `${15 + Math.sin(i * 60 * Math.PI / 180) * 25}px`,
//                   }}
//                   animate={{
//                     opacity: [0.3, 1, 0.3],
//                     scale: [0.5, 1, 0.5]
//                   }}
//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                     delay: i * 0.3
//                   }}
//                 />
//               ))}
//             </motion.div>
//           </motion.div>
//         )}
//       </motion.div>
//     );
//   };

//   return (
//     <div className={`min-h-screen relative overflow-hidden transition-all duration-2000`} style={{
//       background: `linear-gradient(135deg, ${temperatureColor} 0%, rgba(255,255,255,0.05) 100%)`,
//       backgroundImage: theme.night ? 
//         'radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)' :
//         'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
//     }}>
//       {/* Advanced particle system */}
//       <AdvancedParticles />
      
//       {/* Animated gradient overlay */}
//       <motion.div
//         className="absolute inset-0 opacity-30"
//         animate={{
//           background: [
//             `radial-gradient(circle at 20% 20%, ${temperatureColor}33 0%, transparent 50%)`,
//             `radial-gradient(circle at 80% 80%, ${temperatureColor}33 0%, transparent 50%)`,
//             `radial-gradient(circle at 20% 80%, ${temperatureColor}33 0%, transparent 50%)`,
//             `radial-gradient(circle at 80% 20%, ${temperatureColor}33 0%, transparent 50%)`,
//           ]
//         }}
//         transition={{
//           duration: 15,
//           repeat: Infinity,
//           ease: "linear"
//         }}
//       />
      
//       <div className="relative z-10 p-6">
//         {/* Enhanced Header */}
//         <motion.div 
//           className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12"
//           initial={{ opacity: 0, y: -100 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
//         >
//           <div className="flex items-center mb-6 lg:mb-0">
//             <motion.div 
//               className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl mr-6`}
//               style={{
//                 background: `linear-gradient(135deg, ${theme.primary})`,
//                 filter: `drop-shadow(0 10px 25px ${theme.glowColor})`
//               }}
//               whileHover={{ 
//                 scale: 1.1, 
//                 rotate: [0, 5, -5, 0],
//                 boxShadow: `0 20px 40px ${theme.glowColor}`
//               }}
//               whileTap={{ scale: 0.95 }}
//               animate={{
//                 boxShadow: [
//                   `0 10px 25px ${theme.glowColor}`,
//                   `0 15px 35px ${theme.glowColor}`,
//                   `0 10px 25px ${theme.glowColor}`
//                 ]
//               }}
//               transition={{ duration: 3, repeat: Infinity }}
//             >
//               <motion.span 
//                 className="text-3xl"
//                 animate={{ rotate: [0, 10, -10, 0] }}
//                 transition={{ duration: 4, repeat: Infinity }}
//               >
//                 🚜
//               </motion.span>
//             </motion.div>
//             <div>
//               <motion.h1 
//                 className={`text-4xl font-bold ${theme.accent} mb-2`}
//                 style={{
//                   textShadow: `0 0 20px ${theme.glowColor}`,
//                   filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
//                 }}
//                 animate={{
//                   textShadow: [
//                     `0 0 20px ${theme.glowColor}`,
//                     `0 0 30px ${theme.glowColor}`,
//                     `0 0 20px ${theme.glowColor}`
//                   ]
//                 }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               >
//                 Smart Farm Dashboard
//               </motion.h1>
//               <motion.p 
//                 className={`text-lg ${theme.accent} opacity-80`}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 0.8 }}
//                 transition={{ delay: 0.5, duration: 1 }}
//               >
//                 AI-Powered Agricultural Intelligence • {theme.night ? '🌙 Night Mode' : '☀️ Day Mode'}
//               </motion.p>
//             </div>
//           </div>
          
//           <motion.div 
//             className="flex items-center space-x-6"
//             initial={{ opacity: 0, x: 100 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 1, delay: 0.3 }}
//           >
//             <div className={`text-right ${theme.accent} opacity-80`}>
//               <div className="text-sm font-medium">Last Updated</div>
//               <div className="text-lg">
//                 {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </div>
//             </div>
            
//             <motion.button 
//               className="relative px-6 py-3 rounded-2xl font-medium transition-all duration-300 overflow-hidden group"
//               style={{
//                 background: theme.cardBg,
//                 color: theme.accent.replace('text-', ''),
//                 backdropFilter: 'blur(20px)',
//                 border: `1px solid ${theme.glowColor}`
//               }}
//               whileHover={{ 
//                 scale: 1.05,
//                 boxShadow: `0 10px 30px ${theme.glowColor}`
//               }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => {
//                 setLoading(true);
//                 setTimeout(() => setLoading(false), 1500);
//               }}
//             >
//               <motion.div
//                 className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300"
//                 style={{
//                   background: `linear-gradient(45deg, ${theme.primary})`
//                 }}
//               />
//               <div className="relative flex items-center">
//                 <motion.div
//                   animate={loading ? { rotate: 360 } : { rotate: 0 }}
//                   transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
//                   className="mr-2 text-xl"
//                 >
//                   🔄
//                 </motion.div>
//                 <span>Refresh Data</span>
//               </div>
//             </motion.button>
//           </motion.div>
//         </motion.div>
        
//         {/* Agriculture News Section - Below Header */}
//         <div className="mb-8">
//           <NewsFarmer
//             coordinates={(() => {
//               if (Array.isArray(fieldData.coordinates) && fieldData.coordinates.length > 0) {
//                 const n = fieldData.coordinates.length;
//                 const centroid = fieldData.coordinates.reduce(
//                   (acc, p) => ({
//                     lat: acc.lat + p.lat / n,
//                     lng: acc.lng + p.lng / n,
//                   }),
//                   { lat: 0, lng: 0 }
//                 );
//                 return centroid;
//               }
//               return null;
//             })()}
//           />
//         </div>

//         {/* Hero Weather Display */}
//         <motion.div 
//           className="relative mb-12 overflow-hidden rounded-3xl"
//           style={{
//             background: theme.cardBg,
//             backdropFilter: 'blur(30px)',
//             border: `1px solid ${theme.glowColor}`
//           }}
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1.2, delay: 0.4 }}
//           whileHover={{
//             boxShadow: `0 25px 50px ${theme.glowColor}`
//           }}
//         >
//           <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{
//             background: `linear-gradient(135deg, ${theme.primary})`
//           }} />
          
//           <div className="relative z-10 p-8">
//             <div className="flex flex-col lg:flex-row items-center justify-between">
//               <div className="flex items-center mb-8 lg:mb-0">
//                 <WeatherIcon3D weather={weatherData.weather} size="w-24 h-24" />
//                 <div className="ml-8">
//                   <motion.div 
//                     className={`text-6xl font-bold ${theme.accent} mb-2`}
//                     style={{
//                       textShadow: `0 0 30px ${theme.glowColor}`,
//                       filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
//                     }}
//                     animate={{
//                       scale: [1, 1.02, 1]
//                     }}
//                     transition={{ duration: 4, repeat: Infinity }}
//                   >
//                     {Math.round(weatherData.temperature)}°
//                   </motion.div>
//                   <motion.div 
//                     className={`text-2xl ${theme.accent} opacity-80 capitalize font-medium mb-2`}
//                     initial={{ opacity: 0, x: -30 }}
//                     animate={{ opacity: 0.8, x: 0 }}
//                     transition={{ delay: 0.8, duration: 0.8 }}
//                   >
//                     {weatherData.weather}
//                   </motion.div>
//                   <motion.div 
//                     className={`text-lg ${theme.accent} opacity-60 flex items-center`}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 0.6, y: 0 }}
//                     transition={{ delay: 1, duration: 0.8 }}
//                   >
//                     📍 {weatherData.place.charAt(0).toUpperCase() + weatherData.place.slice(1)} • Feels like {Math.round(weatherData.feels_like)}°C
//                   </motion.div>
//                 </div>
//               </div>
              
//               {/* Weather Stats Grid */}
//               <div className="grid grid-cols-3 gap-6">
//                 {/* Humidity */}
//                 <motion.div 
//                   className="text-center"
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 1.2, duration: 0.8 }}
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   <motion.div 
//                     className="relative w-16 h-16 mx-auto mb-3"
//                     animate={{ rotate: 360 }}
//                     transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
//                   >
//                     <div className="w-16 h-16 rounded-full border-4 border-opacity-20" style={{ borderColor: theme.accent.replace('text-', '') }} />
//                     <motion.div 
//                       className="absolute inset-0 rounded-full border-4 border-transparent"
//                       style={{
//                         borderTopColor: theme.accent.replace('text-', ''),
//                         borderRightColor: theme.accent.replace('text-', ''),
//                         transform: `rotate(${(weatherData.humidity / 100) * 360}deg)`
//                       }}
//                       initial={{ transform: 'rotate(0deg)' }}
//                       animate={{ transform: `rotate(${(weatherData.humidity / 100) * 360}deg)` }}
//                       transition={{ duration: 2, delay: 1.5 }}
//                     />
//                     <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${theme.accent}`}>
//                       {weatherData.humidity}%
//                     </div>
//                   </motion.div>
//                   <div className={`text-sm ${theme.accent} opacity-70`}>Humidity</div>
//                 </motion.div>
                
//                 {/* Wind Speed */}
//                 <motion.div 
//                   className="text-center"
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 1.4, duration: 0.8 }}
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   <motion.div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
//                     <motion.div
//                       animate={{ 
//                         rotate: [0, 360],
//                         scale: [1, 1.1, 1]
//                       }}
//                       transition={{ 
//                         rotate: { duration: 2, repeat: Infinity, ease: "linear" },
//                         scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
//                       }}
//                       className="text-3xl"
//                     >
//                       💨
//                     </motion.div>
//                   </motion.div>
//                   <div className={`text-lg font-bold ${theme.accent}`}>{weatherData.wind_speed}</div>
//                   <div className={`text-sm ${theme.accent} opacity-70`}>km/h</div>
//                 </motion.div>
                
//                 {/* Time */}
//                 <motion.div 
//                   className="text-center"
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 1.6, duration: 0.8 }}
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   <motion.div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
//                     <motion.div
//                       animate={{ 
//                         scale: [1, 1.05, 1]
//                       }}
//                       transition={{ duration: 1, repeat: Infinity }}
//                       className="text-3xl"
//                     >
//                       {theme.night ? '🌙' : '⏰'}
//                     </motion.div>
//                   </motion.div>
//                   <div className={`text-sm font-bold ${theme.accent}`}>
//                     {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </div>
//                   <div className={`text-xs ${theme.accent} opacity-70`}>
//                     {theme.night ? 'Night' : 'Day'} Time
//                   </div>
//                 </motion.div>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Enhanced Weather Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//           {/* Temperature Card */}
//           <motion.div 
//             className="relative overflow-hidden rounded-2xl p-6"
//             style={{
//               background: theme.cardBg,
//               backdropFilter: 'blur(20px)',
//               border: `1px solid ${theme.glowColor}`
//             }}
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.6 }}
//             whileHover={{ 
//               scale: 1.03,
//               boxShadow: `0 20px 40px ${theme.glowColor}`
//             }}
//           >
//             <motion.div
//               className="absolute inset-0 bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 opacity-10"
//               animate={{
//                 opacity: [0.05, 0.15, 0.05]
//               }}
//               transition={{ duration: 3, repeat: Infinity }}
//             />
            
//             <div className="relative z-10">
//               <div className="flex items-center justify-between mb-4">
//                 <motion.div 
//                   className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
//                   animate={{
//                     boxShadow: [
//                       '0 4px 15px rgba(251, 146, 60, 0.3)',
//                       '0 8px 25px rgba(251, 146, 60, 0.5)',
//                       '0 4px 15px rgba(251, 146, 60, 0.3)'
//                     ]
//                   }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 >
//                   <motion.span 
//                     className="text-white text-xl"
//                     animate={{ scale: [1, 1.2, 1] }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                   >
//                     🌡️
//                   </motion.span>
//                 </motion.div>
//                 <motion.div
//                   className="text-right"
//                   animate={{ x: [0, 2, 0] }}
//                   transition={{ duration: 4, repeat: Infinity }}
//                 >
//                   <div className={`text-xs ${theme.accent} opacity-60 mb-1`}>Current</div>
//                   <div className={`text-xs ${theme.accent} opacity-40`}>Temperature</div>
//                 </motion.div>
//               </div>
              
//               <motion.div 
//                 className={`text-3xl font-bold ${theme.accent} mb-2`}
//                 animate={{
//                   color: ['#ef4444', '#f97316', '#eab308', '#ef4444']
//                 }}
//                 transition={{ duration: 4, repeat: Infinity }}
//               >
//                 {Math.round(weatherData.temperature)}°C
//               </motion.div>
              
//               <div className={`text-sm ${theme.accent} opacity-70 mb-3`}>
//                 Feels like {Math.round(weatherData.feels_like)}°C
//               </div>
              
//               <motion.div 
//                 className="w-full bg-gray-200 bg-opacity-30 rounded-full h-2"
//                 initial={{ width: 0 }}
//                 animate={{ width: '100%' }}
//                 transition={{ duration: 1, delay: 1 }}
//               >
//                 <motion.div 
//                   className="bg-gradient-to-r from-blue-400 to-red-500 h-2 rounded-full"
//                   initial={{ width: '0%' }}
//                   animate={{ width: `${Math.min((weatherData.temperature + 10) / 50 * 100, 100)}%` }}
//                   transition={{ duration: 1.5, delay: 1.2 }}
//                 />
//               </motion.div>
//             </div>
//           </motion.div>

//           {/* Humidity Card */}
//           <motion.div 
//             className="relative overflow-hidden rounded-2xl p-6"
//             style={{
//               background: theme.cardBg,
//               backdropFilter: 'blur(20px)',
//               border: `1px solid ${theme.glowColor}`
//             }}
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.8 }}
//             whileHover={{ 
//               scale: 1.03,
//               boxShadow: `0 20px 40px ${theme.glowColor}`
//             }}
//           >
//             <motion.div
//               className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 opacity-10"
//               animate={{
//                 opacity: [0.05, 0.15, 0.05]
//               }}
//               transition={{ duration: 3, repeat: Infinity, delay: 1 }}
//             />
            
//             <div className="relative z-10">
//               <div className="flex items-center justify-between mb-4">
//                 <motion.div 
//                   className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
//                   animate={{
//                     boxShadow: [
//                       '0 4px 15px rgba(59, 130, 246, 0.3)',
//                       '0 8px 25px rgba(59, 130, 246, 0.5)',
//                       '0 4px 15px rgba(59, 130, 246, 0.3)'
//                     ]
//                   }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 >
//                   <motion.div
//                     className="absolute inset-0 bg-blue-300"
//                     animate={{ y: [`${100 - weatherData.humidity}%`, `${98 - weatherData.humidity}%`, `${100 - weatherData.humidity}%`] }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                     style={{ borderRadius: '12px' }}
//                   />
//                   <motion.span 
//                     className="relative z-10 text-white text-xl"
//                     animate={{ y: [0, -2, 0] }}
//                     transition={{ duration: 1.5, repeat: Infinity }}
//                   >
//                     💧
//                   </motion.span>
//                 </motion.div>
//                 <motion.div
//                   className="text-right"
//                   animate={{ x: [0, -2, 0] }}
//                   transition={{ duration: 3, repeat: Infinity }}
//                 >
//                   <div className={`text-xs ${theme.accent} opacity-60 mb-1`}>Air</div>
//                   <div className={`text-xs ${theme.accent} opacity-40`}>Humidity</div>
//                 </motion.div>
//               </div>
              
//               <motion.div 
//                 className={`text-3xl font-bold ${theme.accent} mb-2`}
//                 animate={{
//                   scale: [1, 1.02, 1]
//                 }}
//                 transition={{ duration: 3, repeat: Infinity }}
//               >
//                 {weatherData.humidity}%
//               </motion.div>
              
//               <div className={`text-sm ${theme.accent} opacity-70 mb-3`}>
//                 {weatherData.humidity > 70 ? 'High' : weatherData.humidity > 40 ? 'Moderate' : 'Low'} Moisture
//               </div>
              
//               <div className="flex space-x-1">
//                 {[...Array(10)].map((_, i) => (
//                   <motion.div
//                     key={i}
//                     className="flex-1 h-2 bg-gray-200 bg-opacity-30 rounded-full overflow-hidden"
//                     initial={{ opacity: 0.3 }}
//                     animate={{ 
//                       opacity: i < (weatherData.humidity / 10) ? 1 : 0.3,
//                       backgroundColor: i < (weatherData.humidity / 10) ? '#3b82f6' : '#e5e7eb'
//                     }}
//                     transition={{ duration: 0.2, delay: i * 0.1 + 1 }}
//                   />
//                 ))}
//               </div>
//             </div>
//           </motion.div>

//           {/* Wind Speed Card */}
//           <motion.div 
//             className="relative overflow-hidden rounded-2xl p-6"
//             style={{
//               background: theme.cardBg,
//               backdropFilter: 'blur(20px)',
//               border: `1px solid ${theme.glowColor}`
//             }}
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 1.0 }}
//             whileHover={{ 
//               scale: 1.03,
//               boxShadow: `0 20px 40px ${theme.glowColor}`
//             }}
//           >
//             <motion.div
//               className="absolute inset-0 bg-gradient-to-br from-gray-400 via-slate-400 to-zinc-400 opacity-10"
//               animate={{
//                 opacity: [0.05, 0.15, 0.05]
//               }}
//               transition={{ duration: 2, repeat: Infinity, delay: 2 }}
//             />
            
//             <div className="relative z-10">
//               <div className="flex items-center justify-between mb-4">
//                 <motion.div 
//                   className="w-12 h-12 bg-gradient-to-br from-gray-400 to-slate-500 rounded-xl flex items-center justify-center shadow-lg"
//                   animate={{
//                     rotate: [0, 360],
//                     boxShadow: [
//                       '0 4px 15px rgba(100, 116, 139, 0.3)',
//                       '0 8px 25px rgba(100, 116, 139, 0.5)',
//                       '0 4px 15px rgba(100, 116, 139, 0.3)'
//                     ]
//                   }}
//                   transition={{ 
//                     rotate: { duration: 4, repeat: Infinity, ease: "linear" },
//                     boxShadow: { duration: 2, repeat: Infinity }
//                   }}
//                 >
//                   <span className="text-white text-xl">💨</span>
//                 </motion.div>
//                 <motion.div
//                   className="text-right"
//                   animate={{ x: [0, 3, 0] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 >
//                   <div className={`text-xs ${theme.accent} opacity-60 mb-1`}>Wind</div>
//                   <div className={`text-xs ${theme.accent} opacity-40`}>Speed</div>
//                 </motion.div>
//               </div>
              
//               <motion.div 
//                 className={`text-3xl font-bold ${theme.accent} mb-2`}
//                 animate={{ x: [0, 2, 0] }}
//                 transition={{ duration: 1.5, repeat: Infinity }}
//               >
//                 {weatherData.wind_speed}
//                 <span className="text-lg"> km/h</span>
//               </motion.div>
              
//               <div className={`text-sm ${theme.accent} opacity-70 mb-3`}>
//                 {weatherData.wind_speed < 2 ? 'Calm' : 
//                  weatherData.wind_speed < 6 ? 'Light breeze' :
//                  weatherData.wind_speed < 12 ? 'Moderate' : 'Strong wind'}
//               </div>
              
//               <div className="flex space-x-2">
//                 {[...Array(5)].map((_, i) => (
//                   <motion.div
//                     key={i}
//                     className="flex-1 h-8 bg-gray-200 bg-opacity-30 rounded-lg flex items-end overflow-hidden"
//                     animate={{
//                       backgroundColor: i < (weatherData.wind_speed / 3) ? '#6b7280' : 'rgba(229, 231, 235, 0.3)'
//                     }}
//                     transition={{ duration: 0.3, delay: i * 0.1 + 1.2 }}
//                   >
//                     <motion.div
//                       className="w-full bg-gray-600 rounded-lg"
//                       initial={{ height: '0%' }}
//                       animate={{ 
//                         height: i < (weatherData.wind_speed / 3) ? `${20 + (i * 15)}%` : '0%'
//                       }}
//                       transition={{ duration: 0.5, delay: i * 0.1 + 1.5 }}
//                     />
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>

//           {/* Weather Status Card */}
//           <motion.div 
//             className="relative overflow-hidden rounded-2xl p-6"
//             style={{
//               background: theme.cardBg,
//               backdropFilter: 'blur(20px)',
//               border: `1px solid ${theme.glowColor}`
//             }}
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 1.2 }}
//             whileHover={{ 
//               scale: 1.03,
//               boxShadow: `0 20px 40px ${theme.glowColor}`
//             }}
//           >
//             <motion.div
//               className="absolute inset-0 opacity-10"
//               style={{
//                 background: `linear-gradient(135deg, ${theme.primary})`
//               }}
//               animate={{
//                 opacity: [0.05, 0.2, 0.05]
//               }}
//               transition={{ duration: 4, repeat: Infinity, delay: 3 }}
//             />
            
//             <div className="relative z-10">
//               <div className="flex items-center justify-between mb-4">
//                 <motion.div 
//                   className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
//                   style={{
//                     background: `linear-gradient(135deg, ${theme.primary})`
//                   }}
//                   animate={{
//                     boxShadow: [
//                       `0 4px 15px ${theme.glowColor}`,
//                       `0 8px 25px ${theme.glowColor}`,
//                       `0 4px 15px ${theme.glowColor}`
//                     ]
//                   }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 >
//                   <WeatherIcon3D weather={weatherData.weather} size="w-6 h-6" />
//                 </motion.div>
//                 <motion.div
//                   className="text-right"
//                   animate={{ 
//                     rotate: [0, 2, -2, 0],
//                     scale: [1, 1.02, 1]
//                   }}
//                   transition={{ duration: 6, repeat: Infinity }}
//                 >
//                   <div className={`text-xs ${theme.accent} opacity-60 mb-1`}>Current</div>
//                   <div className={`text-xs ${theme.accent} opacity-40`}>Conditions</div>
//                 </motion.div>
//               </div>
              
//               <motion.div 
//                 className={`text-lg font-bold ${theme.accent} mb-2 capitalize`}
//                 animate={{
//                   textShadow: [
//                     `0 0 10px ${theme.glowColor}`,
//                     `0 0 20px ${theme.glowColor}`,
//                     `0 0 10px ${theme.glowColor}`
//                   ]
//                 }}
//                 transition={{ duration: 3, repeat: Infinity }}
//               >
//                 {weatherData.weather}
//               </motion.div>
              
//               <div className={`text-sm ${theme.accent} opacity-70 mb-4`}>
//                 {theme.night ? 'Night conditions' : 'Daytime weather'}
//               </div>
              
//               <motion.div 
//                 className="flex items-center justify-between text-xs opacity-60"
//                 animate={{ y: [0, -1, 0] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               >
//                 <span className={theme.accent}>Perfect for farming</span>
//                 <motion.span 
//                   animate={{ rotate: [0, 10, -10, 0] }}
//                   transition={{ duration: 4, repeat: Infinity }}
//                 >
//                   🌾
//                 </motion.span>
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Field Information with Enhanced Design */}
//         <motion.div 
//           className="relative overflow-hidden rounded-3xl p-8 mb-8"
//           style={{
//             background: theme.cardBg,
//             backdropFilter: 'blur(30px)',
//             border: `1px solid ${theme.glowColor}`
//           }}
//           initial={{ opacity: 0, y: 80 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, delay: 1.4 }}
//           whileHover={{
//             boxShadow: `0 30px 60px ${theme.glowColor}`
//           }}
//         >
//           <motion.div
//             className="absolute inset-0 opacity-5"
//             style={{
//               background: `linear-gradient(135deg, ${theme.primary})`
//             }}
//             animate={{
//               background: [
//                 `linear-gradient(135deg, ${theme.primary})`,
//                 `linear-gradient(225deg, ${theme.primary})`,
//                 `linear-gradient(135deg, ${theme.primary})`
//               ]
//             }}
//             transition={{ duration: 8, repeat: Infinity }}
//           />
          
//           <div className="relative z-10">
//             <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 pb-6 border-b border-opacity-20" style={{ borderColor: theme.glowColor }}>
//               <motion.h3 
//                 className={`text-2xl font-bold ${theme.accent} flex items-center mb-4 lg:mb-0`}
//                 animate={{
//                   textShadow: [
//                     `0 0 20px ${theme.glowColor}`,
//                     `0 0 30px ${theme.glowColor}`,
//                     `0 0 20px ${theme.glowColor}`
//                   ]
//                 }}
//                 transition={{ duration: 3, repeat: Infinity }}
//               >
//                 <motion.span 
//                   className="mr-3 text-3xl"
//                   animate={{ 
//                     rotate: [0, 5, -5, 0],
//                     scale: [1, 1.1, 1]
//                   }}
//                   transition={{ duration: 4, repeat: Infinity }}
//                 >
//                   🌾
//                 </motion.span>
//                 Field Management System
//               </motion.h3>
              
//               <motion.div 
//                 className="flex items-center space-x-4"
//                 initial={{ opacity: 0, x: 50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 1.8, duration: 0.8 }}
//               >
//                 <motion.span 
//                   className="px-4 py-2 bg-green-400 bg-opacity-20 text-green-300 rounded-full text-sm font-medium"
//                   animate={{
//                     boxShadow: [
//                       '0 0 20px rgba(34, 197, 94, 0.2)',
//                       '0 0 30px rgba(34, 197, 94, 0.4)',
//                       '0 0 20px rgba(34, 197, 94, 0.2)'
//                     ]
//                   }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   🟢 Active Season
//                 </motion.span>
                
//                 <motion.button
//                   className="px-4 py-2 bg-blue-400 bg-opacity-20 text-blue-300 rounded-full text-sm font-medium"
//                   animate={{
//                     boxShadow: [
//                       '0 0 20px rgba(59, 130, 246, 0.2)',
//                       '0 0 30px rgba(59, 130, 246, 0.4)',
//                       '0 0 20px rgba(59, 130, 246, 0.2)'
//                     ]
//                   }}
//                   transition={{ duration: 2, repeat: Infinity, delay: 1 }}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   📊 View Analytics
//                 </motion.button>
//               </motion.div>
//             </div>
            
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               {/* Field Name */}
//               <motion.div 
//                 className="relative p-6 rounded-2xl"
//                 style={{
//                   background: 'rgba(34, 197, 94, 0.1)',
//                   border: '1px solid rgba(34, 197, 94, 0.2)'
//                 }}
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 2, duration: 0.8 }}
//                 whileHover={{ 
//                   scale: 1.02,
//                   boxShadow: '0 10px 30px rgba(34, 197, 94, 0.2)'
//                 }}
//               >
//                 <motion.div
//                   className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 opacity-5 rounded-2xl"
//                   animate={{ opacity: [0.03, 0.08, 0.03] }}
//                   transition={{ duration: 4, repeat: Infinity }}
//                 />
                
//                 <div className="relative z-10">
//                   <div className="flex items-center mb-4">
//                     <motion.div 
//                       className="w-12 h-12 bg-green-400 bg-opacity-20 rounded-xl flex items-center justify-center mr-4"
//                       animate={{
//                         rotate: [0, 360],
//                         scale: [1, 1.1, 1]
//                       }}
//                       transition={{ 
//                         rotate: { duration: 8, repeat: Infinity, ease: "linear" },
//                         scale: { duration: 2, repeat: Infinity }
//                       }}
//                     >
//                       <motion.span 
//                         className="text-green-400 text-2xl"
//                         animate={{ scale: [1, 1.2, 1] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                       >
//                         🌱
//                       </motion.span>
//                     </motion.div>
//                     <div className="text-sm text-green-300 opacity-80 font-medium">Field Identity</div>
//                   </div>
//                   <motion.div 
//                     className="text-xl font-bold text-green-200 mb-2"
//                     animate={{ x: [0, 2, 0] }}
//                     transition={{ duration: 3, repeat: Infinity }}
//                   >
//                     {fieldData.name}
//                   </motion.div>
//                   <div className="text-sm text-green-300 opacity-60">{fieldData.location}</div>
//                   <motion.div 
//                     className="mt-3 text-xs text-green-400 opacity-50"
//                     animate={{ opacity: [0.3, 0.7, 0.3] }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                   >
//                     📅 Est. {new Date(fieldData.createdAt).getFullYear()}
//                   </motion.div>
//                 </div>
//               </motion.div>
              
//               {/* Field Size */}
//               <motion.div 
//                 className="relative p-6 rounded-2xl"
//                 style={{
//                   background: 'rgba(59, 130, 246, 0.1)',
//                   border: '1px solid rgba(59, 130, 246, 0.2)'
//                 }}
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 2.2, duration: 0.8 }}
//                 whileHover={{ 
//                   scale: 1.02,
//                   boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)'
//                 }}
//               >
//                 <motion.div
//                   className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 opacity-5 rounded-2xl"
//                   animate={{ opacity: [0.03, 0.08, 0.03] }}
//                   transition={{ duration: 4, repeat: Infinity, delay: 1 }}
//                 />
                
//                 <div className="relative z-10">
//                   <div className="flex items-center mb-4">
//                     <motion.div 
//                       className="w-12 h-12 bg-blue-400 bg-opacity-20 rounded-xl flex items-center justify-center mr-4"
//                       animate={{
//                         scale: [1, 1.1, 1],
//                         rotate: [0, 5, -5, 0]
//                       }}
//                       transition={{ duration: 3, repeat: Infinity }}
//                     >
//                       <motion.span 
//                         className="text-blue-400 text-2xl"
//                         animate={{ rotate: [0, 90, 180, 270, 360] }}
//                         transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
//                       >
//                         📏
//                       </motion.span>
//                     </motion.div>
//                     <div className="text-sm text-blue-300 opacity-80 font-medium">Field Size</div>
//                   </div>
//                   <motion.div 
//                     className="text-xl font-bold text-blue-200 mb-2"
//                     animate={{ x: [0, 2, 0] }}
//                     transition={{ duration: 3, repeat: Infinity }}
//                   >
//                     {Math.round(fieldData.size)} acres
//                   </motion.div>
//                   <div className="text-sm text-blue-300 opacity-60">Created: {new Date(fieldData.createdAt).toLocaleDateString()}</div>
//                 </div>
//               </motion.div>

//               {/* Crop */}
//               <motion.div 
//                 className="relative p-6 rounded-2xl"
//                 style={{
//                   background: 'rgba(245, 158, 11, 0.1)',
//                   border: '1px solid rgba(245, 158, 11, 0.2)'
//                 }}
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 2.4, duration: 0.8 }}
//                 whileHover={{ 
//                   scale: 1.02,
//                   boxShadow: '0 10px 30px rgba(245, 158, 11, 0.2)'
//                 }}
//               >
//                 <motion.div
//                   className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 opacity-5 rounded-2xl"
//                   animate={{ opacity: [0.03, 0.08, 0.03] }}
//                   transition={{ duration: 4, repeat: Infinity, delay: 2 }}
//                 />
//                 <div className="relative z-10">
//                   <div className="flex items-center mb-4">
//                     <motion.div 
//                       className="w-12 h-12 bg-amber-400 bg-opacity-20 rounded-xl flex items-center justify-center mr-4"
//                       animate={{ scale: [1, 1.1, 1] }}
//                       transition={{ duration: 2, repeat: Infinity }}
//                     >
//                       <motion.span 
//                         className="text-amber-400 text-2xl"
//                         animate={{ rotate: [0, 10, -10, 0] }}
//                         transition={{ duration: 3, repeat: Infinity }}
//                       >
//                         🌾
//                       </motion.span>
//                     </motion.div>
//                     <div className="text-sm text-amber-300 opacity-80 font-medium">Crop</div>
//                   </div>
//                   <motion.div 
//                     className="text-xl font-bold text-amber-200 mb-2"
//                     animate={{ x: [0, 2, 0] }}
//                     transition={{ duration: 3, repeat: Infinity }}
//                   >
//                     {fieldData.crop}
//                   </motion.div>
//                   <div className="text-sm text-amber-300 opacity-60">Main cultivated crop</div>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };
 
// export default Dashboard;



import { useState } from "react";
import LocationSearch from "../components/climate/Locationsearch";
import MetricCard from "../components/climate/MetricCard";
import ClimateStrip from "../components/climate/ClimateStrip";
import ClimateInsights from "../components/climate/ClimateInsights";
import {
  TemperatureChart,
  PrecipitationChart,
  SoilMoistureChart,
  GDDChart,
  SolarWindChart,
} from "../components/climate/ClimateCharts";
import { useClimateData } from "../../src/hooks/useClimateData";

const RANGE_OPTIONS = [
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "180d", days: 180 },
  { label: "365d", days: 365 },
];

export default function ClimateAnalyticsDashboard() {
  const [location, setLocation] = useState(null);
  const [rangeDays, setRangeDays] = useState(90);
  const { history, gddSeries, summary, insights, forecast, loading, error, reload } = useClimateData(
    location,
    rangeDays
  );

  return (
    <div className="min-h-screen bg-[#0E1A14] text-[#EDEFE9] font-sans">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-[#2A3D33] pb-6 mb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#5FA8D3]">Climate Analytics</p>
            <h1 className="text-2xl font-semibold mt-1">Field climate conditions & trends</h1>
            <p className="text-sm text-[#8FA396] mt-1">
              Live meteorological and agro-climate data — no simulated values.
            </p>
          </div>
          <LocationSearch onSelect={setLocation} current={location} />
        </header>

        {!location && (
          <div className="rounded-xl border border-dashed border-[#2A3D33] p-10 text-center text-[#8FA396]">
            Search a field location above (or use GPS) to load live climate analytics.
          </div>
        )}

        {location && error && (
          <div className="rounded-xl border border-[#D9A441] bg-[#D9A44114] p-4 text-sm text-[#D9A441] flex items-center justify-between">
            <span>Couldn&apos;t load climate data: {error}</span>
            <button onClick={reload} className="font-mono text-xs underline hover:text-[#EDEFE9]">
              retry
            </button>
          </div>
        )}

        {location && (
          <>
            {/* Range selector */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[11px] font-mono text-[#8FA396]">ANALYSIS WINDOW</span>
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r.days}
                  onClick={() => setRangeDays(r.days)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-mono border transition-colors ${
                    rangeDays === r.days
                      ? "border-[#5FA8D3] bg-[#5FA8D31A] text-[#5FA8D3]"
                      : "border-[#2A3D33] text-[#8FA396] hover:border-[#5FA8D3]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
              {loading && <span className="text-[11px] font-mono text-[#8FA396] ml-2">loading…</span>}
            </div>

            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3 lg:grid-cols-6">
                <MetricCard label="Avg Temp" value={summary.avgTemp?.toFixed(1)} unit="°C" accent="#5FA8D3" />
                <MetricCard label="Total Rain" value={summary.totalPrecip?.toFixed(0)} unit="mm" accent="#8FC5E8" />
                <MetricCard label="Avg Humidity" value={summary.avgHumidity?.toFixed(0)} unit="%" accent="#5CA880" />
                <MetricCard label="Avg Wind" value={summary.avgWind?.toFixed(1)} unit="m/s" accent="#8FA396" />
                <MetricCard
                  label="Soil Moisture"
                  value={summary.avgSoilMoisture != null ? (summary.avgSoilMoisture * 100).toFixed(0) : null}
                  unit="%"
                  accent="#5CA880"
                  sub={summary.soilTrend > 0.001 ? "trending wetter" : summary.soilTrend < -0.001 ? "trending drier" : "stable"}
                />
                <MetricCard label="Heat/Frost Days" value={`${summary.heatStressDays}/${summary.frostDays}`} unit="days" accent="#D9A441" />
              </div>
            )}

            {/* Signature strip */}
            {history && (
              <div className="mb-6">
                <ClimateStrip series={history} />
              </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div className="mb-6">
                <ClimateInsights insights={insights} />
              </div>
            )}

            {/* Charts grid */}
            {history && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <TemperatureChart data={history} />
                <PrecipitationChart data={history} />
                <SoilMoistureChart data={history} />
                <GDDChart data={gddSeries} />
                <div className="lg:col-span-2">
                  <SolarWindChart data={history} />
                </div>
              </div>
            )}

            {/* 14-day forecast strip */}
            {forecast?.daily && (
              <div className="mt-6 rounded-xl border border-[#2A3D33] bg-[#152420] p-4">
                <h3 className="text-sm font-medium mb-3">14-day forecast</h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {forecast.daily.time.map((t, i) => (
                    <div
                      key={t}
                      className="flex min-w-[76px] flex-col items-center gap-1 rounded-lg border border-[#2A3D33] px-2 py-3"
                    >
                      <span className="text-[10px] font-mono text-[#8FA396]">
                        {new Date(t).toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                      <span className="text-sm font-semibold text-[#D9A441]">
                        {Math.round(forecast.daily.temperature_2m_max[i])}°
                      </span>
                      <span className="text-xs text-[#8FC5E8]">{Math.round(forecast.daily.temperature_2m_min[i])}°</span>
                      <span className="text-[10px] font-mono text-[#5FA8D3]">
                        {forecast.daily.precipitation_probability_max?.[i] ?? 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}