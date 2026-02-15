import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useProductStore } from "../stores/product-store";
import { useAlert } from "@/hooks/use-alert";
import { ProductListPage, type ProductListItem } from "./components/product-list-page";
import { ProductFormPage, type ProductForm } from "./components/product-form-page";

export const ProductPage = () => {
  const { products, loading, fetchAll, createProduct, updateProduct, deleteProduct } = useProductStore();
  const { showAlert } = useAlert();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<ProductForm | undefined>(undefined);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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
      const storedEmpresa = sessionStorage.getItem("empresa-storage");
      const empresaIdFromStorage = storedEmpresa
        ? (JSON.parse(storedEmpresa)?.state?.company?.id as number | undefined)
        : undefined;
      const companyId = empresaIdFromStorage; 
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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Gerencie os produtos</CardDescription>
          </div>
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
              <Button className="w-full sm:w-auto"><Plus className="mr-2" />Novo Produto</Button>
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
        </CardHeader>
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
