import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAlert } from "@/hooks/use-alert";
import {
  WhatsappConnectionService,
  type WhatsappCompanyStatus,
} from "@/feature/config/services/whatsapp-connection-service";

interface WhatsappConnectionCardProps {
  companyId?: number;
}

const emptyStatus: WhatsappCompanyStatus = {
  ok: true,
  companyId: "",
  ready: false,
  connecting: false,
  hasQr: false,
  startupError: null,
};

export const WhatsappConnectionCard = ({ companyId }: WhatsappConnectionCardProps) => {
  const { showAlert } = useAlert();
  const [status, setStatus] = useState<WhatsappCompanyStatus>(emptyStatus);
  const [qr, setQr] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const qrImageUrl = useMemo(() => {
    if (!qr) {
      return null;
    }

    const encoded = encodeURIComponent(qr);
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encoded}`;
  }, [qr]);

  const refreshData = async (silent = false) => {
    if (!companyId) {
      return;
    }

    if (!silent) {
      setRefreshing(true);
    }

    try {
      const [nextStatus, nextQr] = await Promise.all([
        WhatsappConnectionService.status(companyId),
        WhatsappConnectionService.qr(companyId),
      ]);

      setStatus(nextStatus);
      setQr(nextQr.qr);
    } catch {
      if (!silent) {
        showAlert({ title: "Erro", message: "Não foi possível carregar status do WhatsApp", type: "error" });
      }
    } finally {
      if (!silent) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void refreshData(true);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) {
      return;
    }

    if (status.ready) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshData(true);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [companyId, status.ready]);

  const handleConnect = async () => {
    if (!companyId) {
      showAlert({ title: "Atenção", message: "Empresa não encontrada para iniciar conexão", type: "warning" });
      return;
    }

    setConnecting(true);
    try {
      const response = await WhatsappConnectionService.connect(companyId);
      setStatus(response);
      await refreshData(true);
      showAlert({ title: "Conexão iniciada", message: "Escaneie o QR Code com o WhatsApp da empresa", type: "success" });
    } catch {
      showAlert({ title: "Erro", message: "Falha ao iniciar conexão do WhatsApp", type: "error" });
    } finally {
      setConnecting(false);
    }
  };

  const statusLabel = status.ready ? "Conectado" : status.connecting ? "Conectando" : "Desconectado";

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp da empresa</CardTitle>
        <CardDescription>Conecte o WhatsApp do dono da empresa para envio automático de mensagens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p>
              Status: <span className="font-medium">{statusLabel}</span>
            </p>
            {status.startupError && <p className="text-xs text-destructive">{status.startupError}</p>}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={!companyId || connecting}>
              {connecting ? "Iniciando..." : "Gerar QR"}
            </Button>
            <Button variant="outline" onClick={() => void refreshData()} disabled={!companyId || refreshing}>
              {refreshing ? "Atualizando..." : "Atualizar status"}
            </Button>
          </div>
        </div>

        <Separator />

        {!companyId ? (
          <p className="text-sm text-muted-foreground">Empresa não carregada.</p>
        ) : status.ready ? (
          <p className="text-sm text-muted-foreground">WhatsApp conectado. As mensagens sairão do número vinculado desta empresa.</p>
        ) : qrImageUrl ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Escaneie com o WhatsApp do dono da empresa:</p>
            <img src={qrImageUrl} alt="QR Code para conexão do WhatsApp" className="h-60 w-60 rounded-md border" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Clique em "Gerar QR" para iniciar a conexão.</p>
        )}
      </CardContent>
    </Card>
  );
};
