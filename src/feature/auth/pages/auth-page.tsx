import { Eye, EyeOff, Calendar } from "lucide-react"
import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent } from "../../../components/ui/card"
import { Separator } from "../../../components/ui/separator"
import { AuthStore } from "../stores/auth-store"
import { useAlert } from "../../../hooks/use-alert"
import { useNavigate } from "react-router-dom"

export default function AuthPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false)
  const { onLogin, loading } = AuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { showAlert } = useAlert();

  async function handleLogin() {
    if (!email || !password) {
      showAlert({
        title: "Falha na autenticação",
        message: "Informe todas as credenciais obrigatórias.",
        type: "destructive",
      });
      return;
    }
    try {
      await onLogin(email, password)
      navigate('/empresa/cadastro')
    } catch (error) {
      showAlert({
        title: "Falha na autenticação",
        message: "Erro ao autenticar.",
        type: "destructive",
      });
    }

  }

  const onRegister = () => {
    navigate('/register')
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* LEFT */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">

          <div className="flex items-center gap-2">
            <div className="bg-teal-500 p-2 rounded-lg text-white">
              <Calendar size={20} />
            </div>
            <span className="text-xl font-semibold">AgendaPro</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
            <p className="text-sm text-muted-foreground">
              Entre na sua conta para continuar
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Senha</label>
                <button className="text-sm text-teal-600 hover:underline">
                  Esqueceu a senha?
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              className="w-full bg-teal-500 hover:bg-teal-600"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou continue com</span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline">Google</Button>
            <Button variant="outline">GitHub</Button>
          </div>

          <p className="text-center text-sm">
            Não tem uma conta?{" "}
            <Button onClick={onRegister} className="">
              Registre-se grátis
            </Button>
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex items-center justify-center bg-blue-950 text-white p-12">
        <Card className="bg-transparent border-none shadow-none text-center space-y-6">
          <CardContent className="space-y-6 justify-center items-center flex-col">
            <div className="mx-auto bg-white/10 p-4 rounded-xl w-fit">
              <Calendar size={32} />
            </div>

            <h2 className="text-3xl font-bold text-white">
              Gerencie seus agendamentos com facilidade
            </h2>

            <p className="text-slate-300 text-center">
              Acesse sua agenda, serviços e estoque de qualquer lugar.
              Simplifique sua gestão e foque no crescimento do seu negócio.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
