import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuthUser, UserRole } from "@/features/auth/auth.types";
import { useUpdateUserRole, useUsersList } from "@/features/users/useUsers";
import { useAuthStore } from "@/store/authStore";

export default function ManageUsersScreen() {
  const currentUser = useAuthStore((state) => state.user);
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useUsersList();
  const updateRoleMutation = useUpdateUserRole();

  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  }, [users, search]);

  const handleToggleRole = (target: AuthUser) => {
    const isCurrentlyAdmin = target.role === UserRole.Admin;
    const nextRole = isCurrentlyAdmin ? UserRole.User : UserRole.Admin;
    const actionLabel = isCurrentlyAdmin
      ? "Remover permissão de Admin"
      : "Promover a Admin";

    Alert.alert(
      actionLabel,
      `Deseja ${isCurrentlyAdmin ? "rebaixar" : "promover"} ${target.name} (${target.email})?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: isCurrentlyAdmin ? "destructive" : "default",
          onPress: () => {
            setUpdatingId(target.id);
            updateRoleMutation.mutate(
              { userId: target.id, role: nextRole },
              {
                onError: (err: any) => {
                  const apiMessage = err.response?.data?.message;
                  const detail = Array.isArray(apiMessage)
                    ? apiMessage.join("\n")
                    : apiMessage ||
                      err.message ||
                      "Falha ao atualizar permissão.";
                  Alert.alert("Erro", detail);
                },
                onSettled: () => setUpdatingId(null),
              },
            );
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.muted}>Carregando usuários...</Text>
      </View>
    );
  }

  if (isError) {
    const err = error as any;
    const status = err?.response?.status;
    const apiMessage = err?.response?.data?.message;
    const detail = Array.isArray(apiMessage)
      ? apiMessage.join("\n")
      : apiMessage || err?.message || "Erro ao buscar /user.";

    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Erro ao buscar /user {status ? `(HTTP ${status})` : ""}
        </Text>
        <Text style={styles.errorDetail}>{detail}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.actionButtonText}>Tentar Novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou e-mail..."
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.muted}>Nenhum usuário encontrado.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isAdmin = item.role === UserRole.Admin;
          const isSelf = item.id === currentUser?.id;
          const isBusy = updatingId === item.id;
          const avatarUri =
            item.photoUrl && baseUrl ? `${baseUrl}${item.photoUrl}` : null;

          return (
            <View style={styles.userCard}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>
                    {item.name?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}

              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.name} {isSelf ? "(Você)" : ""}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {item.email}
                </Text>
                <View
                  style={[
                    styles.roleBadge,
                    isAdmin ? styles.adminBadge : styles.userBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      isAdmin ? styles.adminBadgeText : styles.userBadgeText,
                    ]}
                  >
                    {isAdmin ? "Admin (2)" : "Usuário (1)"}
                  </Text>
                </View>
              </View>

              {!isSelf && (
                <Pressable
                  style={[
                    styles.actionButton,
                    isAdmin ? styles.revokeButton : styles.promoteButton,
                    isBusy && styles.buttonDisabled,
                  ]}
                  onPress={() => handleToggleRole(item)}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.actionButtonText}>
                      {isAdmin ? "Tirar Admin" : "Dar Admin"}
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#dc2626",
    textAlign: "center",
  },
  errorDetail: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  searchContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  searchInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  listContent: { padding: 20, gap: 12 },
  emptyBox: { alignItems: "center", paddingVertical: 32 },
  userCard: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { fontSize: 16, fontWeight: "700", color: "#475569" },
  userInfo: { flex: 1, paddingRight: 10 },
  userName: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  userEmail: { fontSize: 13, color: "#64748b", marginTop: 2 },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  adminBadge: { backgroundColor: "#dbeafe" },
  userBadge: { backgroundColor: "#f1f5f9" },
  roleBadgeText: { fontSize: 11, fontWeight: "700" },
  adminBadgeText: { color: "#1d4ed8" },
  userBadgeText: { color: "#475569" },
  actionButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 96,
    alignItems: "center",
  },
  promoteButton: { backgroundColor: "#2563eb" },
  revokeButton: { backgroundColor: "#dc2626" },
  buttonDisabled: { opacity: 0.65 },
  actionButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },
  muted: { marginTop: 8, fontSize: 14, color: "#64748b" },
});
