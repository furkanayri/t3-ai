import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from 'src/constants';
import store from 'store'


const handleAddHeader = (config: InternalAxiosRequestConfig<any>) => {
  const token = store.get('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}
const handleError = (error: any) => {
  return Promise.reject(error);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const tenantApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

})

export const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})


apiClient.interceptors.request.use(handleAddHeader, handleError);
tenantApiClient.interceptors.request.use(handleAddHeader, handleError);
adminApiClient.interceptors.request.use(handleAddHeader, handleError);


export default apiClient;
