import { File } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { api, TOKEN_KEY } from "@/services/api";
import {
    AuthTokenResponse,
    AuthUser,
    ChangePasswordPayload,
    LoginPayload,
    RegisterPayload,
} from "./auth.types";

export const authService = {
    async login(payload: LoginPayload): Promise<AuthTokenResponse> {
        const { data } = await api.post<AuthTokenResponse>("/auth/login", payload);
        return data;
    },

    async register(payload: RegisterPayload): Promise<Partial<AuthTokenResponse>> {
        const { data } = await api.post<Partial<AuthTokenResponse>>(
            "/auth/register",
            payload,
        );
        return data;
    },

    async me(): Promise<AuthUser> {
        const { data } = await api.post<AuthUser>("/auth/me");
        return data;
    },

    async forgetPassword(email: string): Promise<void> {
        await api.post("/auth/forget", { email });
    },

    async resetPassword(
        token: string,
        password: string,
    ): Promise<Partial<AuthTokenResponse>> {
        const { data } = await api.post<Partial<AuthTokenResponse>>(
            "/auth/reset",
            { token, password },
        );
        return data;
    },

    async changePassword(payload: ChangePasswordPayload): Promise<void> {
        await api.patch("/auth/password", payload);
    },

    async uploadPhoto(
        uri: string,
        mimeType = "image/jpeg",
        fileName = "photo.jpg",
    ): Promise<AuthUser> {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

        const formData = new FormData();
        const nativeFile = new File(uri);
        formData.append("file", nativeFile as any, fileName);

        const response = await fetch(`${baseUrl}/auth/photo`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            const error: any = new Error(data?.message || "Erro no upload da foto.");
            error.response = { status: response.status, data };
            throw error;
        }

        return data as AuthUser;
    },

    async deletePhoto(): Promise<AuthUser> {
        const { data } = await api.delete<AuthUser>("/auth/photo");
        return data;
    },
};

export default authService;