import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { api } from "./src/services/api";

export default function App() {
  const [status, setStatus] = useState<string>("Conectando à API...");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(`Conectado: ${JSON.stringify(res.data)}`))
      .catch((err) => setStatus(`Erro: ${err.message}`));
  }, []);

  return (
    <View style={styles.container}>
      <Text>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
