import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    User,
    Mail,
    Lock,
    Phone,
    FileDigit,
    Briefcase,
    Loader2,
} from "lucide-react";
import { useRegisterStore } from "../stores/register-store";
import { useAlert } from "@/hooks/use-alert";

const registerSchema = z
    .object({
        name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
        confirmPassword: z.string(),
        role: z.enum(["cliente", "profissional", "admin"]),
        cnpjcpf: z.string().min(11, "Documento inválido"),
        phone: z.string().min(10, "Telefone inválido"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não conferem",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
    const { onRegister } = useRegisterStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { showAlert } = useAlert()

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "cliente",
            cnpjcpf: "",
            phone: "",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            const {...payload } = data;
            await onRegister(payload as any);
            showAlert({
                title: "Conta criada com sucesso",
                message: "Conta criada com sucesso",
                type: "success",
            });
            navigate("/login");
        } catch (error) {
            showAlert({
                title: "Erro ao criar conta" + error,
                message: "Erro ao criar conta",
                type: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            <div className="flex items-center justify-center px-6">
                <Card className="w-full max-w-md border-none shadow-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            Crie sua conta
                        </CardTitle>
                        <CardDescription>
                            Preencha os dados para começar a usar o AgendaPro
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome completo</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-10" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="email"
                                                        className="pl-10"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="cnpjcpf"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CPF / CNPJ</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <FileDigit className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-10" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Telefone</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-10" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de conta</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                                                    <select
                                                        {...field}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10"
                                                    >
                                                        <option value="cliente">Cliente</option>
                                                        <option value="profissional">Profissional</option>
                                                        <option value="admin">Administrador</option>
                                                    </select>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Senha</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="password"
                                                            className="pl-10"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirmar senha</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="password"
                                                            className="pl-10"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                                    disabled={isLoading}
                                >
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Criar conta
                                </Button>
                            </form>
                        </Form>
                    </CardContent>

                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">
                            Já possui conta?{" "}
                            <span
                                onClick={() => navigate("/login")}
                                className="font-medium text-emerald-600 cursor-pointer hover:underline"
                            >
                                Entrar
                            </span>
                        </p>
                    </CardFooter>
                </Card>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center bg-[#0f1e4a] text-white px-10">
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                        <Briefcase className="h-6 w-6" />
                    </div>

                    <h2 className="text-3xl font-bold">
                        Gerencie seus agendamentos com facilidade
                    </h2>

                    <p className="text-white/80">
                        Centralize agenda, serviços e clientes em um único lugar.
                        Simplifique sua gestão e foque no crescimento do seu negócio.
                    </p>
                </div>
            </div>
        </div>
    );
};
