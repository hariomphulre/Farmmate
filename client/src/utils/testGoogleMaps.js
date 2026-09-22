// Test utility to verify Google Maps integration
export const testGoogleMapsIntegration = () => {
  console.log('Testing Google Maps Integration...');
  
  // Test 1: Check if Google Maps API is loaded
  if (window.google && window.google.maps) {
    console.log('✅ Google Maps API is loaded');
    
    // Test 2: Check if Drawing library is available
    if (window.google.maps.drawing && window.google.maps.drawing.DrawingManager) {
      console.log('✅ Google Maps Drawing library is loaded');
    } else {
      console.log('❌ Google Maps Drawing library is NOT loaded');
    }
    
    // Test 3: Check if Geometry library is available
    if (window.google.maps.geometry) {
      console.log('✅ Google Maps Geometry library is loaded');
    } else {
      console.log('❌ Google Maps Geometry library is NOT loaded');
    }
    
    return true;
  } else {
    console.log('❌ Google Maps API is NOT loaded');
    return false;
  }
};

export default testGoogleMapsIntegration;
