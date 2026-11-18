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
import { authService } from "@/features/auth/auth.service";
import { useAuthStore } from "@/store/authStore";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleChangePassword = async () => {
    if (currentPassword.length < 6) {
      Alert.alert(
        "Validação",
        "Informe sua senha atual (mínimo 6 caracteres).",
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Validação", "A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(
        "Validação",
        "A nova senha deve ser diferente da senha atual.",
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Validação", "A confirmação da nova senha não coincide.");
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.changePassword({ currentPassword, newPassword });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      Alert.alert("Sucesso", "Sua senha foi alterada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const detail = Array.isArray(apiMessage)
        ? apiMessage.join("\n")
        : apiMessage || err.message || "Não foi possível alterar a senha.";
      Alert.alert("Erro", detail);
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
          <Text style={styles.title}>Alterar Senha</Text>
          <Text style={styles.subtitle}>
            Validação de segurança (PATCH /auth/password)
          </Text>

          <Text style={styles.label}>Senha Atual</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha atual"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
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

          <Text style={styles.label}>Confirmar Nova Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a nova senha"
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            editable={!isSubmitting}
          />

          <Pressable
            style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Atualizar Senha</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4, marginBottom: 24 },
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
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.65 },
  saveButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  cancelButtonText: { color: "#475569", fontSize: 15, fontWeight: "600" },
});
