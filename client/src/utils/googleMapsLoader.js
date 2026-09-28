// Utility for loading Google Maps API consistently across components
class GoogleMapsLoader {
  constructor() {
    this.isLoading = false;
    this.isLoaded = false;
    this.loadPromise = null;
    this.callbacks = [];
  }

  async loadGoogleMaps(libraries = ['drawing', 'geometry', 'places']) {
    // If already loaded, ensure requested libraries are available
    if (this.isLoaded && window.google && window.google.maps) {
      if (window.google.maps.importLibrary) {
        try {
          await Promise.all(
            libraries.map(async (lib) => {
              if (!window.google.maps[lib]) {
                try {
                  await window.google.maps.importLibrary(lib);
                } catch (err) {
                  console.warn(`Could not import Google Maps library: ${lib}`, err);
                }
              }
            })
          );
        } catch (e) {
          console.warn('Error importing libraries:', e);
        }
      }
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.isLoading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript && window.google && window.google.maps) {
        this.isLoaded = true;
        this.isLoading = false;
        resolve();
        return;
      }

      const apiKey = "AIzaSyA3vUl0jnyrAi_awYheUAYjFNDKCUaDpeU";
      const script = document.createElement('script');
      const allLibs = Array.from(new Set([...libraries, 'drawing', 'geometry', 'places']));
      const libraryString = `&libraries=${allLibs.join(',')}`;
      const callbackName = `initGoogleMaps_${Date.now()}`;
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${libraryString}&loading=async&callback=${callbackName}`;
      script.async = true;
      script.defer = true;

      // Set up callback
      window[callbackName] = () => {
        this.isLoaded = true;
        this.isLoading = false;
        console.log('Google Maps API loaded successfully');
        delete window[callbackName];
        resolve();
      };

      script.onerror = () => {
        this.isLoading = false;
        console.error('Failed to load Google Maps API script');
        delete window[callbackName];
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  // Method to check if Google Maps is ready
  isReady() {
    return this.isLoaded && window.google && window.google.maps;
  }

  // Method to wait for Google Maps to be ready
  whenReady() {
    if (this.isReady()) {
      return Promise.resolve();
    }
    return this.loadGoogleMaps();
  }
}

// Create a singleton instance
const googleMapsLoader = new GoogleMapsLoader();

export default googleMapsLoader;
