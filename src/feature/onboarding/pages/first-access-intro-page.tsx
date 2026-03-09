import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenText, Route, Wrench, CalendarDays, CheckCircle2 } from "lucide-react";
import { AuthStore } from "@/feature/auth/stores/auth-store";

const INTRO_COPY = `# Guia de Primeiro Acesso\n\n## Visao geral do projeto\n- Backend API: autentica usuarios, persiste regras da agenda e recebe solicitacoes publicas.\n- Frontend privado: operacao da empresa (agenda, clientes, servicos, estoque e configuracoes).\n- Fluxo publico: pagina para clientes solicitarem agendamento usando as regras definidas pela empresa.\n\n## Fluxo recomendado para comecar\n1. Empresa: valide telefone, email e dados principais em Configuracoes > Empresa.\n2. Agenda publica: configure dias, horario inicial/final e duracao de slot em Configuracoes > Agenda.\n3. Servicos e profissionais: cadastre o que sera oferecido para aparecer no agendamento publico.\n4. Divulgacao: compartilhe o link publico apenas depois que a agenda estiver validada.\n\n## Regras de negocio importantes\n- Sem configuracao de agenda publica, o cliente externo nao consegue concluir solicitacao.\n- O sistema usa dias permitidos + janela de horario para montar slots disponiveis.\n- Qualquer alteracao salva em Configuracoes impacta a experiencia publica.`;

const MARKDOWN_PATH = "docs/GUIA-PRIMEIRO-ACESSO.md";

const INTRO_SEEN_KEY_PREFIX = "first-access-intro-seen:";

export const FirstAccessIntroPage = () => {
  const navigate = useNavigate();
  const userId = AuthStore((state) => state.user?.id);

  const introSections = useMemo(() => {
    return INTRO_COPY.split("\n\n").filter(Boolean);
  }, []);

  const markAsSeen = () => {
    if (!userId) return;
    sessionStorage.setItem(`${INTRO_SEEN_KEY_PREFIX}${userId}`, "1");
  };

  const goToAgendaSetup = () => {
    markAsSeen();
    navigate("/config?tab=agenda&firstSetup=1");
  };

  const goToDashboard = () => {
    markAsSeen();
    navigate("/dashboard");
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl text-white flex items-center justify-center shrink-0" style={{ background: "var(--brand-gradient-main)" }}>
            <BookOpenText size={22} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900">Introducao do sistema</h1>
            <p className="text-sm text-slate-600">Resumo rapido dos fluxos para seu primeiro acesso sem ficar perdido.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Route size={16} /> Fluxo principal
          </div>
          <p className="text-xs text-slate-500 mt-2">Empresa - Agenda - Servicos - Link publico</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <CalendarDays size={16} /> Ponto critico
          </div>
          <p className="text-xs text-slate-500 mt-2">Sem agenda publica configurada, o cliente externo nao agenda.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Wrench size={16} /> Guia em arquivo
          </div>
          <p className="text-xs text-slate-500 mt-2">Conteudo completo tambem esta em {MARKDOWN_PATH}</p>
        </div>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        {introSections.map((section) => {
          const lines = section.split("\n");
          const title = lines[0] ?? "";
          const items = lines.slice(1);

          if (title.startsWith("# ")) {
            return (
              <header key={title} className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">{title.replace("# ", "")}</h2>
              </header>
            );
          }

          if (title.startsWith("## ")) {
            return (
              <section key={title} className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title.replace("## ", "")}</h3>
                <div className="space-y-1.5 text-sm text-slate-600">
                  {items.map((line) => (
                    <p key={`${title}-${line}`}>{line}</p>
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}
      </article>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-emerald-900 text-sm font-semibold">
          <CheckCircle2 size={16} /> Proximo passo recomendado: configurar a agenda publica
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goToDashboard}
            className="h-10 px-4 rounded-xl border border-emerald-300 bg-white text-emerald-800 text-sm font-semibold"
          >
            Ir para dashboard
          </button>
          <button
            type="button"
            onClick={goToAgendaSetup}
            className="btn-gradient h-10 px-4 rounded-xl text-white text-sm font-semibold"
          >
            Configurar agenda agora
          </button>
        </div>
      </div>
    </div>
  );
};
