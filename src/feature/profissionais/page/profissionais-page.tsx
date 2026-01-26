import { useEffect, useState } from "react";
import { AuthStore } from "../../auth/stores/auth-store";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Plus } from "lucide-react";
import { useProfissionalStore } from "../stores/profissional-store";
import { useAlert } from "../../../hooks/use-alert";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ProfissionaisPage = () => {
    const { profissionais, loadProfissionais, addProfissional, loading } = useProfissionalStore();
    const { user } = AuthStore();
    const { showAlert } = useAlert();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        job: ""
    });

    useEffect(() => {
        if (user?.empresaId) {
            loadProfissionais(user.empresaId);
        }
    }, [user?.empresaId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addProfissional({ ...formData, empresaId: user?.empresaId });
            setIsDialogOpen(false);
            setFormData({ name: "", email: "", phone: "", job: "" });
            showAlert({
                title: "Sucesso",
                message: "Profissional adicionado com sucesso!",
                type: "success"
            });
        } catch (error) {
            showAlert({
                title: "Erro",
                message: "Erro ao adicionar profissional.",
                type: "destructive"
            });
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
                    <p className="text-muted-foreground">
                        Gerencie os profissionais da sua equipe.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-950 hover:bg-blue-800">
                            <Plus className="mr-2 h-4 w-4" /> Novo Profissional
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Profissional</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cargo/Especialidade</Label>
                                <Input
                                    value={formData.job}
                                    onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-blue-950 hover:bg-blue-800" disabled={loading}>
                                {loading ? "Salvando..." : "Salvar"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profissionais.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Nenhum profissional cadastrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                profissionais.map((pros) => (
                                    <TableRow key={pros.id}>
                                        <TableCell className="font-medium">{pros.name}</TableCell>
                                        <TableCell>{pros.job}</TableCell>
                                        <TableCell>{pros.phone}</TableCell>
                                        <TableCell>{pros.email || "-"}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};