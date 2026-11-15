import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { api, TOKEN_KEY } from '../services/api';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role?: number;
}

interface LoginResponse {
    accessToken?: string;
    access_token?: string;
    token?: string;
}

interface MeResponse {
    user: AuthUser;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isRestoring: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    restoreSession: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isRestoring: true,

    signIn: async (email: string, password: string) => {
        // 1. Autentica na rota POST /auth/login do NestJS
        const { data } = await api.post<LoginResponse>('/auth/login', {
            email: email.trim().toLowerCase(),
            password,
        });

        const jwt = data.accessToken || data.access_token || data.token;
        if (!jwt) {
            throw new Error('Token JWT não encontrado na resposta de /auth/login.');
        }

        // 2. Salva o token criptografado no dispositivo
        await SecureStore.setItemAsync(TOKEN_KEY, jwt);
        set({ token: jwt });

        // 3. Busca os dados do usuário logado na rota POST /auth/me
        const meResponse = await api.post<MeResponse>('/auth/me');
        set({ user: meResponse.data.user });
    },

    restoreSession: async () => {
        try {
            const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
            if (!savedToken) {
                set({ user: null, token: null, isRestoring: false });
                return;
            }

            // Valida o token armazenado diretamente no POST /auth/me do NestJS
            const { data } = await api.post<MeResponse>('/auth/me');
            set({ user: data.user, token: savedToken, isRestoring: false });
        } catch {
            // Token expirado ou inválido: limpa o armazenamento local
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            set({ user: null, token: null, isRestoring: false });
        }
    },

    signOut: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        set({ user: null, token: null });
    },
}));