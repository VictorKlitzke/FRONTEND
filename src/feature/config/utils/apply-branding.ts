import type { SettingsDTO } from "../services/settings-service";

const DEFAULT_APP_TITLE = "Sistema de Agendamento";
const DEFAULT_FAVICON = "/vite.svg";

const BRAND_STYLE_VARS = [
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--brand-primary-rgb",
  "--brand-secondary-rgb",
  "--brand-gradient-main",
  "--brand-header-bg",
  "--brand-header-border",
  "--brand-header-shadow",
  "--brand-quick-actions-bg",
  "--brand-quick-actions-caption",
];

const normalizeHexColor = (value?: string | null) => {
  if (!value) return null;
  const hex = value.trim().replace("#", "");
  if (hex.length === 3) {
    return `#${hex
      .split("")
      .map((c) => `${c}${c}`)
      .join("")}`;
  }
  if (hex.length === 6) return `#${hex}`;
  return null;
};

const getReadableTextColor = (hexColor?: string | null) => {
  const normalized = normalizeHexColor(hexColor);
  if (!normalized) return null;
  const hex = normalized.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

const hexToRgb = (hexColor?: string | null) => {
  const normalized = normalizeHexColor(hexColor);
  if (!normalized) return null;
  const hex = normalized.replace("#", "");
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const mixHexColors = (base: string, target: string, ratio: number) => {
  const from = hexToRgb(base);
  const to = hexToRgb(target);
  if (!from || !to) return base;
  const clamped = Math.max(0, Math.min(1, ratio));
  const mix = (a: number, b: number) => Math.round(a + (b - a) * clamped);
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${toHex(mix(from.r, to.r))}${toHex(mix(from.g, to.g))}${toHex(mix(from.b, to.b))}`;
};

const injectBgOverrides = (settings: SettingsDTO) => {
  let styleTag = document.getElementById("brand-bg-overrides") as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "brand-bg-overrides";
    document.head.appendChild(styleTag);
  }

  const rules: string[] = [];
  if (settings.header_bg_color) {
    rules.push(`.brand-header { background: ${settings.header_bg_color} !important; }`);
  }
  if (settings.login_bg_color) {
    rules.push(`.brand-login-page { background: ${settings.login_bg_color} !important; }`);
  }
  if (settings.register_bg_color) {
    rules.push(`.brand-register-page { background: ${settings.register_bg_color} !important; }`);
  }
  if (settings.empresa_bg_color) {
    rules.push(`.brand-empresa-page { background: ${settings.empresa_bg_color} !important; }`);
  }
  styleTag.textContent = rules.join("\n");
};

export const clearBranding = () => {
  const root = document.documentElement;
  BRAND_STYLE_VARS.forEach((cssVar) => root.style.removeProperty(cssVar));

  const styleTag = document.getElementById("brand-bg-overrides");
  if (styleTag?.parentNode) {
    styleTag.parentNode.removeChild(styleTag);
  }

  document.title = DEFAULT_APP_TITLE;

  const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (link) {
    link.href = DEFAULT_FAVICON;
  }
};

export const applyBranding = (settings: SettingsDTO | null) => {
  if (!settings) return;
  const root = document.documentElement;

  if (settings.primary_color) {
    root.style.setProperty("--primary", settings.primary_color);
    root.style.setProperty("--sidebar-primary", settings.primary_color);
    const primaryForeground = getReadableTextColor(settings.primary_color);
    if (primaryForeground) {
      root.style.setProperty("--primary-foreground", primaryForeground);
      root.style.setProperty("--sidebar-primary-foreground", primaryForeground);
    }
  }

  if (settings.secondary_color) {
    root.style.setProperty("--secondary", settings.secondary_color);
    root.style.setProperty("--sidebar-accent", settings.secondary_color);
    const secondaryForeground = getReadableTextColor(settings.secondary_color);
    if (secondaryForeground) {
      root.style.setProperty("--secondary-foreground", secondaryForeground);
      root.style.setProperty("--sidebar-accent-foreground", secondaryForeground);
    }
  }

  const primary = normalizeHexColor(settings.primary_color) ?? "#059669";
  const secondary = normalizeHexColor(settings.secondary_color) ?? "#0d9488";
  const primaryRgb = hexToRgb(primary);
  const secondaryRgb = hexToRgb(secondary);

  if (primaryRgb) {
    root.style.setProperty("--brand-primary-rgb", `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
  }

  if (secondaryRgb) {
    root.style.setProperty("--brand-secondary-rgb", `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
  }

  root.style.setProperty("--brand-gradient-main", "linear-gradient(135deg, var(--primary), var(--secondary))");

  root.style.setProperty("--brand-header-bg", settings.header_bg_color?.trim() || "rgba(255, 255, 255, 0.92)");
  root.style.setProperty("--brand-header-border", `rgba(var(--brand-primary-rgb, 5, 150, 105), 0.16)`);
  root.style.setProperty("--brand-header-shadow", `0 1px 20px rgba(var(--brand-primary-rgb, 5, 150, 105), 0.08)`);

  const quickActionsBg = `linear-gradient(135deg, ${mixHexColors(primary, "#022c22", 0.55)} 0%, ${mixHexColors(primary, secondary, 0.5)} 45%, ${mixHexColors(secondary, "#0f172a", 0.35)} 100%)`;
  root.style.setProperty("--brand-quick-actions-bg", quickActionsBg);
  root.style.setProperty("--brand-quick-actions-caption", `rgba(var(--brand-primary-rgb, 5, 150, 105), 0.55)`);

  const accentColor = settings.secondary_color ?? settings.primary_color;
  if (accentColor) {
    root.style.setProperty("--accent", accentColor);
    const accentForeground = getReadableTextColor(accentColor);
    if (accentForeground) {
      root.style.setProperty("--accent-foreground", accentForeground);
    }
  }

  if (settings.brand_name) document.title = settings.brand_name;

  if (settings.favicon_url) {
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (link) {
      link.href = settings.favicon_url;
    }
  }

  injectBgOverrides(settings);
};
