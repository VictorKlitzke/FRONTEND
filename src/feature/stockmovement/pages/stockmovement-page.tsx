import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useStockMovementStore } from "../stores/stockmovement-store";
import { useAlert } from "@/hooks/use-alert";
import { useProductStore } from "@/feature/product/stores/product-store";
import { useEmpresaStore } from "@/feature/empresa/stores/empresa-store";
import { AuthStore } from "@/feature/auth/stores/auth-store";

const movementSchema = z.object({
  stockId: z.coerce.number().int().min(1),
  quantity: z.coerce.number().int().min(1),
  movementType: z.enum(["IN", "OUT"]),
  notes: z.string().optional().or(z.literal("")),
});

type MovementForm = z.output<typeof movementSchema>;
type MovementFormInput = z.input<typeof movementSchema>;

export const StockMovementPage = () => {
  const { movements, loading, fetchByCompany, createMovement, deleteMovement } = useStockMovementStore();
  const { products, fetchAll: fetchProducts } = useProductStore();
  const { company, fetchByUserId } = useEmpresaStore();
  const { user } = AuthStore();
  const { showAlert } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const form = useForm<MovementFormInput, unknown, MovementForm>({
    resolver: zodResolver(movementSchema),
    defaultValues: { stockId: 0, quantity: 1, movementType: "IN", notes: "" },
  });

  const companyId = company?.id ?? 0;

  useEffect(() => {
    if (user?.id && !company) {
      fetchByUserId(user.id);
    }
  }, [user?.id, company, fetchByUserId]);

  useEffect(() => {
    if (!companyId) return;
    fetchByCompany(companyId);
    fetchProducts();
  }, [companyId, fetchByCompany, fetchProducts]);

  const onSubmit = async (data: MovementForm) => {
    try {
      await createMovement({ ...data, companyId });
      showAlert({ title: "Sucesso", message: "Movimento criado", type: "success" });
      setIsOpen(false);
      form.reset();
    } catch {
      showAlert({ title: "Erro", message: "Falha ao criar movimento", type: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirmar exclusão?")) return;
    await deleteMovement(id);
    showAlert({ title: "Sucesso", message: "Movimento excluído", type: "success" });
  };

  const productMap = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((p) => {
      if (typeof p.id === "number") {
        map.set(p.id, p.name);
      }
    });
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const safeMovements = Array.isArray(movements) ? movements : [];
    return safeMovements.filter((m) => {
      const name = productMap.get(m.stockId) ?? "";
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "ALL" || m.movementType === typeFilter;
      const createdAt = m.createdAt ? new Date(m.createdAt) : null;
      const afterStart = startDate ? createdAt && createdAt >= new Date(startDate) : true;
      const beforeEnd = endDate ? createdAt && createdAt <= new Date(`${endDate}T23:59:59`) : true;
      return matchesSearch && matchesType && afterStart && beforeEnd;
    });
  }, [movements, search, typeFilter, startDate, endDate, productMap]);

  const totals = useMemo(() => {
    const totalIn = filtered.filter((m) => m.movementType === "IN").reduce((sum, m) => sum + m.quantity, 0);
    const totalOut = filtered.filter((m) => m.movementType === "OUT").reduce((sum, m) => sum + m.quantity, 0);
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [filtered]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardDescription>Entradas</CardDescription>
            <CardTitle>{totals.totalIn}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Saídas</CardDescription>
            <CardTitle>{totals.totalOut}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Saldo</CardDescription>
            <CardTitle>{totals.net}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Movimentos de Estoque</CardTitle>
            <CardDescription>Registre entradas e saídas</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={() => { setIsOpen(!isOpen); if (!isOpen) form.reset(); }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto"><Plus className="mr-2"/>Novo Movimento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Movimento</DialogTitle>
                <DialogDescription>Preencha os dados</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField name="stockId" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value === undefined || field.value === null ? "" : String(field.value)}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="border rounded px-2 py-2 w-full"
                        >
                          <option value={0}>Selecione</option>
                          {products.filter((p) => typeof p.id === "number").map((p) => (
                            <option key={p.id} value={p.id as number}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )} />

                  <FormField name="quantity" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value === undefined || field.value === null ? "" : Number(field.value)}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )} />

                  <FormField name="movementType" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <select {...field} className="border rounded px-2 py-1 w-full">
                          <option value="IN">Entrada</option>
                          <option value="OUT">Saída</option>
                        </select>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )} />

                  <FormField name="notes" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage/>
                    </FormItem>
                  )} />

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin mr-2"/> : null}Criar</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Input
              placeholder="Buscar por produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "ALL" | "IN" | "OUT")}
              className="border rounded px-2 py-2 w-full sm:w-auto"
            >
              <option value="ALL">Todos</option>
              <option value="IN">Entrada</option>
              <option value="OUT">Saída</option>
            </select>
            <Input className="w-full sm:w-auto" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input className="w-full sm:w-auto" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          {filtered.length === 0 ? (<div className="text-center py-8">Nenhum movimento</div>) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{productMap.get(m.stockId) ?? `#${m.stockId}`}</TableCell>
                    <TableCell>{m.quantity}</TableCell>
                    <TableCell>{m.movementType === "IN" ? "Entrada" : "Saída"}</TableCell>
                    <TableCell>{new Date(m.createdAt || "").toLocaleString()}</TableCell>
                    <TableCell>{m.notes || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(m.id!)}><Trash2 className="h-4 w-4"/></Button>
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
