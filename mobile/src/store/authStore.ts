import { File } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { api, registerUnauthorizedHandler, TOKEN_KEY } from '../services/api';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: number;
    photoUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isRestoring: boolean;
    photoVersion: number;
    signIn: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    forgetPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<boolean>;
    updateProfile: (payload: { name?: string; email?: string }) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    uploadPhoto: (uri: string, mimeType?: string, fileName?: string) => Promise<void>;
    deletePhoto: () => Promise<void>;
    getProfilePhotoUrl: () => string | null;
    fetchUsers: () => Promise<AuthUser[]>;
    updateUserRole: (userId: number, role: number) => Promise<AuthUser>;
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

        signIn: async (email, password) => {
            const { data } = await api.post<{ accessToken: string }>('/auth/login', {
                email: email.trim().toLowerCase(),
                password,
            });

            await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
            const meResponse = await api.post<AuthUser>('/auth/me');
            set({
                token: data.accessToken,
                user: meResponse.data,
                photoVersion: Date.now(),
            });
        },

        register: async (name, email, password) => {
            const { data } = await api.post<{ accessToken?: string }>('/auth/register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            if (data?.accessToken) {
                await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
                const meResponse = await api.post<AuthUser>('/auth/me');
                set({
                    token: data.accessToken,
                    user: meResponse.data,
                    photoVersion: Date.now(),
                });
                return true;
            }
            return false;
        },

        forgetPassword: async (email) => {
            await api.post('/auth/forget', { email: email.trim().toLowerCase() });
        },

        resetPassword: async (token, password) => {
            const { data } = await api.post<{ accessToken?: string }>('/auth/reset', {
                token: token.trim(),
                password,
            });

            if (data?.accessToken) {
                await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
                const meResponse = await api.post<AuthUser>('/auth/me');
                set({
                    token: data.accessToken,
                    user: meResponse.data,
                    photoVersion: Date.now(),
                });
                return true;
            }
            return false;
        },

        updateProfile: async (payload) => {
            const currentUser = get().user;
            if (!currentUser) throw new Error('Usuário não autenticado.');

            const cleanPayload: { name?: string; email?: string } = {};
            if (payload.name !== undefined) cleanPayload.name = payload.name.trim();
            if (payload.email !== undefined) {
                cleanPayload.email = payload.email.trim().toLowerCase();
            }

            const { data } = await api.patch<AuthUser>('/user/me', cleanPayload);

            set((state) => ({
                user: state.user
                    ? {
                        ...state.user,
                        ...data,
                        name: data?.name ?? cleanPayload.name ?? state.user.name,
                        email: data?.email ?? cleanPayload.email ?? state.user.email,
                    }
                    : null,
            }));
        },

        changePassword: async (currentPassword, newPassword) => {
            await api.patch('/auth/password', { currentPassword, newPassword });
        },

        uploadPhoto: async (uri, mimeType = 'image/jpeg', fileName = 'photo.jpg') => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

            const formData = new FormData();
            const nativeFile = new File(uri);
            formData.append('file', nativeFile as any, fileName);

            const response = await fetch(`${baseUrl}/auth/photo`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                const error: any = new Error(data?.message || 'Erro no upload da foto.');
                error.response = { status: response.status, data };
                throw error;
            }

            set((state) => ({
                user: state.user
                    ? {
                        ...state.user,
                        ...data,
                        photoUrl: data?.photoUrl ?? state.user.photoUrl,
                    }
                    : null,
                photoVersion: Date.now(),
            }));
        },

        deletePhoto: async () => {
            const { data } = await api.delete<AuthUser>('/auth/photo');
            set((state) => ({
                user: state.user
                    ? { ...state.user, ...data, photoUrl: null }
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

        fetchUsers: async () => {
            const { data } = await api.get<AuthUser[]>('/user');
            return data;
        },

        updateUserRole: async (userId, role) => {
            const { data } = await api.patch<AuthUser>(`/user/${userId}/role`, {
                role,
            });
            return data;
        },

        restoreSession: async () => {
            try {
                set({ isRestoring: true });
                const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);

                if (!savedToken) {
                    set({ user: null, token: null, isRestoring: false });
                    return;
                }

                const { data } = await api.post<AuthUser>('/auth/me');
                set({
                    token: savedToken,
                    user: data,
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