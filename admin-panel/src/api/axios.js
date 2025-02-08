import axios from 'axios';

// Environment variable'dan API URL'ini al
const baseURL = import.meta.env.VITE_API_URL;

console.log('API Base URL:', baseURL); // Debug için

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// İstek öncesi middleware
api.interceptors.request.use(
  (config) => {
    // Debug için daha detaylı loglama
    console.log('Request Config:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor ekleyelim
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url
      }
    });
    return Promise.reject(error);
  }
);

export default api; 