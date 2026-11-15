import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { api, registerUnauthorizedHandler, TOKEN_KEY } from '../services/api';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role?: number;
}

interface TokenResponse {
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
    register: (name: string, email: string, password: string) => Promise<boolean>;
    forgetPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<boolean>;
    uploadPhoto: (uri: string, mimeType?: string, fileName?: string) => Promise<void>;
    restoreSession: () => Promise<void>;
    signOut: () => Promise<void>;
}

const extractToken = (data: TokenResponse): string | undefined =>
    data.accessToken || data.access_token || data.token;

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isRestoring: true,

    signIn: async (email: string, password: string) => {
        // 1. Autentica na rota POST /auth/login do NestJS
        const { data } = await api.post<TokenResponse>('/auth/login', {
            email: email.trim().toLowerCase(),
            password,
        });

        const jwt = extractToken(data);
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

    register: async (name: string, email: string, password: string) => {
        // Envia apenas os campos permitidos no AuthRegisterDTO (sem role)
        const { data } = await api.post<TokenResponse>('/auth/register', {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
        });

        // Se o AuthService.registe já devolver o JWT, autentica direto; caso contrário retorna false para redirecionar ao Login
        const jwt = extractToken(data);
        if (jwt) {
            await SecureStore.setItemAsync(TOKEN_KEY, jwt);
            set({ token: jwt });

            const meResponse = await api.post<MeResponse>('/auth/me');
            set({ user: meResponse.data.user });
            return true;
        }

        return false;
    },

    forgetPassword: async (email: string) => {
        await api.post('/auth/forget', {
            email: email.trim().toLowerCase(),
        });
    },

    resetPassword: async (token: string, password: string) => {
        const { data } = await api.post<TokenResponse>('/auth/reset', {
            token: token.trim(),
            password,
        });

        const jwt = extractToken(data);
        if (jwt) {
            await SecureStore.setItemAsync(TOKEN_KEY, jwt);
            set({ token: jwt });

            const meResponse = await api.post<MeResponse>('/auth/me');
            set({ user: meResponse.data.user });
            return true;
        }

        return false;
    },

    uploadPhoto: async (uri: string, mimeType = 'image/jpeg', fileName = 'photo.jpg') => {
        const formData = new FormData();

        formData.append('file', {
            uri,
            type: mimeType,
            name: fileName,
        } as unknown as Blob);

        await api.post('/auth/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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

// Registra o handler global para invalidar o estado do Zustand e redirecionar ao Login em 401/403
registerUnauthorizedHandler(async () => {
    await useAuthStore.getState().signOut();
    router.replace('/login');
});