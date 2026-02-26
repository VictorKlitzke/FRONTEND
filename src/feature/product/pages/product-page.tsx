import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, ShoppingBag } from "lucide-react";
import { useProductStore } from "../stores/product-store";
import { useAlert } from "@/hooks/use-alert";
import { ProductListPage, type ProductListItem } from "./components/product-list-page";
import { ProductFormPage, type ProductForm } from "./components/product-form-page";
import { AuthStore } from "@/feature/auth/stores/auth-store";
import { useEmpresaStore } from "@/feature/empresa/stores/empresa-store";
import { PageHeader } from "@/components/page-header";

export const ProductPage = () => {
  const { products, loading, fetchAll, createProduct, updateProduct, deleteProduct } = useProductStore();
  const { user } = AuthStore();
  const { company, fetchByUserId } = useEmpresaStore();
  const { showAlert } = useAlert();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<ProductForm | undefined>(undefined);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (user?.id && !company?.id) {
      fetchByUserId(user.id);
    }
  }, [company?.id, fetchByUserId, user?.id]);

  const handleEdit = (p: ProductListItem) => {
    setEditingId(p.id);
    setFormInitial({ name: p.name, description: p.description || "", price: p.price?.toString() || "" });
    setIsOpen(true);
  };
  const handleDelete = async (id: number) => {
    if (!confirm("Confirmar exclusão?")) return;
    await deleteProduct(id);
    showAlert({ title: "Sucesso", message: "Produto excluído", type: "success" });
  };
  const handleFormSubmit = async (data: ProductForm) => {
    try {
      const companyId = company?.id;
      if (!companyId) {
        showAlert({ title: "Erro", message: "Empresa não encontrada", type: "destructive" });
        return;
      }
      const payload = { name: data.name, description: data.description, price: data.price ? Number(data.price) : undefined, quantity: data.quantity ? Number(data.quantity) : undefined, companyId: companyId };
      if (editingId) {
        await updateProduct(editingId, payload);
        showAlert({ title: "Sucesso", message: "Produto atualizado", type: "success" });
      } else {
        await createProduct(payload);
        showAlert({ title: "Sucesso", message: "Produto criado", type: "success" });
      }
      setIsOpen(false);
      setEditingId(null);
      setFormInitial(undefined);
    } catch {
      showAlert({ title: "Erro", message: "Falha ao salvar produto", type: "destructive" });
    }
  };

  const listItems: ProductListItem[] = products
    .filter((p) => typeof p.id === "number")
    .map((p) => ({
      id: p.id as number,
      name: p.name,
      description: p.description,
      price: p.price,
      quantity: p.quantity,
    }));

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-4">
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos da sua empresa"
        icon={ShoppingBag}
      >
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingId(null);
              setFormInitial(undefined);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto btn-gradient rounded-xl gap-2">
              <Plus size={16} />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
              <DialogDescription>Preencha os dados</DialogDescription>
            </DialogHeader>
            <ProductFormPage
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
          <ProductListPage
            products={listItems}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            search={search}
            onSearchChange={setSearch}
          />
        </CardContent>
      </Card>
    </div>
  );
};
