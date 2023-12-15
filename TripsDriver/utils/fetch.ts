import axios from 'axios';
import {API_HOST} from '@env';
import {useAuthStore} from '../stores/auth';
import {User} from '../models/user';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

let isRefreshing = false;

let queue: QueueItem[] = [];

function handleQueue(err: Error | null, token = '') {
  queue.forEach(prom => {
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
  baseURL: API_HOST,
});

const refreshTokenUrl = `${API_HOST}/auth/refresh-token`;
const logoutUrl = `${API_HOST}/auth/logout`;
const whiteListUrls = [refreshTokenUrl, logoutUrl, `${API_HOST}/auth/login`];
const noTokenUrls = [`${API_HOST}/auth/login`];

axiosInstance.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().token;

    if (token && !noTokenUrls.includes(config.url || '')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const originalRequest = error.config;

    const authStore = useAuthStore.getState();

    authStore.set(state => {
      state.isValidating = false;
    });

    if (originalRequest.url && whiteListUrls.includes(originalRequest.url)) {
      return Promise.reject(error);
    }

    console.log(error, 'error', originalRequest.url);

    if (error.response.status === 403) {
      authStore.set(state => {
        state.user = undefined;
        state.token = undefined;
      });
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // There are no request trying to get the refresh token
    if (!isRefreshing && !originalRequest._retry) {
      console.log('Refreshing token');
      originalRequest._retry = true;

      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const result = await axiosInstance.post<{
            data: {token: string; user: User};
          }>(refreshTokenUrl);

          console.log('Token refreshed', result.data.data);

          await Keychain.setGenericPassword(
            result.data.data.user.email,
            result.data.data.token,
          );
          await AsyncStorage.setItem(
            'user',
            JSON.stringify(result.data.data.user),
          );
          authStore.set(state => {
            state.user = result.data.data.user;
            state.token = result.data.data.token;
          });

          resolve(axiosInstance(originalRequest));

          handleQueue(null, result.data.data.token);
          isRefreshing = false;
        } catch (e) {
          console.log('Error refreshing token', e);
          handleQueue(e as any);
          reject(e);
          authStore.set(state => {
            state.user = undefined;
            state.token = undefined;
          });
          isRefreshing = false;
        }
      });
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({resolve, reject});
      })
        .then(() => {
          return axios(originalRequest);
        })
        .catch(err => {
          return err;
        });
    }
    return Promise.reject(error);
  },
);
