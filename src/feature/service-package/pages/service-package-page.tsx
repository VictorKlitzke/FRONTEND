import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

import { ServicePackageList } from "../components/service-package-list";

import { useEffect, useState } from "react";
import { useEmpresaStore } from "@/feature/empresa/stores/empresa-store";
import { useAlert } from "@/hooks/use-alert";
import { useServicePackageStore } from "../store/service-package-store";
import { ServicePackageCreate } from "../components/service-pakage-create";
import { Package } from "lucide-react";
import { AuthStore } from "@/feature/auth/stores/auth-store";

export const ServicePackagePage = () => {
  const { showAlert } = useAlert();
  const { user } = AuthStore();
  const { company, fetchByUserId } = useEmpresaStore();

  const {
    packages,
    loading,
    fetchAll,
    createPackage,
    updatePackage,
    deletePackage,
  } = useServicePackageStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<any>();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.id && !company?.id) {
      fetchByUserId(user.id);
    }
  }, [company?.id, fetchByUserId, user?.id]);

  useEffect(() => {
    if (!company?.id) return;
    fetchAll(company.id);
  }, [company?.id, fetchAll]);

  const onSubmit = async (data: any) => {
    try {
      if (!company?.id) throw new Error("Empresa não encontrada");

      if (editingId) {
        await updatePackage(editingId, { ...data, company_id: company.id });
        showAlert({ title: "Sucesso", message: "Atualizado", type: "success" });
      } else {
        await createPackage({ ...data, company_id: company.id });
        showAlert({ title: "Sucesso", message: "Criado", type: "success" });
      }

      setIsDialogOpen(false);
      setEditingId(null);
      setFormInitial(undefined);
    } catch {
      showAlert({
        title: "Erro",
        message: "Falha ao salvar",
        type: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">

      <PageHeader
        title="Pacotes de Serviço"
        description="Gerencie os pacotes da sua empresa"
        icon={Package}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              Novo Pacote
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogTitle>{editingId ? "Editar pacote" : "Novo pacote"}</DialogTitle>
            <DialogDescription>
              Preencha os dados do pacote para definir frequência e sessões do cliente.
            </DialogDescription>
            <ServicePackageCreate
              initialValues={formInitial}
              onSubmit={onSubmit}
              loading={loading}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardContent>
          <ServicePackageList
            data={packages}
            loading={loading}
            search={search}
            onSearchChange={setSearch}
            onEdit={(item) => {
              setEditingId(item.id);
              setFormInitial(item);
              setIsDialogOpen(true);
            }}
            onDelete={deletePackage}
          />
        </CardContent>
      </Card>

    </div>
  );
};