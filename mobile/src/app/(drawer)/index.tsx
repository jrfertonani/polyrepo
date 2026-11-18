import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Início</Text>
      <Text style={styles.subtitle}>
        Use o menu lateral para navegar entre perfil, configurações e novos
        módulos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
});
