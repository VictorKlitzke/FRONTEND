import { z } from "zod";
import { isValidCpfOrCnpj, normalizeDocument } from "./document-validation";

export const registerSchema = z
    .object({
        name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
        confirmPassword: z.string(),
        role: z.enum(["cliente", "profissional", "admin"]),
        cnpjcpf: z
            .string()
            .min(11, "Documento inválido")
            .refine((value) => isValidCpfOrCnpj(value), {
                message: "CPF/CNPJ inválido",
            }),
        phone: z.string().min(10, "Telefone inválido"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não conferem",
        path: ["confirmPassword"],
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const toRegisterPayload = (data: RegisterFormValues) => ({
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    role: data.role,
    cnpjcpf: normalizeDocument(data.cnpjcpf),
    phone: data.phone.trim(),
});