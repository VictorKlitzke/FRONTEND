import { Eye, EyeOff, Calendar, Sparkles, ShieldCheck, TrendingUp, Users, Clock, Star, ArrowRight, Zap } from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
import { Input } from "../../../components/ui/input"
import { AuthStore } from "../stores/auth-store"
import { useEmpresaStore } from "../../empresa/stores/empresa-store"
import { useAlert } from "../../../hooks/use-alert"
import { useNavigate } from "react-router-dom"

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: `${2 + Math.random() * 4}px`,
  duration: `${8 + Math.random() * 12}s`,
  delay: `${Math.random() * 8}s`,
  opacity: 0.3 + Math.random() * 0.5,
}))

const FEATURES = [
  { icon: Calendar, label: "Agenda Online", desc: "Gerencie horários em tempo real" },
  { icon: Users, label: "Gestão de Clientes", desc: "Histórico completo de cada cliente" },
  { icon: TrendingUp, label: "Relatórios", desc: "Insights para crescer seu negócio" },
  { icon: Zap, label: "WhatsApp Integrado", desc: "Confirmações automáticas" },
]

const STATS = [
  { value: "10k+", label: "Agendamentos/mês" },
  { value: "98%", label: "Satisfação" },
  { value: "2x", label: "Mais produtividade" },
]

export default function AuthPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { onLogin, loading, isAuthenticated } = AuthStore()
  const { fetchByUserId } = useEmpresaStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { showAlert } = useAlert()

  const heroRef = useRef<HTMLDivElement>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / rect.width
    const dy = (e.clientY - cy) / rect.height
    setParallax({ x: dx * 28, y: dy * 20 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 })
  }, [])

  async function handleLogin() {
    if (email === "" || password === "") {
      showAlert({
        title: "Falha na autenticação",
        message: "Informe todas as credenciais obrigatórias.",
        type: "destructive",
      })
      return
    }
    try {
      await onLogin(email, password)
      const user = AuthStore.getState().user
      const company = await fetchByUserId(user!.id)
      if (company) {
        navigate('/dashboard', { replace: true })
        return
      }
      navigate('/empresa/cadastro', { replace: true })
    } catch {
      showAlert({
        title: "Falha na autenticação",
        message: "Erro ao autenticar.",
        type: "destructive",
      })
    }
  }

  const onRegister = () => navigate('/register')

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-linear-to-br from-slate-100 via-slate-100 to-slate-200/80 brand-login-page">

      <div className={`flex items-center justify-center p-6 md:p-12 ${mounted ? "animate-slide-up" : "opacity-0"}`}>
        <div className="w-full max-w-md space-y-8">

          <div className="flex items-center gap-3 animate-fade-in">
            <div className="sidebar-brand-icon h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg animate-glow">
              <Calendar size={22} />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight gradient-text">AgendaPro</span>
              <div className="flex items-center gap-1 mt-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[11px] text-slate-500 ml-1">4.9/5 • 2.4k avaliações</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 animate-slide-up delay-100">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Bem-vindo de volta!
            </h1>
            <p className="text-slate-500">
              Entre na sua conta e continue transformando seu negócio.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/85 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50 animate-scale-in delay-200">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <Input
                    placeholder="seu@email.com"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200 pl-4 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Senha</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200 pr-12 text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                  className="btn-neutral-auth w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar na conta
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">ou</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Não tem uma conta?{" "}
              <button
                onClick={onRegister}
                className="font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Registre-se grátis →
              </button>
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 animate-fade-in delay-300">
            <ShieldCheck size={14} className="text-slate-500" />
            <span>Conexão segura SSL · Seus dados estão protegidos</span>
          </div>
        </div>
      </div>

      <div
        ref={heroRef}
        className="hidden lg:flex hero-bg relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Animated orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {}
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

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Parallax Content */}
        <div
          className="relative z-10 flex flex-col justify-center px-14 py-16 w-full"
          style={{
            transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.4}px)`,
            transition: "transform 0.12s ease-out",
          }}
        >
          {/* Main heading */}
          <div
            className="mb-10"
            style={{
              transform: `translate(${parallax.x * 0.6}px, ${parallax.y * 0.5}px)`,
              transition: "transform 0.12s ease-out",
            }}
          >
            <div className="glass rounded-2xl px-4 py-2 w-fit mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-slate-300" />
              <span className="text-slate-200 text-sm font-medium">Sistema de Gestão Profissional</span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Gestão inteligente
              <br />
              <span className="gradient-text-light">para seu negócio</span>
            </h2>

            <p className="text-slate-200/85 text-lg leading-relaxed max-w-md">
              Centralize sua agenda, equipe e estoque em um único lugar. Cresça com dados e automação.
            </p>
          </div>

          {/* Features grid */}
          <div
            className="grid grid-cols-2 gap-3 mb-10"
            style={{
              transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.6}px)`,
              transition: "transform 0.12s ease-out",
            }}
          >
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.label}
                  className="glass rounded-xl p-4 cursor-default group hover:bg-white/20 transition-all duration-300"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-slate-500/20 rounded-lg p-1.5 group-hover:bg-slate-400/25 transition-colors">
                      <Icon size={16} className="text-slate-300" />
                    </div>
                    <span className="text-white text-sm font-semibold">{feature.label}</span>
                  </div>
                  <p className="text-slate-200/75 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Stats row */}
          <div
            className="flex items-center gap-6"
            style={{
              transform: `translate(${parallax.x * 0.3}px, ${parallax.y * 0.7}px)`,
              transition: "transform 0.12s ease-out",
            }}
          >
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold gradient-text-light">{stat.value}</div>
                <div className="text-slate-300/75 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
            <div className="h-12 w-px bg-white/10 hidden xl:block" />
            <div className="hidden xl:flex items-center gap-2 glass rounded-full px-4 py-2">
              <Clock size={14} className="text-slate-300" />
              <span className="text-slate-200 text-xs font-medium">Suporte 24/7</span>
            </div>
          </div>
        </div>

        {/* Decorative ring */}
        <div
          className="absolute bottom-12 right-12 w-40 h-40 rounded-full border border-white/10 animate-spin-slow"
          style={{
            transform: `translate(${parallax.x * -0.3}px, ${parallax.y * -0.2}px)`,
            transition: "transform 0.12s ease-out",
          }}
        >
          <div className="absolute inset-4 rounded-full border border-white/8" />
          <div className="absolute inset-8 rounded-full border border-white/5" />
        </div>
      </div>
    </div>
  )
}
