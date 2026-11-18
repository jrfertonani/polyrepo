import { Drawer } from "expo-router/drawer";
import { CustomDrawerContent } from "@/components/layout/CustomDrawerContent";
import { UserRole } from "@/features/auth/auth.types";
import { useAuthStore } from "@/store/authStore";

export default function DrawerLayout() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === UserRole.Admin;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#0f172a",
        headerTitleStyle: { fontWeight: "700" },
        drawerStyle: { width: 290 },
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Início" }} />
      <Drawer.Screen name="profile" options={{ title: "Foto de Perfil" }} />
      <Drawer.Screen
        name="edit-profile"
        options={{ title: "Editar Dados do Perfil" }}
      />
      <Drawer.Screen
        name="change-password"
        options={{ title: "Alterar Senha" }}
      />

      <Drawer.Protected guard={isAdmin}>
        <Drawer.Screen
          name="manage-users"
          options={{ title: "Gerenciar Permissões" }}
        />
      </Drawer.Protected>
    </Drawer>
  );
}
