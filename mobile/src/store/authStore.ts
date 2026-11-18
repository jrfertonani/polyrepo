import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { authService } from '@/features/auth/auth.service';
import { AuthUser } from '@/features/auth/auth.types';
import { registerUnauthorizedHandler, TOKEN_KEY } from '@/services/api';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isRestoring: boolean;
    photoVersion: number;
    setUser: (user: AuthUser) => void;
    signIn: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    forgetPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<boolean>;
    uploadPhoto: (
        uri: string,
        mimeType?: string,
        fileName?: string,
    ) => Promise<void>;
    deletePhoto: () => Promise<void>;
    getProfilePhotoUrl: () => string | null;
    restoreSession: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
    registerUnauthorizedHandler(async () => {
        set({ user: null, token: null });
    });

    return {
        user: null,
        token: null,
        isRestoring: true,
        photoVersion: Date.now(),

        setUser: (updatedUser) =>
            set((state) => ({
                user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
            })),

        signIn: async (email, password) => {
            const { accessToken } = await authService.login({
                email: email.trim().toLowerCase(),
                password,
            });

            await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
            const user = await authService.me();
            set({ token: accessToken, user, photoVersion: Date.now() });
        },

        register: async (name, email, password) => {
            const data = await authService.register({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            if (data?.accessToken) {
                await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
                const user = await authService.me();
                set({ token: data.accessToken, user, photoVersion: Date.now() });
                return true;
            }
            return false;
        },

        forgetPassword: async (email) => {
            await authService.forgetPassword(email.trim().toLowerCase());
        },

        resetPassword: async (token, password) => {
            const data = await authService.resetPassword(token.trim(), password);

            if (data?.accessToken) {
                await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
                const user = await authService.me();
                set({ token: data.accessToken, user, photoVersion: Date.now() });
                return true;
            }
            return false;
        },

        uploadPhoto: async (uri, mimeType, fileName) => {
            const updatedUser = await authService.uploadPhoto(
                uri,
                mimeType,
                fileName,
            );
            set((state) => ({
                user: state.user
                    ? {
                        ...state.user,
                        ...updatedUser,
                        photoUrl: updatedUser?.photoUrl ?? state.user.photoUrl,
                    }
                    : null,
                photoVersion: Date.now(),
            }));
        },

        deletePhoto: async () => {
            const updatedUser = await authService.deletePhoto();
            set((state) => ({
                user: state.user
                    ? { ...state.user, ...updatedUser, photoUrl: null }
                    : null,
                photoVersion: Date.now(),
            }));
        },

        getProfilePhotoUrl: () => {
            const { user, photoVersion } = get();
            if (!user?.photoUrl) return null;

            const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
            if (!baseUrl) return null;

            return `${baseUrl}${user.photoUrl}?v=${photoVersion}`;
        },

        restoreSession: async () => {
            try {
                set({ isRestoring: true });
                const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);

                if (!savedToken) {
                    set({ user: null, token: null, isRestoring: false });
                    return;
                }

                const user = await authService.me();
                set({
                    token: savedToken,
                    user,
                    isRestoring: false,
                    photoVersion: Date.now(),
                });
            } catch {
                await SecureStore.deleteItemAsync(TOKEN_KEY);
                set({ user: null, token: null, isRestoring: false });
            }
        },

        signOut: async () => {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            set({ user: null, token: null });
        },
    };
});