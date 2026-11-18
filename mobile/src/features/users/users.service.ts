import { AuthUser, UserRole } from '@/features/auth/auth.types';
import { api } from '@/services/api';

export interface UpdateProfilePayload {
    name?: string;
    email?: string;
}

export const usersService = {
    async updateMe(payload: UpdateProfilePayload): Promise<AuthUser> {
        const cleanPayload: UpdateProfilePayload = {};
        if (payload.name !== undefined) cleanPayload.name = payload.name.trim();
        if (payload.email !== undefined) {
            cleanPayload.email = payload.email.trim().toLowerCase();
        }

        const { data } = await api.patch<AuthUser>('/user/me', cleanPayload);
        return data;
    },

    async listAll(): Promise<AuthUser[]> {
        const { data } = await api.get<AuthUser[]>('/user');
        return data;
    },

    async updateRole(userId: number, role: UserRole): Promise<AuthUser> {
        const { data } = await api.patch<AuthUser>(`/user/${userId}/role`, {
            role,
        });
        return data;
    },
};