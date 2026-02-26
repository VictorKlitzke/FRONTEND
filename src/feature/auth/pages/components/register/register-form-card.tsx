import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    User,
    Mail,
    Lock,
    Phone,
    FileDigit,
    Briefcase,
    Loader2,
    Calendar,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    registerSchema,
    type RegisterFormValues,
} from "./register-schema";

type RegisterFormCardProps = {
    isLoading: boolean;
    onSubmit: (data: RegisterFormValues) => Promise<void>;
    onNavigateLogin: () => void;
};

export const RegisterFormCard = ({
    isLoading,
    onSubmit,
    onNavigateLogin,
}: RegisterFormCardProps) => {
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

    return (
        <div className="w-full max-w-md bg-white/85 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50">
            <div className="p-8 space-y-0">
                <div className="space-y-3 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2">
                            <div className="sidebar-brand-icon h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <span className="text-base font-bold text-slate-900">AgendaPro</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            <ShieldCheck className="h-3 w-3" />
                            Verificado
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Crie sua conta</h2>
                    <p className="text-sm text-slate-500">
                        Preencha os dados para começar a usar o AgendaPro
                    </p>
                </div>

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
                                    <FormLabel className="text-sm font-semibold text-slate-700">Nome completo</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200" {...field} />
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
                                    <FormLabel className="text-sm font-semibold text-slate-700">E-mail</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="email"
                                                className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200"
                                                placeholder="seu@email.com"
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
                                        <FormLabel className="text-sm font-semibold text-slate-700">CPF / CNPJ</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <FileDigit className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input
                                                    className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200"
                                                    placeholder="Somente números"
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
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">Telefone</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200" {...field} />
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
                                    <FormLabel className="text-sm font-semibold text-slate-700">Tipo de conta</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
                                            <select
                                                {...field}
                                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm pl-10 focus:outline-none focus:border-slate-400 transition-all"
                                            >
                                                <option value="profissional">Profissional</option>
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
                                        <FormLabel className="text-sm font-semibold text-slate-700">Senha</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="password"
                                                    className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200"
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
                                        <FormLabel className="text-sm font-semibold text-slate-700">Confirmar</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="password"
                                                    className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:border-slate-400 focus:ring-slate-200"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-neutral-auth w-full h-11 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                <>
                                    Criar conta
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </Form>

                <div className="mt-5 flex flex-col items-center gap-3">
                    <p className="text-sm text-slate-500">
                        Já possui conta?{" "}
                        <span
                            onClick={onNavigateLogin}
                            className="font-semibold text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
                        >
                            Entrar →
                        </span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <ShieldCheck size={13} className="text-slate-500" />
                        <span>Conexão segura SSL · Dados protegidos</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
