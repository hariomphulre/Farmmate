const FarmConsole = () => {
  return (
    <div>
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Farm Console</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Farm management console and controls will be displayed here.</p>
        
        {/* Placeholder for farm console features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Irrigation Controls</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span>Zone 1</span>
                <button className="bg-blue-500 text-white px-3 py-1 rounded">Off</button>
              </div>
              <div className="flex justify-between items-center">
                <span>Zone 2</span>
                <button className="bg-green-500 text-white px-3 py-1 rounded">On</button>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Sensor Readings</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Soil Moisture:</span> 65%
              </div>
              <div>
                <span className="font-medium">Temperature:</span> 28°C
              </div>
              <div>
                <span className="font-medium">Humidity:</span> 70%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmConsole;
