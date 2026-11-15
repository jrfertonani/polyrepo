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

        // Ignora 401/403 vindos da própria tentativa de login para não interferir no fluxo de erro da tela de Login
        const isAuthRoute =
            requestUrl.includes('/auth/login') || requestUrl.includes('/auth/me');

        if ((status === 401 || status === 403) && !isAuthRoute && !isHandlingUnauthorized) {
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