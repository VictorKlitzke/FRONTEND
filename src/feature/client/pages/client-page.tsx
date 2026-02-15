
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useClientStore } from "../stores/client-store";
import { useAlert } from "@/hooks/use-alert";
import { useEffect, useState } from "react";
import { ClientFormPage } from "./components/client-form-page";
import type { ClientForm } from "./components/client-form-page";
import { ClientListPage } from "./components/client-list-page";
import type { ClientListItem } from "./components/client-list-page";
import { useSettingsStore } from "@/feature/config/store/settings-store";
import { getSegmentLabels } from "@/shared/segments/segment-labels";

export const ClientPage = () => {
  const { clients, loading, fetchAll, createClient, updateClient, deleteClient } = useClientStore();
  const { showAlert } = useAlert();
  const { settings } = useSettingsStore();
  const labels = getSegmentLabels(settings?.segment);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formInitial, setFormInitial] = useState<ClientForm | undefined>(undefined);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredClients: ClientListItem[] = Array.isArray(clients)
    ? clients
        .filter((c) => c.id !== undefined && c.name?.toLowerCase().includes(search.toLowerCase()))
        .map((c) => ({
          id: c.id as number,
          name: c.name,
          phone: c.phone,
          origem: c.origem,
        }))
    : [];

  const handleEdit = (c: ClientListItem) => {
    setEditingId(c.id);
    setFormInitial({ name: c.name, phone: c.phone || "", origem: c.origem || "" });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirmar exclusão?")) return;
    await deleteClient(id);
    showAlert({ title: "Sucesso", message: "Cliente excluído", type: "success" });
  };

  const handleFormSubmit = async (data: ClientForm) => {
    try {
      if (editingId) {
        await updateClient(editingId, data);
        showAlert({ title: "Sucesso", message: "Cliente atualizado", type: "success" });
      } else {
        await createClient(data);
        showAlert({ title: "Sucesso", message: "Cliente criado", type: "success" });
      }
      setIsOpen(false);
      setEditingId(null);
      setFormInitial(undefined);
    } catch (err) {
      showAlert({ title: "Erro", message: "Falha ao salvar cliente", type: "destructive" });
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormInitial(undefined);
    setIsOpen(true);
  };


  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{labels.clients.plural}</CardTitle>
            <CardDescription>Gerencie os {labels.clients.plural.toLowerCase()}</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingId(null);
              setFormInitial(undefined);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} className="w-full sm:w-auto"><Plus className="mr-2"/>Novo {labels.clients.singular}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? `Editar ${labels.clients.singular}` : `Novo ${labels.clients.singular}`}</DialogTitle>
                <DialogDescription>Preencha os dados</DialogDescription>
              </DialogHeader>
              <ClientFormPage
                initialValues={formInitial}
                onSubmit={handleFormSubmit}
                loading={loading}
                onCancel={() => setIsOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <ClientListPage
            clients={filteredClients}
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
