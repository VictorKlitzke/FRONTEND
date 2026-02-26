import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Scissors } from "lucide-react";
import { useServiceStore } from "../stores/service-store";
import { useAlert } from "@/hooks/use-alert";
import { ServiceFormPage, type ServiceForm } from "./components/service-form-page";
import { ServiceListPage, type ServiceListItem } from "./components/service-list-page";
import { useSettingsStore } from "@/feature/config/store/settings-store";
import { getSegmentLabels } from "@/shared/segments/segment-labels";
import { AuthStore } from "@/feature/auth/stores/auth-store";
import { useEmpresaStore } from "@/feature/empresa/stores/empresa-store";
import { PageHeader } from "@/components/page-header";

export const ServicePage = () => {
  const { services, loading, fetchAll, createService, updateService, deleteService } = useServiceStore();
  const { user } = AuthStore();
  const { company, fetchByUserId } = useEmpresaStore();
  const { showAlert } = useAlert();
  const { settings } = useSettingsStore();
  const labels = getSegmentLabels(settings?.segment);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formInitial, setFormInitial] = useState<ServiceForm | undefined>(undefined);

  useEffect(() => {
    if (user?.id && !company?.id) {
      fetchByUserId(user.id);
    }
  }, [company?.id, fetchByUserId, user?.id]);

  useEffect(() => {
    if (!company?.id) return;
    fetchAll(company.id);
  }, [company?.id, fetchAll]);


  const handleEdit = (s: ServiceListItem) => {
    setEditingId(s.id);
    setFormInitial({
      name: s.name,
      description: s.description || "",
      price: s.price,
      durationMinutes: s.durationMinutes,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirmar exclusão?")) return;
    await deleteService(id);
    showAlert({ title: "Sucesso", message: "Serviço excluído", type: "success" });
  };

  const handleFormSubmit = async (data: ServiceForm) => {
    const companyId = company?.id;
    if (!companyId) {
      showAlert({ title: "Erro", message: "Empresa não encontrada", type: "destructive" });
      return;
    }
    try {
      const payload = { ...data, companyId };
      if (editingId) {
        await updateService(editingId, payload);
        showAlert({ title: "Sucesso", message: "Serviço atualizado", type: "success" });
      } else {
        await createService(payload);
        showAlert({ title: "Sucesso", message: "Serviço criado", type: "success" });
      }
      setIsOpen(false);
      setEditingId(null);
      setFormInitial(undefined);
    } catch {
      showAlert({ title: "Erro", message: "Falha ao salvar serviço", type: "destructive" });
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormInitial(undefined);
    setIsOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-4">
      <PageHeader
        title={labels.services.plural}
        description={`Gerencie os ${labels.services.plural.toLowerCase()} da sua empresa`}
        icon={Scissors}
      >
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingId(null);
            setFormInitial(undefined);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="w-full sm:w-auto btn-gradient rounded-xl gap-2">
              <Plus size={16} />
              Novo {labels.services.singular}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? `Editar ${labels.services.singular}` : `Novo ${labels.services.singular}`}</DialogTitle>
              <DialogDescription>Preencha os dados</DialogDescription>
            </DialogHeader>
            <ServiceFormPage
              initialValues={formInitial}
              onSubmit={handleFormSubmit}
              loading={loading}
              onCancel={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="card-refined border-0">
        <CardContent>
          <ServiceListPage
            services={Array.isArray(services)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? services.map((s: any) => {
                const name = s.name ?? s.nome ?? "";
                const description = s.description ?? s["descrição"] ?? s.descricao ?? "";
                const priceRaw = s.price ?? s.preço ?? s.preco ?? 0;
                const price = typeof priceRaw === "number" ? priceRaw : (typeof priceRaw === "string" ? parseFloat(priceRaw) || 0 : 0);
                const durationRaw = s.durationMinutes ?? s["duração_minutos"] ?? s.duracao_minutos ?? s.duration_minutes;
                const durationMinutes = durationRaw === undefined || durationRaw === null
                  ? 0
                  : (typeof durationRaw === "string" ? parseInt(durationRaw, 10) : Number(durationRaw));
                return {
                  id: s.id ?? s.ID ?? 0,
                  name,
                  description,
                  price,
                  durationMinutes,
                };
              })
              : []}
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
