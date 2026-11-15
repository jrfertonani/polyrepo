import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuthStore } from "../store/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (name.trim().length < 2) {
      Alert.alert("Validação", "Informe seu nome.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Validação", "Informe um endereço de e-mail válido.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Validação", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validação", "As senhas não coincidem.");
      return;
    }

    try {
      setIsSubmitting(true);
      const autoAuthenticated = await register(name, email, password);

      if (autoAuthenticated) {
        router.replace("/");
      } else {
        Alert.alert(
          "Conta criada",
          "Cadastro realizado com sucesso! Faça login para continuar.",
        );
        router.replace("/login");
      }
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const detail = Array.isArray(apiMessage)
        ? apiMessage.join("\n")
        : apiMessage || err.message || "Não foi possível concluir o cadastro.";

      Alert.alert("Erro no cadastro", detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Cadastro via NestJS (/auth/register)
          </Text>

          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Ademir Silva"
            value={name}
            onChangeText={setName}
            editable={!isSubmitting}
          />

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

          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isSubmitting}
          />

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.backLink}
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={styles.backText}>
              Já tenho conta — Voltar ao Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
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
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  backLink: {
    marginTop: 18,
    alignItems: "center",
  },
  backText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
  },
});
