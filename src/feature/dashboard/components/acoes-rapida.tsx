import { useNavigate } from "react-router-dom";
import { menuItens } from "../../../shared/navigation/menu";
import { ArrowRight } from "lucide-react";
import { useSettingsStore } from "@/feature/config/store/settings-store";

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

const hexToRgb = (hexColor: string) => {
  const hex = hexColor.replace("#", "");
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const rgba = (hexColor: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const mixHexColors = (base: string, target: string, ratio: number) => {
  const from = hexToRgb(base);
  const to = hexToRgb(target);
  const clamped = Math.max(0, Math.min(1, ratio));
  const mix = (a: number, b: number) => Math.round(a + (b - a) * clamped);
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${toHex(mix(from.r, to.r))}${toHex(mix(from.g, to.g))}${toHex(mix(from.b, to.b))}`;
};

export const AcoesRapidas = () => {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const quickActions = menuItens.filter(item => item.quick);

  const primary = normalizeHexColor(settings.primary_color) ?? "#059669";
  const secondary = normalizeHexColor(settings.secondary_color) ?? "#0d9488";
  const tertiary = mixHexColors(primary, "#8b5cf6", 0.35);

  const gradientColors = [
    { bg: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, glow: rgba(primary, 0.28) },
    { bg: `linear-gradient(135deg, ${mixHexColors(secondary, "#0891b2", 0.45)} 0%, ${mixHexColors(secondary, "#6366f1", 0.4)} 100%)`, glow: rgba(secondary, 0.24) },
    { bg: `linear-gradient(135deg, ${tertiary} 0%, ${mixHexColors(secondary, "#ec4899", 0.5)} 100%)`, glow: rgba(tertiary, 0.24) },
    { bg: `linear-gradient(135deg, ${mixHexColors(primary, "#f59e0b", 0.45)} 0%, ${mixHexColors(secondary, "#ef4444", 0.45)} 100%)`, glow: rgba(secondary, 0.2) },
  ];

  return (
    <div
      className="px-4 sm:px-6 py-5"
      style={{
        background: "var(--brand-quick-actions-bg)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90 tracking-wide uppercase" style={{ letterSpacing: "0.08em" }}>
            Ações Rápidas
          </h3>
          <span className="text-xs" style={{ color: "var(--brand-quick-actions-caption)" }}>{quickActions.length} atalhos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            const colors = gradientColors[i % gradientColors.length];

            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="group relative glass rounded-2xl p-4 text-left overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                style={{
                  boxShadow: `0 4px 20px ${colors.glow}`,
                }}
              >
                {/* Hover shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />

                <div className="flex items-center gap-4">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ background: colors.bg, boxShadow: `0 4px 12px ${colors.glow}` }}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm">{action.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: rgba(primary, 0.55) }}>Acessar módulo →</div>
                  </div>

                  <div className="text-white/30 group-hover:text-white/70 transition-colors group-hover:translate-x-1 duration-200">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
