import axios, { AxiosInstance } from "axios";

const API = process.env.BASE_API || "http://localhost:3000/api";

class Fetcher {
  axios: AxiosInstance;

  constructor(config?: any) {
    this.axios = axios.create({
      baseURL: API,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    if (config &&.accessToken && config.refreshToken) {
      this.axios.defaults.headers = {
        ...this.axios.defaults.headers,
        Authorization: `Bearer ${config.accessToken}`,
        "X-Refresh-Token": config.refreshToken,
      };
    }

    const that = this;
    // interceptor
    this.axios.interceptors.response.use(
      async (response) => {
        const { code } = response.data;
        if (code === 401 && config.accessToken && config.refreshToken) {
          const refreshed = await that.axios.post(
            "api/auth/refresh",
            undefined
          );
          if (refreshed.status === 200) {
            const { accessToken, refreshToken } = refreshed.data;
            const newConfig = response.config;
            newConfig.headers["Authorization"] = accessToken;
            newConfig.headers["X-Refresh-Token"] = refreshToken;
            newConfig.baseURL = API;
            return that.axios(newConfig);
          }
        }
        return response;
      },
      (error) => {
        console.warn("Error status", error.response.status);
        // return Promise.reject(error)
        if (error.response) {
          console.error;
        } else {
          return Promise.reject(error);
        }
      }
    );
  }

  get(endpoint: string, config?: any) {
    return this.axios.get(endpoint, config);
  }

  list(endpoint: string, config?: any) {
    return this.axios.get(endpoint, config);
  }

  post(endpoint: string, data: any, config?: any) {
    return this.axios.post(endpoint, data, config);
  }

  put(endpoint: string, data: any, config?: any) {
    return this.axios.put(endpoint, data, config);
  }

  patch(endpoint: string, data: any, config?: any) {
    return this.axios.patch(endpoint, data, config);
  }

  delete(endpoint: string, config?: any) {
    return this.axios.delete(endpoint, config);
  }
}

export default Fetcher;
