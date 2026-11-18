import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { UserRole } from "@/features/auth/auth.types";
import { useAuthStore } from "@/store/authStore";

type MenuItem = {
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  adminOnly?: boolean;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Principal",
    items: [{ label: "Início (Home)", route: "/", icon: "home-outline" }],
  },
  {
    title: "Minha Conta",
    items: [
      { label: "Foto de Perfil", route: "/profile", icon: "camera-outline" },
      {
        label: "Editar Dados do Perfil",
        route: "/edit-profile",
        icon: "person-outline",
      },
      {
        label: "Alterar Senha",
        route: "/change-password",
        icon: "lock-closed-outline",
      },
    ],
  },
  {
    title: "Administração",
    items: [
      {
        label: "Gerenciar Permissões",
        route: "/manage-users",
        icon: "shield-checkmark-outline",
        adminOnly: true,
      },
    ],
  },
];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user, signOut, getProfilePhotoUrl } = useAuthStore();

  const remotePhotoUrl = getProfilePhotoUrl();
  const isAdmin = user?.role === UserRole.Admin;

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  const handleSignOut = async () => {
    queryClient.clear();
    await signOut();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.userHeader}>
        {remotePhotoUrl ? (
          <Image source={{ uri: remotePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
        )}

        <View style={styles.userMeta}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || "Usuário"}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email || ""}
          </Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>
              ID: {user?.id} • {isAdmin ? "Admin (2)" : "Usuário (1)"}
            </Text>
          </View>
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollArea}
      >
        {MENU_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || isAdmin,
          );
          if (visibleItems.length === 0) return null;

          return (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {visibleItems.map((item) => {
                const isActive = pathname === item.route;

                return (
                  <Pressable
                    key={item.route}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isActive ? "#2563eb" : "#475569"}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        isActive && styles.menuItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#b91c1c" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default CustomDrawerContent;

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#ffffff" },
  userHeader: {
    backgroundColor: "#0f172a",
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#3b82f6",
    backgroundColor: "#1e293b",
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { fontSize: 22, fontWeight: "700", color: "#f8fafc" },
  userMeta: { flex: 1, marginLeft: 14 },
  userName: { fontSize: 16, fontWeight: "700", color: "#f8fafc" },
  userEmail: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  rolePill: {
    alignSelf: "flex-start",
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  rolePillText: { fontSize: 11, fontWeight: "600", color: "#60a5fa" },
  scrollArea: { paddingTop: 12, paddingHorizontal: 14 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#94a3b8",
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 12,
  },
  menuItemActive: { backgroundColor: "#eff6ff" },
  menuItemText: { fontSize: 15, fontWeight: "500", color: "#334155" },
  menuItemTextActive: { color: "#2563eb", fontWeight: "700" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: { color: "#b91c1c", fontSize: 15, fontWeight: "600" },
});
