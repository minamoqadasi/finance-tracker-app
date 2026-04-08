export type ThemeMode = "light" | "dark";
export type BackgroundPreset = "lavender" | "midnight" | "sunset";

type ThemeTokens = {
  mode: ThemeMode;
  backgroundPreset: BackgroundPreset;
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  success: string;
  danger: string;
  border: string;
  shadow: string;
  chart: string[];
};

const shared = {
  white: "#fffdfc",
  black: "#0d0a17",
};

const presets: Record<BackgroundPreset, { light: string; dark: string }> = {
  lavender: { light: "#f5efff", dark: "#191225" },
  midnight: { light: "#f0f4ff", dark: "#101827" },
  sunset: { light: "#fff4ec", dark: "#221218" },
};

export const authColors = {
  canvas: "#f5efff",
  card: "#fffdfc",
  text: "#1f1730",
  textMuted: "#6f628d",
  primary: "#7c3aed",
  primarySoft: "#efe4ff",
  border: "rgba(31, 23, 48, 0.08)",
  shadow: "rgba(45, 22, 84, 0.14)",
};

export function getTheme(mode: ThemeMode, backgroundPreset: BackgroundPreset): ThemeTokens {
  if (mode === "dark") {
    return {
      mode,
      backgroundPreset,
      background: presets[backgroundPreset].dark,
      backgroundAlt: "#140f1e",
      surface: "#1f1730",
      surfaceMuted: "#2a1f40",
      text: "#f7f2ff",
      textMuted: "#cbb8eb",
      primary: "#9f67ff",
      primaryStrong: "#7c3aed",
      primarySoft: "#382255",
      success: "#86efac",
      danger: "#fca5a5",
      border: "rgba(255, 255, 255, 0.08)",
      shadow: "rgba(0, 0, 0, 0.28)",
      chart: ["#9f67ff", "#c084fc", "#f472b6", "#60a5fa", "#34d399"],
    };
  }

  return {
    mode,
    backgroundPreset,
    background: presets[backgroundPreset].light,
    backgroundAlt: "#efe7ff",
    surface: shared.white,
    surfaceMuted: "#f6efff",
    text: "#1f1730",
    textMuted: "#6f628d",
    primary: "#8b5cf6",
    primaryStrong: "#7c3aed",
    primarySoft: "#efe4ff",
    success: "#15803d",
    danger: "#dc2626",
    border: "rgba(31, 23, 48, 0.08)",
    shadow: "rgba(57, 28, 108, 0.14)",
    chart: ["#8b5cf6", "#c084fc", "#f472b6", "#f59e0b", "#38bdf8"],
  };
}
