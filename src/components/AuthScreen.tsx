import { useState } from "react";
import {
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

import { supabase } from "../lib/supabase";
import { colors } from "../theme/colors";

export function AuthScreen() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing info", "Enter both an email and password.");
      return;
    }

    setLoading(true);

    const response =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        : await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

    setLoading(false);

    if (response.error) {
      Alert.alert("Auth error", response.error.message);
      return;
    }

    if (mode === "sign-up") {
      Alert.alert(
        "Account created",
        "Check your email if Supabase email confirmation is enabled, then sign in."
      );
      setMode("sign-in");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>MyPocket</Text>
          <Text style={styles.title}>Simple mobile finance tracking with secure login.</Text>
          <Text style={styles.subtitle}>
            Start with email and password auth, then add transactions and recurring expenses after sign-in.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeButton, mode === "sign-in" && styles.modeButtonActive]}
              onPress={() => setMode("sign-in")}
            >
              <Text style={[styles.modeLabel, mode === "sign-in" && styles.modeLabelActive]}>
                Sign in
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, mode === "sign-up" && styles.modeButtonActive]}
              onPress={() => setMode("sign-up")}
            >
              <Text style={[styles.modeLabel, mode === "sign-up" && styles.modeLabelActive]}>
                Sign up
              </Text>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.slate600}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              placeholder="Minimum 6 characters"
              placeholderTextColor={colors.slate600}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable style={styles.submitButton} onPress={handleAuth} disabled={loading}>
            <Text style={styles.submitLabel}>
              {loading ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
            </Text>
          </Pressable>

          <Text style={styles.helperText}>
            This keeps login simple: just email and password with Supabase Auth.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    gap: 18,
    backgroundColor: colors.sand50,
  },
  heroCard: {
    padding: 24,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  kicker: {
    color: colors.teal700,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    color: colors.slate900,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
  },
  subtitle: {
    marginTop: 12,
    color: colors.slate600,
    fontSize: 16,
    lineHeight: 24,
  },
  formCard: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.sand100,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: colors.teal100,
  },
  modeLabel: {
    color: colors.slate600,
    fontWeight: "600",
  },
  modeLabelActive: {
    color: colors.teal700,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: colors.slate900,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    backgroundColor: colors.sand50,
    color: colors.slate900,
  },
  submitButton: {
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: colors.teal700,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  submitLabel: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  helperText: {
    color: colors.slate600,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});
