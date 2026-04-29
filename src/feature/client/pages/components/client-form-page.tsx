import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const clientSchema = z.object({
	name: z.string().min(3, "Nome inválido"),
	phone: z
		.string()
		.optional()
		.or(z.literal(""))
		.refine(
			(val) => {
				const digits = String(val ?? "").replace(/\D/g, "");
				return digits.length === 0 || digits.length >= 11;
			},
			{ message: "Se informar telefone, use ao menos 11 dígitos (DDD + número)" },
		),
	origem: z.string().optional().or(z.literal("")),
});

export type ClientForm = z.infer<typeof clientSchema>;

interface ClientFormPageProps {
	initialValues?: Partial<ClientForm>;
	onSubmit: (data: ClientForm) => void | Promise<void>;
	loading?: boolean;
	onCancel?: () => void;
}

export function ClientFormPage({ initialValues, onSubmit, loading, onCancel }: ClientFormPageProps) {
	const form = useForm<ClientForm>({
		resolver: zodResolver(clientSchema),
		defaultValues: initialValues || { name: "", phone: "", origem: "" },
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nome</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Nome do cliente" />
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
							<FormLabel>Telefone (opcional)</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Telefone" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="origem"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Origem</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Origem" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					{onCancel && (
						<Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
							Cancelar
						</Button>
					)}
					<Button type="submit" disabled={loading}>
						{loading ? "Salvando..." : "Salvar"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
