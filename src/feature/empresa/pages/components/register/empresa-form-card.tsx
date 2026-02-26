import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import type { EmpresaDTO } from "@/feature/empresa/services/empresa-service";

type EmpresaFormData = Omit<EmpresaDTO, "userId">;

type EmpresaFormCardProps = {
  formData: EmpresaFormData;
  loading: boolean;
  documentError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof EmpresaFormData, value: string) => void;
};

export const EmpresaFormCard = ({
  formData,
  loading,
  documentError,
  onSubmit,
  onChange,
}: EmpresaFormCardProps) => {
  return (
    <div className="w-full max-w-md bg-white/85 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50">
      <div className="p-8">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 text-xl font-semibold">
              <div className="sidebar-brand-icon h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-slate-900 font-bold">AgendaPro</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/70 bg-slate-100/70 px-2.5 py-1 text-xs text-slate-700">
              <ShieldCheck className="h-3 w-3" />
              Seguro
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Crie sua empresa</h2>
          <p className="text-sm text-slate-500 mt-1">Preencha os dados para começar</p>
        </header>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Nome da empresa</Label>
            <Input
              placeholder="Salão Beleza Total"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200"
              value={formData.name}
              onChange={(event) => onChange("name", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">CPF / CNPJ</Label>
            <Input
              placeholder="Somente números"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200"
              value={formData.cnpj}
              onChange={(event) => onChange("cnpj", event.target.value)}
            />
            {documentError && (
              <p className="text-sm text-destructive">{documentError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Endereço</Label>
            <Input
              placeholder="Rua das Flores, 123"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200"
              value={formData.address}
              onChange={(event) => onChange("address", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Cidade</Label>
              <Input
                placeholder="São Paulo"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200"
                value={formData.city}
                onChange={(event) => onChange("city", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Estado</Label>
              <Input
                placeholder="SP"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200"
                value={formData.state}
                onChange={(event) => onChange("state", event.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
             className="btn-neutral-auth w-full h-11 rounded-lg text-white font-medium"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Criando...
              </>
            ) : (
              <>
                Criar empresa
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Ao criar uma conta, você concorda com nossos{" "}
          <span className="underline cursor-pointer text-slate-700">Termos de Uso</span> e{" "}
          <span className="underline cursor-pointer text-slate-700">Política de Privacidade</span>.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={13} className="text-slate-500" />
          <span>Conexão segura SSL · Seus dados estão protegidos</span>
        </div>
      </div>
    </div>
  );
};
