const apiHandler = async (url, method, body = null) => {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      console.warn(`${method} request to ${url} failed:`, data.error || data.errors);
      return { success: false, data };
    }
    return { success: true, data };
  } catch (error) {
    console.error(`Error during ${method} request to ${url}:`, error.message, error.stack);
    return { success: false, error };
  }
};

export { apiHandler };