const API_BASE_URL = 'http://localhost:3000'; 

export async function apiRequest(path, method = 'POST', body = {}, customHeaders = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: method === 'GET' ? undefined : JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Something went wrong');
    }

    return result;
  } catch (err) {
    console.error('API Error:', err.message);
    throw err;
  }
}
