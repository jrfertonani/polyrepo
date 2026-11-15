import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "../store/authStore";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isRestoring, restoreSession, signOut } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isRestoring) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.muted}>Verificando sessão...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.profileCard}>
          <Text style={styles.badge}>Sessão Ativa (/auth/me)</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userDetail}>E-mail: {user.email}</Text>
          <Text style={styles.userDetail}>
            ID: {user.id} | Role: {user.role ?? "Padrão"}
          </Text>

          <Pressable
            style={styles.logoutButton}
            onPress={async () => {
              await signOut();
            }}
          >
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.guestBox}>
          <Text style={styles.title}>Você não está autenticado</Text>
          <Text style={styles.muted}>
            Faça login para validar seu token no NestJS.
          </Text>

          <Pressable
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>Ir para Login</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  guestBox: {
    alignItems: "center",
    width: "100%",
  },
  profileCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  userDetail: {
    fontSize: 14,
    color: "#475569",
    marginTop: 2,
  },
  muted: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  loginText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: "#fee2e2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#b91c1c",
    fontSize: 15,
    fontWeight: "600",
  },
});
