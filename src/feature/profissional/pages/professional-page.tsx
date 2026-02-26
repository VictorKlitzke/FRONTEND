import { useEffect, useState } from "react";
import { Plus, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useProfessionalStore } from "../stores/professional-store";
import { useAlert } from "@/hooks/use-alert";
import { ProfissionalFormPage, type ProfissionalForm } from "./components/profissional-form-page";
import { ProfissionalListPage, type ProfissionalListItem } from "./components/profissional-list-page";
import { useSettingsStore } from "@/feature/config/store/settings-store";
import { getSegmentLabels } from "@/shared/segments/segment-labels";
import { AuthStore } from "@/feature/auth/stores/auth-store";
import { useEmpresaStore } from "@/feature/empresa/stores/empresa-store";
import { PageHeader } from "@/components/page-header";

export const ProfessionalPage = () => {
  const getApiMessage = (error: unknown): string | undefined => {
    if (error && typeof error === "object" && "response" in error) {
      type RespShape = { data?: { data?: { message?: string }; message?: string } };
      const resp = (error as { response?: RespShape }).response;
      const data = resp?.data;
      return data?.data?.message ?? data?.message;
    }
    return undefined;
  };
  const { showAlert } = useAlert();
  const { user } = AuthStore();
  const { company, fetchByUserId } = useEmpresaStore();
  const { settings } = useSettingsStore();
  const labels = getSegmentLabels(settings?.segment);

  const {
    professionals,
    loading,
    fetchAll,
    createProfessional,
    updateProfessional,
    deleteProfessional,
  } = useProfessionalStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formInitial, setFormInitial] = useState<ProfissionalForm | undefined>(undefined);

  useEffect(() => {
    if (user?.id && !company?.id) {
      fetchByUserId(user.id);
    }
  }, [company?.id, fetchByUserId, user?.id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onSubmit = async (data: ProfissionalForm) => {
    try {
      const companyId = company?.id;
      if (!companyId) {
        showAlert({ title: "Erro", message: "Empresa não encontrada", type: "destructive" });
        return;
      }
      if (editingId) {
        await updateProfessional(editingId, { ...data, companyId });
        showAlert({
          title: "Sucesso",
          message: "Profissional atualizado com sucesso",
          type: "success",
        });
      } else {
        await createProfessional({ ...data, companyId });
        showAlert({
          title: "Sucesso",
          message: "Profissional criado com sucesso",
          type: "success",
        });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setFormInitial(undefined);
    } catch (error: unknown) {
      const apiMessage = getApiMessage(error);
      showAlert({
        title: "Erro",
        message: apiMessage ?? "Erro ao salvar profissional",
        type: "destructive",
      });
    }
  };

  const filteredProfessionals: ProfissionalListItem[] = Array.isArray(professionals)
    ? professionals.map((p) => ({
      id: p.id ?? 0,
      name: p.name ?? "",
      email: p.email ?? "",
      phone: p.phone ?? "",
      specialty: p.specialty ?? "",
    }))
    : [];

  const handleEdit = (professional: ProfissionalListItem) => {
    setEditingId(professional.id);
    setFormInitial({
      name: professional.name,
      email: professional.email,
      phone: professional.phone || "",
      specialty: professional.specialty || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este profissional?")) return;
    try {
      await deleteProfessional(id);
      showAlert({
        title: "Sucesso",
        message: "Profissional excluído com sucesso",
        type: "success",
      });
    } catch (error: unknown) {
      const apiMessage = getApiMessage(error);
      showAlert({
        title: "Erro",
        message: apiMessage ?? "Erro ao excluir profissional",
        type: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormInitial(undefined);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormInitial(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-4">
      <PageHeader
        title={labels.professionals.plural}
        description={`Gerencie os ${labels.professionals.plural.toLowerCase()} da sua empresa`}
        icon={UserCheck}
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setFormInitial(undefined);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="w-full sm:w-auto btn-gradient rounded-xl gap-2">
              <Plus size={16} />
              Novo {labels.professionals.singular}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? `Editar ${labels.professionals.singular}` : `Novo ${labels.professionals.singular}`}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do {labels.professionals.singular.toLowerCase()}
              </DialogDescription>
            </DialogHeader>
            <ProfissionalFormPage
              initialValues={formInitial}
              onSubmit={onSubmit}
              loading={loading}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="card-refined border-0">
        <CardContent>
          <ProfissionalListPage
            professionals={filteredProfessionals}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            search={search}
            onSearchChange={setSearch}
          />
        </CardContent>
      </Card>
    </div>
  );
};
