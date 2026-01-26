import { useEffect, useState } from "react";
import { AuthStore } from "../../auth/stores/auth-store";
import { useServicoStore } from "../stores/servico-store";
import { useProfissionalStore } from "../../profissionais/stores/profissional-store";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Plus } from "lucide-react";
import { useAlert } from "../../../hooks/use-alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";

export const ServicosPage = () => {
    const { user, token } = AuthStore();
    const { servicos, loadServicos, addServico, loading: loadingServicos } = useServicoStore();
    const { profissionais, loadProfissionais } = useProfissionalStore();
    const { showAlert } = useAlert();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        duration: "",
        price: "",
        profissionalId: "",
    });

    useEffect(() => {
        if (!token) return;

        loadProfissionais();

        if (user?.empresaId) {
            loadServicos(user.empresaId);
        }
    }, [token, user?.empresaId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.empresaId) return;

        try {
            await addServico({
                name: formData.name,
                duration: Number(formData.duration),
                price: Number(formData.price),
                profissionalId: Number(formData.profissionalId),
                empresaId: user.empresaId,
            });
            setIsDialogOpen(false);
            setFormData({ name: "", duration: "", price: "", profissionalId: "" });
            showAlert({
                title: "Sucesso",
                message: "Serviço adicionado com sucesso!",
                type: "success",
            });
            loadServicos(user.empresaId);
        } catch (error) {
            showAlert({
                title: "Erro",
                message: "Erro ao adicionar serviço.",
                type: "destructive",
            });
        }
    };

    const getProfissionalName = (id?: number) => {
        console.log(id)

        return profissionais.find((p) => p.id === id)?.name || "N/A";
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
                    <p className="text-muted-foreground">
                        Gerencie os serviços e atribua profissionais.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-950 hover:bg-blue-800">
                            <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Serviço</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome do Serviço</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Duração (min)</Label>
                                    <Input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Preço (R$)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Profissional</Label>
                                <div className="w-full">
                                    <Select
                                        onValueChange={(value) => setFormData({ ...formData, profissionalId: value })}
                                        value={formData.profissionalId}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um profissional" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {profissionais.map((profissional) => (
                                                <SelectItem key={profissional.id} value={String(profissional.name)}>
                                                    {profissional.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-blue-950 hover:bg-blue-800" disabled={loadingServicos}>
                                {loadingServicos ? "Salvando..." : "Salvar"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Catálogo de Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Duração</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Profissional</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {servicos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Nenhum serviço cadastrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                servicos.map((servico) => (
                                    <TableRow key={servico.id}>
                                        <TableCell className="font-medium">{servico.name}</TableCell>
                                        <TableCell>{servico.duration} min</TableCell>
                                        <TableCell>R$ {Number(servico.price).toFixed(2)}</TableCell>
                                        <TableCell>{getProfissionalName(servico.profissionalId)}</TableCell>
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