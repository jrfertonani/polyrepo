import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { AuthUser, useAuthStore } from "../store/authStore";

const ROLE_USER = 1;
const ROLE_ADMIN = 2;

export default function ManageUsersScreen() {
  const router = useRouter();
  const { user: currentUser, fetchUsers, updateUserRole } = useAuthStore();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

  const loadUsers = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);
        const list = await fetchUsers();
        setUsers(list);
      } catch (err: any) {
        const apiMessage = err.response?.data?.message;
        const detail = Array.isArray(apiMessage)
          ? apiMessage.join("\n")
          : apiMessage || err.message || "Erro ao carregar usuários.";
        Alert.alert("Acesso Negado / Erro", detail, [
          { text: "Voltar", onPress: () => router.back() },
        ]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchUsers, router],
  );

  useEffect(() => {
    if (!currentUser || currentUser.role !== ROLE_ADMIN) {
      router.replace("/");
      return;
    }
    loadUsers();
  }, [currentUser, loadUsers, router]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUsers(true);
  };

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
    const isCurrentlyAdmin = target.role === ROLE_ADMIN;
    const nextRole = isCurrentlyAdmin ? ROLE_USER : ROLE_ADMIN;
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
          onPress: async () => {
            try {
              setUpdatingId(target.id);
              const updated = await updateUserRole(target.id, nextRole);
              setUsers((prev) =>
                prev.map((item) =>
                  item.id === target.id
                    ? { ...item, role: updated.role }
                    : item,
                ),
              );
            } catch (err: any) {
              const apiMessage = err.response?.data?.message;
              const detail = Array.isArray(apiMessage)
                ? apiMessage.join("\n")
                : apiMessage || err.message || "Falha ao atualizar permissão.";
              Alert.alert("Erro", detail);
            } finally {
              setUpdatingId(null);
            }
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gerenciar Permissões</Text>
          <Text style={styles.subtitle}>
            {users.length} {users.length === 1 ? "usuário" : "usuários"}{" "}
            cadastrados
          </Text>
        </View>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </Pressable>
      </View>

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
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.muted}>Nenhum usuário encontrado.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isAdmin = item.role === ROLE_ADMIN;
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 56,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563eb",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
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
  listContent: {
    padding: 20,
    gap: 12,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 32,
  },
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
  avatarInitials: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
  },
  userInfo: {
    flex: 1,
    paddingRight: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  userEmail: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  adminBadge: {
    backgroundColor: "#dbeafe",
  },
  userBadge: {
    backgroundColor: "#f1f5f9",
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  adminBadgeText: {
    color: "#1d4ed8",
  },
  userBadgeText: {
    color: "#475569",
  },
  actionButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 96,
    alignItems: "center",
  },
  promoteButton: {
    backgroundColor: "#2563eb",
  },
  revokeButton: {
    backgroundColor: "#dc2626",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  muted: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
  },
});
