import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useEmpresaStore } from "../stores/empresa-store";
import { useAlert } from "@/hooks/use-alert";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const empresaSchema = z.object({
  name: z.string().min(3, "Nome inválido"),
  cnpj: z.string().min(1, "CNPJ inválido"),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
});

type EmpresaForm = z.infer<typeof empresaSchema>;

export const EmpresaListPage = () => {
  const { companies, loading, fetchAll, updateEmpresa, inactivateEmpresa } = useEmpresaStore();
  const { showAlert } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const form = useForm<EmpresaForm>({ resolver: zodResolver(empresaSchema), defaultValues: { name: "", cnpj: "", address: "", city: "", state: "" } });
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onSubmit = async (data: EmpresaForm) => {
    if (!editingId) return;
    try {
      await updateEmpresa(editingId, data as any);
      showAlert({ title: "Sucesso", message: "Empresa atualizada", type: "success" });
      setIsOpen(false);
      setEditingId(null);
    } catch (err) {
      showAlert({ title: "Erro", message: "Falha ao atualizar empresa", type: "destructive" });
    }
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    form.setValue("name", c.name || "");
    form.setValue("cnpj", c.cnpj || "");
    form.setValue("address", c.address || "");
    form.setValue("city", c.city || "");
    form.setValue("state", c.state || "");
    setIsOpen(true);
  };

  const handleInactivate = async (id: number) => {
    if (!confirm("Confirmar inativação da empresa?")) return;
    try {
      await inactivateEmpresa(id);
      showAlert({ title: "Sucesso", message: "Empresa inativada", type: "success" });
    } catch (err) {
      showAlert({ title: "Erro", message: "Falha ao inativar empresa", type: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Gerencie as empresas</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/empresa/cadastro')} className="w-full sm:w-auto"><Plus className="mr-2"/>Nova Empresa</Button>
          </div>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-8">Nenhuma empresa cadastrada</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Ativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.cnpj}</TableCell>
                    <TableCell>{c.address ? `${c.address} - ${c.city || ''}/${c.state || ''}` : '-'}</TableCell>
                    <TableCell>{c.active ? 'Sim' : 'Não'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4"/></Button>
                        <Button variant="destructive" size="icon" onClick={() => handleInactivate(c.id!)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={() => { setIsOpen(!isOpen); if (!isOpen) { setEditingId(null); form.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Empresa" : "Empresa"}</DialogTitle>
            <DialogDescription>Atualize os dados da empresa</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField name="cnpj" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField name="address" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField name="city" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage/>
                  </FormItem>
                )} />
                <FormField name="state" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage/>
                  </FormItem>
                )} />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); setEditingId(null); form.reset(); }}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin mr-2"/> : null}Atualizar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
