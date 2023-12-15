import axios from "axios";
import { config } from "@configs";
import type { User } from "@models/user";
import { useAuthStore } from "@stores/auth";

let isRefreshing = false;

let queue: QueueItem[] = [];

function handleQueue(err: Error | null, token = "") {
  queue.forEach((prom) => {
    if (err) {
      prom.reject(err);
    } else {
      prom.resolve(token);
    }
  });
  queue = [];
}

interface QueueItem {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}

export const axiosInstance = axios.create({
  withCredentials: true,
});

axiosInstance.defaults.withCredentials = true;

const refreshTokenUrl = `${config.API_ENDPOINT}/auth/refresh-token`;
const logoutUrl = `${config.API_ENDPOINT}/auth/logout`;
const whiteListUrls = [
  refreshTokenUrl,
  logoutUrl,
  `${config.API_ENDPOINT}/auth/login`,
];

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    const authStore = useAuthStore.getState();

    authStore.set((state) => {
      state.isValidating = false;
    });
    if (originalRequest.url && whiteListUrls.includes(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response.status === 403) {
      authStore.set((state) => {
        state.user = undefined;
      });
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // There are no request trying to get the refresh token
    if (!isRefreshing && !originalRequest._retry) {
      authStore.set((state) => {
        state.isValidating = true;
      });
      originalRequest._retry = true;

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axiosInstance
          .post<{ data: { token: string; user: User } }>(refreshTokenUrl)
          .then((res) => {
            authStore.set((state) => {
              state.user = res.data.data.user;
            });

            resolve(axiosInstance(originalRequest));

            handleQueue(null, res.data.data.token);
          })
          .catch((err) => {
            handleQueue(err);
            reject(err);
            authStore.set((state) => {
              state.user = undefined;
            });
          })
          .then(() => {
            isRefreshing = false;
          })
          .finally(() => {
            authStore.set((state) => {
              state.isValidating = false;
            });
          });
      });
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      })
        .then(() => {
          return axios(originalRequest);
        })
        .catch((err) => {
          return err;
        });
    }
    return Promise.reject(error);
  }
);
