import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthUser, UserRole } from '@/features/auth/auth.types';
import { useAuthStore } from '@/store/authStore';
import { UpdateProfilePayload, usersService } from './users.service';

export const USERS_QUERY_KEY = ['users'] as const;

export function useUsersList() {
    const user = useAuthStore((state) => state.user);
    const isRestoring = useAuthStore((state) => state.isRestoring);
    const isAdmin = !isRestoring && Boolean(user && user.role === UserRole.Admin);

    return useQuery({
        queryKey: USERS_QUERY_KEY,
        queryFn: usersService.listAll,
        enabled: isAdmin,
        retry: false,
    });
}

export function useUpdateProfile() {
    const setUser = useAuthStore((state) => state.setUser);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateProfilePayload) =>
            usersService.updateMe(payload),
        onSuccess: (updatedUser) => {
            setUser(updatedUser);
            queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
        },
    });
}

export function useUpdateUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
            usersService.updateRole(userId, role),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData<AuthUser[]>(USERS_QUERY_KEY, (oldList) =>
                oldList
                    ? oldList.map((u) =>
                        u.id === updatedUser.id ? { ...u, role: updatedUser.role } : u,
                    )
                    : [],
            );
        },
    });
}