import { useEffect, useState } from "react"
import { useEmpresaStore } from "../stores/empresa-store"
import { useAlert } from "../../../hooks/use-alert"
import { useNavigate } from "react-router-dom"
import { AuthStore } from "../../auth/stores/auth-store"
import type { EmpresaDTO } from "../services/empresa-service"
import { EmpresaHeroPanel } from "./components/register/empresa-hero-panel"
import { EmpresaFormCard } from "./components/register/empresa-form-card"
import { isValidCpfOrCnpj, normalizeDocument } from "@/feature/auth/pages/components/register/document-validation"

type EmpresaFormData = Omit<EmpresaDTO, "userId">;

export const EmpresaPage = () => {
  const navigate = useNavigate();
  const { createEmpresa, loading, fetchByUserId } = useEmpresaStore();
  const { showAlert } = useAlert();
  const { user } = AuthStore();

  const [formData, setFormData] = useState<EmpresaFormData>({
    name: "",
    cnpj: "",
    address: "",
    city: "",
    state: ""
  });
  const [documentError, setDocumentError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      if (!user?.id) return;
      const company = await fetchByUserId(user.id);
      if (company?.active) {
        navigate("/dashboard");
      }
    };
    loadCompany();
  }, [fetchByUserId, navigate, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedDocument = normalizeDocument(formData.cnpj);
    if (!isValidCpfOrCnpj(normalizedDocument)) {
      setDocumentError("Informe um CPF/CNPJ válido.");
      showAlert({
        title: "Documento inválido",
        message: "Informe um CPF/CNPJ válido para continuar.",
        type: "destructive"
      });
      return;
    }

    setDocumentError(null);

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
      await createEmpresa({ ...formData, cnpj: normalizedDocument }, user.id);
      showAlert({
        title: "Sucesso",
        message: "Empresa cadastrada com sucesso!",
        type: "success"
      });
      navigate("/planos");
    } catch (error: any) {
      showAlert({
        title: "Erro",
        message: "Erro ao cadastrar empresa: " + error.message,
        type: "destructive"
      });
    }
  };

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-linear-to-br from-slate-100 via-slate-100 to-slate-200/80 brand-empresa-page">
        <EmpresaHeroPanel />

        <main className="flex items-center justify-center px-6">
          <EmpresaFormCard
            formData={formData}
            loading={loading}
            documentError={documentError}
            onSubmit={handleSubmit}
            onChange={(field, value) => {
              if (field === "cnpj") {
                setDocumentError(null);
              }

              setFormData((prev) => ({
                ...prev,
                [field]: value,
              }));
            }}
          />
        </main>
      </div>
    </>
  )
}