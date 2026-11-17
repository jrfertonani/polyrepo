import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "../store/authStore";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (MaxFileSizeValidator do NestJS)

export default function HomeScreen() {
  const router = useRouter();
  const {
    user,
    isRestoring,
    photoVersion,
    restoreSession,
    signOut,
    uploadPhoto,
    deletePhoto,
    getProfilePhotoUrl,
  } = useAuthStore();

  const [isUploading, setIsUploading] = useState(false);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  const remotePhotoUrl = getProfilePhotoUrl();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    setPhotoLoadError(false);
  }, [photoVersion, user?.id]);

  const processAndUploadAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
      Alert.alert("Arquivo muito grande", "A imagem deve ter no máximo 10 MB.");
      return;
    }

    const validMimeType =
      asset.mimeType === "image/png" ? "image/png" : "image/jpeg";
    const extension = validMimeType === "image/png" ? "png" : "jpg";
    const fileName = asset.fileName || `photo.${extension}`;

    try {
      setIsUploading(true);
      await uploadPhoto(asset.uri, validMimeType, fileName);
      setPhotoLoadError(false);
      Alert.alert("Sucesso", "Foto enviada e salva no servidor!");
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const detail = Array.isArray(apiMessage)
        ? apiMessage.join("\n")
        : apiMessage || err.message || "Falha ao enviar a foto.";
      Alert.alert("Erro no upload", detail);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso à câmera para tirar uma foto.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.length) {
      await processAndUploadAsset(result.assets[0]);
    }
  };

  const handleOpenGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso à galeria para selecionar sua foto de perfil.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.length) {
      await processAndUploadAsset(result.assets[0]);
    }
  };

  const handleSelectPhotoSource = () => {
    Alert.alert("Foto de Perfil", "Escolha como deseja atualizar sua foto:", [
      { text: "Tirar Foto (Câmera)", onPress: handleOpenCamera },
      { text: "Escolher da Galeria", onPress: handleOpenGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleConfirmDeletePhoto = () => {
    Alert.alert(
      "Remover Foto",
      "Deseja realmente excluir sua foto de perfil atual?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUploading(true);
              await deletePhoto();
              setPhotoLoadError(false);
              Alert.alert("Sucesso", "Foto de perfil removida.");
            } catch (err: any) {
              const apiMessage = err.response?.data?.message;
              const detail = Array.isArray(apiMessage)
                ? apiMessage.join("\n")
                : apiMessage || err.message || "Falha ao remover a foto.";
              Alert.alert("Erro", detail);
            } finally {
              setIsUploading(false);
            }
          },
        },
      ],
    );
  };

  if (isRestoring) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.muted}>Verificando sessão...</Text>
      </View>
    );
  }

  const hasValidPhoto = Boolean(remotePhotoUrl && !photoLoadError);

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.profileCard}>
          <Text style={styles.badge}>Sessão Ativa (/auth/me)</Text>

          <View style={styles.avatarSection}>
            {hasValidPhoto ? (
              <Image
                key={remotePhotoUrl}
                source={{ uri: remotePhotoUrl! }}
                style={styles.avatar}
                onError={() => setPhotoLoadError(true)}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}

            <Pressable
              style={[
                styles.uploadButton,
                isUploading && styles.buttonDisabled,
              ]}
              onPress={handleSelectPhotoSource}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.uploadButtonText}>
                  {hasValidPhoto
                    ? "Alterar Foto de Perfil"
                    : "Enviar Foto de Perfil"}
                </Text>
              )}
            </Pressable>

            {hasValidPhoto && !isUploading && (
              <Pressable
                style={styles.removePhotoButton}
                onPress={handleConfirmDeletePhoto}
              >
                <Text style={styles.removePhotoText}>Remover Foto</Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userDetail}>E-mail: {user.email}</Text>
          <Text style={styles.userDetail}>
            ID: {user.id} | Role: {user.role ?? "Padrão"}
          </Text>

          <Pressable
            style={styles.editProfileButton}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={styles.editProfileText}>Editar Dados do Perfil</Text>
          </Pressable>

          <Pressable
            style={[styles.editProfileButton, { marginTop: 10 }]}
            onPress={() => router.push("/change-password")}
          >
            <Text style={styles.editProfileText}>Alterar Senha</Text>
          </Pressable>

          {user.role === 2 && (
            <Pressable
              style={[
                styles.editProfileButton,
                {
                  marginTop: 10,
                  borderColor: "#2563eb",
                  backgroundColor: "#eff6ff",
                },
              ]}
              onPress={() => router.push("/manage-users")}
            >
              <Text style={[styles.editProfileText, { color: "#1d4ed8" }]}>
                Gerenciar Permissões (Admin)
              </Text>
            </Pressable>
          )}

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
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: "#2563eb",
    backgroundColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "700",
    color: "#475569",
  },
  uploadButton: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 180,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  removePhotoButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  removePhotoText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.65,
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
  editProfileButton: {
    marginTop: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editProfileText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 14,
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
