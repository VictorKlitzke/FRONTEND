import { Sparkles, Calendar, Users, ShieldCheck, TrendingUp, Clock } from "lucide-react";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.7 + 3) % 100}%`,
  size: `${2 + (i % 3) + 1}px`,
  duration: `${8 + (i % 5) * 2}s`,
  delay: `${(i % 8)}s`,
  opacity: 0.3 + (i % 5) * 0.1,
}));

const FEATURES = [
  { icon: Calendar, label: "Agenda Online", desc: "Gerencie horários com facilidade" },
  { icon: Users, label: "Gestão de Clientes", desc: "Histórico completo por cliente" },
  { icon: TrendingUp, label: "Relatórios", desc: "Insights para crescer mais" },
  { icon: ShieldCheck, label: "Dados Seguros", desc: "Proteção total das informações" },
];

const STATS = [
  { value: "10k+", label: "Empresas ativas" },
  { value: "98%", label: "Satisfação" },
  { value: "2x", label: "Mais produtividade" },
];

export const EmpresaHeroPanel = () => {
  return (
    <aside className="hidden lg:flex hero-bg relative overflow-hidden">
      {/* Animated orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      {/* Particles */}
      <div className="particles-container">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-14 py-16 w-full">
        {/* Badge + Heading */}
        <div className="mb-10">
          <div className="glass rounded-2xl px-4 py-2 w-fit mb-6 flex items-center gap-2">
            <Sparkles size={16} className="text-slate-300" />
            <span className="text-slate-200 text-sm font-medium">Cadastro gratuito · Sem cartão</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Comece a transformar
            <br />
            <span className="gradient-text-light">seu negócio hoje</span>
          </h2>

          <p className="text-slate-200/85 text-lg leading-relaxed max-w-md">
            Junte-se a milhares de empresas que já usam o AgendaPro para centralizar agenda,
            equipe e estoque.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="glass rounded-xl p-4 cursor-default group hover:bg-white/20 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-slate-500/20 rounded-lg p-1.5 group-hover:bg-slate-400/30 transition-colors">
                    <Icon size={16} className="text-slate-300" />
                  </div>
                  <span className="text-white text-sm font-semibold">{feature.label}</span>
                </div>
                <p className="text-slate-200/75 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold gradient-text-light">{stat.value}</div>
              <div className="text-slate-300/75 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
          <div className="h-12 w-px bg-white/10 hidden xl:block" />
          <div className="hidden xl:flex items-center gap-2 glass rounded-full px-4 py-2">
            <Clock size={14} className="text-slate-300" />
            <span className="text-slate-200 text-xs font-medium">Migração assistida</span>
          </div>
        </div>
      </div>

      {/* Decorative ring */}
      <div className="absolute bottom-12 right-12 w-40 h-40 rounded-full border border-white/10 animate-spin-slow">
        <div className="absolute inset-4 rounded-full border border-white/8" />
        <div className="absolute inset-8 rounded-full border border-white/5" />
      </div>
    </aside>
  );
};
