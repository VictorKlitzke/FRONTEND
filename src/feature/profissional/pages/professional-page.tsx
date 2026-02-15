import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

export const ProfessionalPage = () => {
  const { showAlert } = useAlert();
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
    fetchAll();
  }, [fetchAll]);

  const onSubmit = async (data: ProfissionalForm) => {
    try {
      const companyId = 1; // TODO: pegar companyId real
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
    } catch (error) {
      showAlert({
        title: "Erro",
        message: "Erro ao salvar profissional",
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
    } catch (error) {
      showAlert({
        title: "Erro",
        message: "Erro ao excluir profissional",
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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{labels.professionals.plural}</CardTitle>
            <CardDescription>Gerencie os {labels.professionals.plural.toLowerCase()} da sua empresa</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingId(null);
              setFormInitial(undefined);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
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
        </CardHeader>
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
