import axios from 'axios';

// config

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_HOST_API_V2 });

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) =>
    Promise.reject(error)

);

// Response interceptor to handle responses globally
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (url: string, config: any) => {
  const accessToken = localStorage.getItem('accessToken');
  const headers = {
    ...config?.headers,
    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
  };

  const res = await axiosInstance.get(url, { ...config, headers });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  token: {
    get: (id: string) => `/tokenOrder/${id}`,
    create: '/tokenOrder',
    update: (id: string) => `/tokenOrder/${id}`,
    delete: (id: string) => `/tokenOrder/${id}`,
    list: '/tokenOrders',
  },
};


export const API_ENDPOINTS = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};

