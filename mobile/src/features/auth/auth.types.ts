export enum UserRole {
    User = 1,
    Admin = 2,
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    photoUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface AuthTokenResponse {
    accessToken: string;
}