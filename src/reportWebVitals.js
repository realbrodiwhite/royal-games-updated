// src/reportWebVitals.js

// Function to report web vitals
const reportWebVitals = onPerfEntry => {
  // Check if onPerfEntry is a function
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import the web-vitals module
    import('web-vitals').then(({ 
      // Import the following functions from web-vitals
      getCLS, 
      getFID, 
      getFCP, 
      getLCP, 
      getTTFB 
    }) => {
      // Call each of the imported functions and pass onPerfEntry as an argument
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Export the reportWebVitals function as the default export
export default reportWebVitals;