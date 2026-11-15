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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgetPassword, resetPassword } = useAuthStore();

  const [step, setStep] = useState<"forget" | "reset">("forget");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendForget = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Validação", "Informe um e-mail válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      await forgetPassword(email);
      Alert.alert(
        "Solicitação enviada",
        "Verifique seu e-mail para copiar o token de recuperação e informe-o abaixo.",
      );
      setStep("reset");
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const detail = Array.isArray(apiMessage)
        ? apiMessage.join("\n")
        : apiMessage || err.message || "Erro ao solicitar recuperação.";
      Alert.alert("Erro", detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token.trim()) {
      Alert.alert("Validação", "Cole o token recebido por e-mail.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Validação", "A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const autoAuthenticated = await resetPassword(token, newPassword);

      if (autoAuthenticated) {
        Alert.alert("Sucesso", "Senha redefinida com sucesso!");
        router.replace("/");
      } else {
        Alert.alert("Sucesso", "Senha redefinida! Entre com sua nova senha.");
        router.replace("/login");
      }
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const detail = Array.isArray(apiMessage)
        ? apiMessage.join("\n")
        : apiMessage || err.message || "Token inválido ou expirado.";
      Alert.alert("Erro ao redefinir", detail);
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
          <Text style={styles.title}>Recuperar Senha</Text>
          <Text style={styles.subtitle}>
            {step === "forget"
              ? "Etapa 1: Solicitar token (/auth/forget)"
              : "Etapa 2: Definir nova senha (/auth/reset)"}
          </Text>

          {step === "forget" ? (
            <>
              <Text style={styles.label}>E-mail cadastrado</Text>
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

              <Pressable
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleSendForget}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>
                    Enviar Token de Recuperação
                  </Text>
                )}
              </Pressable>

              <Pressable
                style={styles.switchStepLink}
                onPress={() => setStep("reset")}
                disabled={isSubmitting}
              >
                <Text style={styles.switchStepText}>
                  Já tenho o token em mãos
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>Token JWT de Recuperação</Text>
              <TextInput
                style={styles.input}
                placeholder="Cole o token recebido"
                autoCapitalize="none"
                autoCorrect={false}
                value={token}
                onChangeText={setToken}
                editable={!isSubmitting}
              />

              <Text style={styles.label}>Nova Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!isSubmitting}
              />

              <Pressable
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Redefinir Senha</Text>
                )}
              </Pressable>

              <Pressable
                style={styles.switchStepLink}
                onPress={() => setStep("forget")}
                disabled={isSubmitting}
              >
                <Text style={styles.switchStepText}>
                  Reenviar e-mail de recuperação
                </Text>
              </Pressable>
            </>
          )}

          <Pressable
            style={styles.backLink}
            onPress={() => router.replace("/login")}
            disabled={isSubmitting}
          >
            <Text style={styles.backText}>Voltar para o Login</Text>
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
  switchStepLink: {
    marginTop: 14,
    alignItems: "center",
  },
  switchStepText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
  backLink: {
    marginTop: 18,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 16,
  },
  backText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
  },
});
