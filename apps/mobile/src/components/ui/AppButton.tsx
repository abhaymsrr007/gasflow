
import {
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
} from "react-native";

import { theme } from "@/constants/theme";

type AppButtonProps = PressableProps & {
  title: string;
};

export function AppButton({
  title,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={(state) => [
        styles.button,
        state.pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
});
