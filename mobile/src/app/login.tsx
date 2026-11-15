import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Validação", "Informe um endereço de e-mail válido.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Validação", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(email, password);
      router.replace("/");
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const detail = Array.isArray(apiMessage)
        ? apiMessage.join("\n")
        : apiMessage || err.message || "Não foi possível conectar ao servidor.";

      Alert.alert("Erro ao entrar", detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>
          Autenticação via NestJS (/auth/login)
        </Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!isSubmitting}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isSubmitting}
        />

        <Pressable
          style={styles.forgotLink}
          onPress={() => router.push("/forgot-password")}
          disabled={isSubmitting}
        >
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </Pressable>

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={styles.registerButton}
          onPress={() => router.push("/register")}
          disabled={isSubmitting}
        >
          <Text style={styles.registerButtonText}>Criar nova conta</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: 18,
  },
  forgotText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "600",
  },
});
