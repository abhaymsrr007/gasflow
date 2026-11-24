const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let isRefreshing = false;
let failedQueue: any[] = [];

// Queue mein aayi hui requests ko process karne ka function
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Cookies bhejne ke liye
  };

  let response = await fetch(url, config);

  // 👇 Agar 401 (Unauthorized) aata hai, toh refresh logic chalao
  if (
    response.status === 401 && 
    !endpoint.includes('/auth/login') && 
    !endpoint.includes('/auth/refresh')
  ) {
    
    // Agar already refresh ho raha hai, toh is request ko queue mein daal do
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => fetch(url, config)) // Refresh hone ke baad wapas call karo
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Error');
          return data;
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Refresh API call karo (Cookie automatically jayegi)
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', 
      });

      if (!refreshResponse.ok) {
        throw new Error('Refresh failed');
      }

      // Refresh successful, ab queue process karo
      processQueue(null);
      
      // Original request dobara bhejo
      response = await fetch(url, config);
    } catch (error) {
      processQueue(error, null);
      
      // Agar refresh bhi fail ho gaya (matlab refresh token bhi expire), toh user ko logout karo
      if (typeof window !== 'undefined') {
        window.location.href = '/login'; 
      }
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  // JSON parse karo safely
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error("Non-JSON Response:", text.substring(0, 100));
    throw new Error(`API Error (${response.status}): Server sent non-JSON response.`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}