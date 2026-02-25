import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Card className="w-full max-w-md border-none shadow-none">
      <CardContent className="p-0">
        <header className="mb-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4 text-xl font-semibold">
            📅 AgendaPro
          </div>

          <h2 className="text-2xl font-bold">Crie sua conta</h2>
          <p className="text-sm text-muted-foreground">Comece sua conta agora</p>
        </header>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Nome da empresa</Label>
            <Input
              placeholder="Salão Beleza Total"
              value={formData.name}
              onChange={(event) => onChange("name", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>CPF / CNPJ</Label>
            <Input
              placeholder="Somente números"
              value={formData.cnpj}
              onChange={(event) => onChange("cnpj", event.target.value)}
            />
            {documentError && (
              <p className="text-sm text-destructive">{documentError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              placeholder="Rua das Flores, 123"
              value={formData.address}
              onChange={(event) => onChange("address", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                placeholder="São Paulo"
                value={formData.city}
                onChange={(event) => onChange("city", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                placeholder="SP"
                value={formData.state}
                onChange={(event) => onChange("state", event.target.value)}
              />
            </div>
          </div>

          <Button className="w-full bg-blue-950 hover:bg-blue-800" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao criar uma conta, você concorda com nossos{" "}
          <span className="underline cursor-pointer">Termos de Uso</span> e{" "}
          <span className="underline cursor-pointer">Política de Privacidade</span>.
        </p>
      </CardContent>
    </Card>
  );
};
