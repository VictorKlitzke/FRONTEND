import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type ConfirmedCodeEmailProps = {
    open: boolean;
    email: string;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (code: string) => Promise<void>;
};

export const ConfirmedCodeEmail = ({
    open,
    email,
    loading,
    onOpenChange,
    onConfirm,
}: ConfirmedCodeEmailProps) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        const normalizedCode = code.replace(/\D/g, "");

        if (!/^\d{6}$/.test(normalizedCode)) {
            setError("Informe um código de 6 dígitos.");
            return;
        }

        setError(null);
        await onConfirm(normalizedCode);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirme seu email</DialogTitle>
                    <DialogDescription>
                        Digite o código enviado para {email} para ativar sua conta.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <Input
                        placeholder="000000"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(event) => {
                            const digitsOnly = event.target.value.replace(/\D/g, "");
                            setCode(digitsOnly);
                        }}
                    />

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button
                        type="button"
                        className="w-full bg-emerald-500 hover:bg-emerald-600"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Validar código
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};