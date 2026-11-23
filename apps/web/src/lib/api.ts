const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  // Dhyan do: Base URL mein /api add karna mat bhoolna agar endpoint mein nahi hai
  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  // Check karo ki response JSON hai ya nahi
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON Response:', text.substring(0, 100)); // Debug ke liye
    throw new Error(`API Error (${response.status}): Server ne JSON nahi bheja. Check karo ki backend chal raha hai.`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}