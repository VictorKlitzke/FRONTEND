import { useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useAlert } from "@/hooks/use-alert";
import { MessageCircle, Loader2, RefreshCw, CheckCircle2, XCircle, QrCode } from "lucide-react";
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
    if (!qr) return null;
    const encoded = encodeURIComponent(qr);
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encoded}`;
  }, [qr]);

  const refreshData = async (silent = false) => {
    if (!companyId) return;
    if (!silent) setRefreshing(true);
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
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => { void refreshData(true); }, [companyId]);

  useEffect(() => {
    if (!companyId || status.ready) return;
    const timer = window.setInterval(() => { void refreshData(true); }, 3000);
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

  const isReady = status.ready;
  const isConnecting = status.connecting || connecting;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="brand-icon-gradient h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0">
            <MessageCircle size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">WhatsApp da empresa</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isReady ? (
                <>
                  <CheckCircle2 size={12} className="brand-icon-primary" />
                  <span className="text-[11px] brand-icon-primary font-medium">Conectado</span>
                </>
              ) : isConnecting ? (
                <>
                  <Loader2 size={12} className="text-amber-500 animate-spin" />
                  <span className="text-[11px] text-amber-600 font-medium">Conectando...</span>
                </>
              ) : (
                <>
                  <XCircle size={12} className="text-slate-400" />
                  <span className="text-[11px] text-slate-400 font-medium">Desconectado</span>
                </>
              )}
            </div>
            {status.startupError && (
              <p className="text-[11px] text-red-500 mt-0.5">{status.startupError}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleConnect}
            disabled={!companyId || connecting}
            className="btn-gradient h-9 px-4 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? (
              <><Loader2 size={13} className="animate-spin" />Iniciando...</>
            ) : (
              <><QrCode size={13} />Gerar QR</>
            )}
          </button>
          <button
            onClick={() => void refreshData()}
            disabled={!companyId || refreshing}
            className="brand-soft-button h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "..." : "Atualizar"}
          </button>
        </div>
      </div>

      <Separator />

      {/* Status content */}
      {!companyId ? (
        <p className="text-xs text-slate-400">Empresa não carregada.</p>
      ) : isReady ? (
        <div className="brand-success-box rounded-xl border p-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="brand-icon-primary shrink-0" />
          <p className="text-xs brand-icon-primary">WhatsApp conectado. Mensagens serão enviadas pelo número vinculado.</p>
        </div>
      ) : qrImageUrl ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Escaneie com o WhatsApp do dono da empresa:</p>
          <img
            src={qrImageUrl}
            alt="QR Code WhatsApp"
            className="h-56 w-56 rounded-xl border border-slate-200 shadow-sm"
          />
        </div>
      ) : (
        <p className="text-xs text-slate-400">Clique em "Gerar QR" para iniciar a conexão.</p>
      )}
    </div>
  );
};
