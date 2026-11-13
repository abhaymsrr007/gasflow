
import { View, Text, StyleSheet, Alert } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { theme } from "@/constants/theme";

export default function HomeScreen() {
  const handlePress = () => {
    Alert.alert("GASFlow", "AppButton is working successfully!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GASFlow</Text>

      <Text style={styles.subtitle}>
        Our reusable component is ready.
      </Text>

      <View style={styles.buttonContainer}>
        <AppButton
          title="Test AppButton"
          onPress={handlePress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },

  title: {
    fontSize: theme.typography.heading,
    fontWeight: "bold",
    color: theme.colors.primary,
  },

  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },

  buttonContainer: {
    width: "100%",
    marginTop: theme.spacing.xl,
  },
});
