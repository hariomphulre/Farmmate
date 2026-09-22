import Papa from 'papaparse';

// Function to parse CSV files
export const parseCSV = (csvData) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Function to calculate vegetation health status
export const getVegetationStatus = (value) => {
  if (value >= 0.8) return { status: "Excellent", color: "green" };
  if (value >= 0.6) return { status: "Good", color: "lightgreen" };
  if (value >= 0.4) return { status: "Moderate", color: "yellow" };
  if (value >= 0.2) return { status: "Poor", color: "orange" };
  return { status: "Critical", color: "red" };
};

// Function to format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Function to calculate date range for analytics
export const getDateRange = (days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate,
    endDate
  };
};

// Function to filter data by date range
export const filterDataByDateRange = (data, startDate, endDate) => {
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};
