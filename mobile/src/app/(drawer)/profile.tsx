import * as ImagePicker from "expo-image-picker";
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
import { useAuthStore } from "@/store/authStore";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export default function ProfilePhotoScreen() {
  const { user, photoVersion, uploadPhoto, deletePhoto, getProfilePhotoUrl } =
    useAuthStore();

  const [isUploading, setIsUploading] = useState(false);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  const remotePhotoUrl = getProfilePhotoUrl();

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

  if (!user) return null;

  const hasValidPhoto = Boolean(remotePhotoUrl && !photoLoadError);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
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
            style={[styles.uploadButton, isUploading && styles.buttonDisabled]}
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
      </View>
    </View>
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
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: "#2563eb",
    backgroundColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { fontSize: 38, fontWeight: "700", color: "#475569" },
  uploadButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 190,
    alignItems: "center",
  },
  uploadButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  removePhotoButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  removePhotoText: { color: "#dc2626", fontSize: 13, fontWeight: "600" },
  buttonDisabled: { opacity: 0.65 },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  userDetail: { fontSize: 14, color: "#475569", marginTop: 2 },
});
