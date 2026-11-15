import { api } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Tipagem alinhada ao DTO / retorno seguro do NestJS
export interface User {
  id: string | number;
  name?: string;
  email: string;
  createdAt?: string;
}

export default function UsersScreen() {
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<User[]>("/user");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.mutedText}>Carregando usuários...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Erro ao buscar /user</Text>
        <Text style={styles.errorDetail}>{(error as Error).message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <Text style={styles.mutedText}>Nenhum usuário cadastrado.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name || "Sem nome"}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.id}>ID: {item.id}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  email: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
  },
  id: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 6,
  },
  mutedText: {
    marginTop: 12,
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b91c1c",
  },
  errorDetail: {
    fontSize: 14,
    color: "#dc2626",
    marginTop: 6,
    textAlign: "center",
  },
});
