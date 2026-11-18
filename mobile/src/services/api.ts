import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'access_token';

type UnauthorizedCallback = () => Promise<void> | void;

let onUnauthorizedCallback: UnauthorizedCallback | null = null;
let isHandlingUnauthorized = false;

export const registerUnauthorizedHandler = (callback: UnauthorizedCallback) => {
    onUnauthorizedCallback = callback;
};

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';

        const isAuthCredentialRoute =
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/register') ||
            requestUrl.includes('/auth/forget') ||
            requestUrl.includes('/auth/reset') ||
            requestUrl.includes('/auth/password') ||
            requestUrl.includes('/auth/me');

        if (
            (status === 401 || status === 403) &&
            !isAuthCredentialRoute &&
            !isHandlingUnauthorized
        ) {
            isHandlingUnauthorized = true;

            try {
                await SecureStore.deleteItemAsync(TOKEN_KEY);
                if (onUnauthorizedCallback) {
                    await onUnauthorizedCallback();
                }
            } finally {
                isHandlingUnauthorized = false;
            }
        }

        return Promise.reject(error);
    },
);