import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useStockStore } from "../stores/stock-store";
import { useAlert } from "@/hooks/use-alert";

const stockSchema = z.object({
  productName: z.string().min(2, "Nome inválido"),
  sku: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  quantity: z.number().int(),
  minimumQuantity: z.number().int().optional(),
});

type StockForm = z.infer<typeof stockSchema>;

export const StockPage = () => {
  const { stocks, loading, fetchByCompany, createStock, updateStock, deleteStock } = useStockStore();
  const { showAlert } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const form = useForm<StockForm>({ resolver: zodResolver(stockSchema), defaultValues: { productName: "", sku: "", description: "", quantity: 0, minimumQuantity: 0 } });

  useEffect(() => { fetchByCompany(1); }, [fetchByCompany]);

  const onSubmit = async (data: StockForm) => {
    try {
      if (editingId) {
        await updateStock(editingId, { ...data, companyId: 1 });
        showAlert({ title: "Sucesso", message: "Item atualizado", type: "success" });
      } else {
        await createStock({ ...data, companyId: 1 });
        showAlert({ title: "Sucesso", message: "Item criado", type: "success" });
      }
      setIsOpen(false);
      setEditingId(null);
      form.reset();
    } catch (err) {
      showAlert({ title: "Erro", message: "Falha ao salvar item", type: "destructive" });
    }
  };

  const handleEdit = (s: any) => { setEditingId(s.id); form.setValue("productName", s.productName); form.setValue("sku", s.sku || ""); form.setValue("description", s.description || ""); form.setValue("quantity", s.quantity); form.setValue("minimumQuantity", s.minimumQuantity ?? 0); setIsOpen(true); };
  const handleDelete = async (id: number) => { if (!confirm("Confirmar exclusão?")) return; await deleteStock(id); showAlert({ title: "Sucesso", message: "Item excluído", type: "success" }); };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Estoque</CardTitle>
            <CardDescription>Gerencie o estoque de produtos</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={() => { setIsOpen(!isOpen); if (!isOpen) form.reset(); }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto"><Plus className="mr-2"/>Novo Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Item" : "Novo Item"}</DialogTitle>
                <DialogDescription>Preencha os dados</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField name="productName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage/>
                    </FormItem>
                  )} />

                  <FormField name="sku" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage/>
                    </FormItem>
                  )} />

                  <FormField name="description" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage/>
                    </FormItem>
                  )} />

                  <FormField name="quantity" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage/>
                    </FormItem>
                  )} />

                  <FormField name="minimumQuantity" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Mínima</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage/>
                    </FormItem>
                  )} />

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin mr-2"/> : null}{editingId ? "Atualizar" : "Criar"}</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (<div className="text-center py-8">Nenhum item</div>) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Qtd Mínima</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.productName}</TableCell>
                    <TableCell>{s.sku}</TableCell>
                    <TableCell>{s.quantity}</TableCell>
                    <TableCell>{s.minimumQuantity ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4"/></Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(s.id!)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
