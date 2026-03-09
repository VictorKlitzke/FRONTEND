import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AuthStore } from "@/feature/auth/stores/auth-store";

const INTRO_SEEN_KEY_PREFIX = "first-access-intro-seen:";

const START_STEPS = [
  {
    title: "Complete o perfil da empresa",
    description: "Revise nome, telefone, email e dados principais em Configuracoes > Empresa.",
  },
  {
    title: "Defina sua agenda publica",
    description: "Escolha dias de atendimento, horario de abertura/fechamento e duracao de cada horario.",
  },
  {
    title: "Cadastre servicos e profissionais",
    description: "Organize o que voce oferece para facilitar o agendamento dos clientes.",
  },
  {
    title: "Compartilhe o link de agendamento",
    description: "Depois de validar tudo, envie seu link para os clientes agendarem com facilidade.",
  },
] as const;

const EXPERIENCE_BLOCKS = [
  {
    icon: CalendarDays,
    title: "Agenda organizada",
    text: "Visualize seus horarios com clareza e acompanhe os atendimentos do dia.",
  },
  {
    icon: Users,
    title: "Clientes centralizados",
    text: "Mantenha informacoes dos clientes em um unico lugar para atendimento mais rapido.",
  },
  {
    icon: ClipboardCheck,
    title: "Processo simples",
    text: "Use o checklist inicial e comece a operar sem confusao no primeiro acesso.",
  },
] as const;

export const FirstAccessIntroPage = () => {
  const navigate = useNavigate();
  const userId = AuthStore((state) => state.user?.id);

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
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div
          className="absolute -top-20 -right-10 h-52 w-52 rounded-full opacity-30 blur-3xl"
          style={{ background: "rgba(var(--brand-primary-rgb, 5, 150, 105), 0.4)" }}
        />
        <div
          className="absolute -bottom-24 -left-10 h-52 w-52 rounded-full opacity-20 blur-3xl"
          style={{ background: "rgba(var(--brand-primary-rgb, 5, 150, 105), 0.25)" }}
        />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="h-12 w-12 rounded-2xl text-white flex items-center justify-center shrink-0"
              style={{ background: "var(--brand-gradient-main)" }}
            >
              <BookOpenText size={22} />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <Sparkles size={12} /> Primeiro acesso
              </div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">Bem-vindo ao seu painel</h1>
              <p className="text-sm text-slate-600 max-w-xl">
                Esta apresentacao foi feita para te guiar nos primeiros passos. Em poucos minutos, seu sistema fica pronto para receber agendamentos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={goToAgendaSetup}
            className="btn-gradient h-11 px-5 rounded-xl text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            Comecar agora
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {EXPERIENCE_BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <article key={block.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div
                className="h-10 w-10 rounded-xl text-white flex items-center justify-center mb-3"
                style={{ background: "var(--brand-gradient-main)" }}
              >
                <Icon size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">{block.title}</h2>
              <p className="text-xs text-slate-500 mt-1.5">{block.text}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">Seu roteiro de inicio</h2>
        <p className="text-sm text-slate-500 mb-5">Siga esta sequencia para configurar tudo sem dor de cabeca.</p>

        <div className="space-y-3">
          {START_STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex items-start gap-3">
              <div
                className="h-7 w-7 rounded-full text-white text-xs font-bold flex items-center justify-center mt-0.5"
                style={{ background: "var(--brand-gradient-main)" }}
              >
                {index + 1}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-900 text-sm font-semibold">
            <CheckCircle2 size={16} /> Checklist de primeiro acesso
          </div>
          <p className="text-xs text-emerald-800">Configure agenda, valide servicos e compartilhe seu link com seguranca.</p>
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
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-2">Resumo rapido</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="mt-0.5 text-emerald-600" />
            Defina os horarios em Configuracoes {">"} Agenda.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="mt-0.5 text-emerald-600" />
            Cadastre servicos e profissionais para o cliente escolher.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="mt-0.5 text-emerald-600" />
            Teste seu link publico antes de divulgar.
          </li>
        </ul>
      </section>
    </div>
  );
};
