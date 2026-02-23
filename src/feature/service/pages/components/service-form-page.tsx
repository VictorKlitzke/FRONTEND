import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react";

const serviceSchema = z.object({
	name: z.string().min(2, "Nome inválido"),
	description: z.string().optional().or(z.literal("")),
	price: z.coerce.number().min(0),
	durationMinutes: z.coerce.number().int().min(1),
});

export type ServiceForm = z.infer<typeof serviceSchema>;

interface ServiceFormPageProps {
	initialValues?: Partial<ServiceForm>;
	onSubmit: (data: ServiceForm) => void | Promise<void>;
	loading?: boolean;
	onCancel?: () => void;
}

export function ServiceFormPage({ initialValues, onSubmit, loading, onCancel }: ServiceFormPageProps) {
	const form = useForm<ServiceForm>({
		resolver: zodResolver(serviceSchema),
		defaultValues: initialValues || { name: "", description: "", price: 0, durationMinutes: 30, products: [] },
	});

	useEffect(() => {
		// no-op: products selection removed
	}, []);

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
								<Input {...field} placeholder="Nome do serviço" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
                
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descrição</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Descrição" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="price"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Preço</FormLabel>
							<FormControl>
								<Input {...field} type="number" min={0} step={0.01} placeholder="Preço" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="durationMinutes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Duração (minutos)</FormLabel>
							<FormControl>
								<Input {...field} type="number" min={1} step={1} placeholder="Duração" />
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
