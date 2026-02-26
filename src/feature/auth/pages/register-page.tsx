import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useRegisterStore } from "../stores/register-store";
import { useAlert } from "@/hooks/use-alert";
import { RegisterFormCard } from "./components/register/register-form-card";
import { RegisterHeroPanel } from "./components/register/register-hero-panel";
import { ConfirmedCodeEmail } from "./components/register/confirmed-code-email";
import {
    toRegisterPayload,
    type RegisterFormValues,
} from "./components/register/register-schema";
import { AuthService } from "../services/auth-services";

export const RegisterPage = () => {
    const { onRegister } = useRegisterStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const { showAlert } = useAlert();

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            const payload = toRegisterPayload(data);
            await onRegister(payload);
            setRegisteredEmail(payload.email);
            setIsModalOpen(true);
            showAlert({
                title: "Conta criada",
                message: "Digite o código enviado por email para ativar a conta.",
                type: "success",
            });
        } catch (error) {
            const firstValidationMessage = axios.isAxiosError(error)
                ? (() => {
                    const errors = error.response?.data?.data?.errors as
                        | Record<string, string>
                        | undefined;

                    if (!errors) {
                        return undefined;
                    }

                    const values = Object.values(errors);
                    return values.length > 0 ? values[0] : undefined;
                })()
                : undefined;

            const apiMessage = axios.isAxiosError(error)
                ? (error.response?.data?.error?.description as string | undefined)
                    ?? firstValidationMessage
                : undefined;

            showAlert({
                title: "Erro ao criar conta",
                message: apiMessage || "Erro ao criar conta",
                type: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmCode = async (code: string) => {
        setIsVerifyingCode(true);
        try {
            await AuthService.verifyEmail({
                email: registeredEmail,
                verification_code: code,
            });

            showAlert({
                title: "Email verificado",
                message: "Conta ativada com sucesso. Faça login para continuar.",
                type: "success",
            });
            setIsModalOpen(false);
            navigate("/login");
        } catch {
            showAlert({
                title: "Código inválido",
                message: "O código informado não confere com o email cadastrado.",
                type: "destructive",
            });
        } finally {
            setIsVerifyingCode(false);
        }
    };

    return (
        <>
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-linear-to-br from-slate-100 via-slate-100 to-slate-200/80 brand-register-page">
                <div className="flex items-center justify-center px-6">
                    <RegisterFormCard
                        isLoading={isLoading}
                        onSubmit={onSubmit}
                        onNavigateLogin={() => navigate("/login")}
                    />
                </div>

                <RegisterHeroPanel />
            </div>

            <ConfirmedCodeEmail
                open={isModalOpen}
                email={registeredEmail}
                loading={isVerifyingCode}
                onOpenChange={setIsModalOpen}
                onConfirm={handleConfirmCode}
            />
        </>
    );
};
