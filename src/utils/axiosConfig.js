import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://khlcle.pythonanywhere.com/api/',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ownerToken'); // Changed to match login component
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // If no refresh token, clear everything and redirect to login
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('https://khlcle.pythonanywhere.com/api/token/refresh/', {
          refresh: refreshToken,
        });

        if (response.data.access) {
          localStorage.setItem('ownerToken', response.data.access);
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          return axiosInstance(originalRequest);
        } else {
          clearAuthAndRedirect();
          return Promise.reject(new Error('Failed to refresh token'));
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const clearAuthAndRedirect = () => {
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  const username = localStorage.getItem('rememberedUsername');
  
  // Clear all auth data
  localStorage.removeItem('ownerToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('coffeeShopId');
  
  // Keep remember me preferences if enabled
  if (!rememberMe) {
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('rememberMe');
  } else {
    // Ensure username is preserved if remember me is enabled
    localStorage.setItem('rememberedUsername', username);
  }
  
  window.location.href = '/admin-login';
};

export default axiosInstance;