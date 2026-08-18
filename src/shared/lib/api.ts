export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Important for sending/receiving cookies
  };

  // If uploading file, remove Content-Type so browser sets boundary automatically
  if (options.body instanceof FormData) {
    const headers = new Headers(config.headers);
    headers.delete('Content-Type');
    config.headers = headers;
  }

  try {
    let response = await fetch(url, config);

    // If unauthorized, try to refresh token automatically once
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          // Retry original request
          response = await fetch(url, config);
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
      }
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data?.error || response.statusText || 'An error occurred',
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Network error');
  }
};
