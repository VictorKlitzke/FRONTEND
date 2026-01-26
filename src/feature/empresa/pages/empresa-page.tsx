import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { useState } from "react"
import { useEmpresaStore } from "../stores/empresa-store"
import { useAlert } from "../../../hooks/use-alert"
import { useNavigate } from "react-router-dom"
import { AuthStore } from "../../auth/stores/auth-store"
import type { EmpresaDTO } from "../services/empresa-service"

type EmpresaFormData = Omit<EmpresaDTO, "userId">;

export const EmpresaPage = () => {
  const navigate = useNavigate();
  const { createEmpresa, loading } = useEmpresaStore();
  const { showAlert } = useAlert();
  const { user } = AuthStore();

  const [formData, setFormData] = useState<EmpresaFormData>({
    name: "",
    cnpj: "",
    address: "",
    city: "",
    state: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      showAlert({
        title: "Sessão expirada",
        message: "Faça login novamente para cadastrar sua empresa.",
        type: "destructive"
      });
      navigate("/login");
      return;
    }
    try {
      await createEmpresa(formData, user.id);
      showAlert({
        title: "Sucesso",
        message: "Empresa cadastrada com sucesso!",
        type: "success"
      });
      navigate("/dashboard");
    } catch (error) {
      showAlert({
        title: "Erro",
        message: "Falha ao cadastrar empresa. Verifique os dados.",
        type: "destructive"
      });
    }
  };

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

        <aside className="hidden lg:flex flex-col justify-center bg-blue-950 from-slate-900 to-slate-800 text-white px-16">
          <div className="max-w-md">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              📅
            </div>

            <h1 className="text-3xl font-bold mb-4">
              Comece a transformar seu negócio hoje
            </h1>

            <p className="text-slate-300 leading-relaxed">
              Junte-se a milhares de empresas que já usam o AgendaPro para
              simplificar sua gestão de agendamentos e estoque.
            </p>

            <ul className="mt-8 space-y-3 text-sm">
              <li>✔ 14 dias grátis, sem cartão</li>
              <li>✔ Suporte em português</li>
              <li>✔ Cancele quando quiser</li>
              <li>✔ Migração assistida</li>
            </ul>
          </div>
        </aside>

        <main className="flex items-center justify-center px-6">
          <Card className="w-full max-w-md border-none shadow-none">
            <CardContent className="p-0">

              <header className="mb-8 text-center">
                <div className="flex justify-center items-center gap-2 mb-4 text-xl font-semibold">
                  📅 AgendaPro
                </div>

                <h2 className="text-2xl font-bold">Crie sua conta</h2>
                <p className="text-sm text-muted-foreground">
                  Comece seu teste grátis de 14 dias
                </p>
              </header>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label>Nome da empresa</Label>
                  <Input
                    placeholder="Salão Beleza Total"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    placeholder="Rua das Flores, 123"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      placeholder="São Paulo"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input
                      placeholder="SP"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>

                <Button className="w-full bg-blue-950 hover:bg-blue-800" disabled={loading}>
                  {loading ? "Criando..." : "Criar conta grátis"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Ao criar uma conta, você concorda com nossos{" "}
                <span className="underline cursor-pointer">Termos de Uso</span>{" "}
                e{" "}
                <span className="underline cursor-pointer">
                  Política de Privacidade
                </span>
                .
              </p>

            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}