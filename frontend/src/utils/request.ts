import axios, {
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
  timeout: 120000, // 增加到 2 分钟
  withCredentials: true,
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    // 接受 200 和 201 状态码（201 表示创建成功）
    if (response.status === 200 || response.status === 201) {
      return data;
    }
    return Promise.reject(new Error(response.statusText || 'Error'));
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }

      if (status === 403) {
        console.error('拒绝访问');
      }

      if (status === 500) {
        console.error('服务端错误');
      }
    } else if (error.request) {
      console.error('请求未收到响应');
    } else {
      console.error('请求设置错误:', error.message);
    }

    return Promise.reject(error);
  }
);

interface RequestMethods {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const request: RequestMethods = {
  get(url, config) {
    return instance.get(url, config);
  },
  post(url, data, config) {
    return instance.post(url, data, config);
  },
  put(url, data, config) {
    return instance.put(url, data, config);
  },
  patch(url, data, config) {
    return instance.patch(url, data, config);
  },
  delete(url, config) {
    return instance.delete(url, config);
  },
};
export default request;
