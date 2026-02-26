import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, subMonths, addMonths, format, parseISO } from "date-fns";

import { Input } from "@/components/ui/input";
import { useAlert } from "@/hooks/use-alert";

import { AppointmentRequestService } from "../services/appointment-request-service";
import { PublicAvailabilityService, type PublicCompanyInfo, type PublicCompanyItem } from "../services/public-availability-service";

import CardService from "./components/public/card-service";
import SuccessModal from "./components/public/card-success-modal-page";
import AppointmentStepper from "./components/public/card-appointment-stepper";
import CompanySelector from "./components/public/card-company-selector-page";
import TimeSlotsSection from "./components/public/card-timeslots-section-page";
import SummaryCard from "./components/public/card-summary-page";
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";

export const PublicAppointmentRequestPage = () => {
  const [searchParams] = useSearchParams();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [companyInfo, setCompanyInfo] = useState<PublicCompanyInfo | null>(null);
  const [companies, setCompanies] = useState<PublicCompanyItem[]>([]);

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availabilityCache, setAvailabilityCache] = useState<Record<string, string[]>>({});
  const inflightDates = useRef<Set<string>>(new Set());
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const [form, setForm] = useState({
    companyId: "",
    serviceId: "",
    professionalId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });

  const isValid =
    Boolean(form.companyId && form.clientName && form.clientPhone && form.preferredDate && form.preferredTime);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedService = companyInfo?.services?.find(
    (s) => String(s.id) === String(form.serviceId)
  );

  const publicThemeVars = useMemo(() => {
    const normalizeHexColor = (value?: string | null) => {
      if (!value) return null;
      const hex = value.trim().replace("#", "");
      if (hex.length === 3) {
        return `#${hex
          .split("")
          .map((c) => `${c}${c}`)
          .join("")}`;
      }
      if (hex.length === 6) return `#${hex}`;
      return null;
    };

    const hexToRgb = (hexColor: string) => {
      const hex = hexColor.replace("#", "");
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    };

    const primary = normalizeHexColor(companyInfo?.settings?.primary_color) ?? "#059669";
    const secondary = normalizeHexColor(companyInfo?.settings?.secondary_color) ?? "#0d9488";
    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);

    return {
      "--brand-primary-rgb": `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`,
      "--brand-secondary-rgb": `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`,
      "--brand-gradient-main": "linear-gradient(135deg, var(--primary), var(--secondary))",
      "--primary": primary,
      "--secondary": secondary,
    } as React.CSSProperties;
  }, [companyInfo]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const list = await PublicAvailabilityService.listCompanies();
        setCompanies(list);
      } catch {
        setCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const companyFromQuery = searchParams.get("company") ?? searchParams.get("companyId");
    if (!companyFromQuery) return;

    const parsedCompanyId = Number(companyFromQuery);
    if (!Number.isInteger(parsedCompanyId) || parsedCompanyId <= 0) return;

    setForm((prev) => {
      if (prev.companyId === String(parsedCompanyId)) {
        return prev;
      }

      return {
        ...prev,
        companyId: String(parsedCompanyId),
        serviceId: "",
        professionalId: "",
        preferredDate: "",
        preferredTime: "",
      };
    });

    setAvailabilityCache({});
    setAvailableSlots([]);
    void loadCompany(parsedCompanyId);
  }, [searchParams]);

  const loadCompany = async (id: number) => {
    setCompanyLoading(true);
    try {
      const info = await PublicAvailabilityService.getCompanyInfo(id);
      setCompanyInfo(info);
    } catch {
      setCompanyInfo(null);
      showAlert({
        title: "Empresa não encontrada",
        message: "Não foi possível carregar a empresa selecionada pelo link.",
        type: "destructive",
      });
    } finally {
      setCompanyLoading(false);
    }
  };

  const loadSlots = async (companyId: number, date: string) => {
    setSlotsLoading(true);

    try {
      if (availabilityCache[date]) {
        setAvailableSlots(availabilityCache[date]);
        return;
      }

      if (inflightDates.current.has(date)) return;
      inflightDates.current.add(date);

      const slots = await PublicAvailabilityService.getAvailableSlots(
        companyId,
        date
      );

      setAvailableSlots(slots);
      setAvailabilityCache((prev) => ({ ...prev, [date]: slots }));
    } catch {
      showAlert({
        title: "Erro ao carregar horários",
        message: "Não foi possível consultar os horários disponíveis. Tente novamente.",
        type: "destructive",
      });
      setAvailableSlots([]);
    } finally {
      inflightDates.current.delete(date);
      setSlotsLoading(false);
    }
  };

  const handleSelectDay = async (day: Date) => {
    const iso = format(day, "yyyy-MM-dd");
    onChange("preferredDate", iso);

    const cid = Number(form.companyId);
    if (cid) await loadSlots(cid, iso);
  };

  const renderCalendar = () => {
    const start = startOfWeek(startOfMonth(calendarMonth));
    const end = addDays(endOfMonth(calendarMonth), 6);
    const days: Date[] = [];

    for (let d = start; d <= end; d = addDays(d, 1)) {
      days.push(d);
    }

    return (
      <div className="public-card rounded-2xl backdrop-blur-sm p-5">
        <h3 className="text-base font-bold text-slate-800 mb-4">Escolha uma data</h3>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            className="public-hover-brand h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-all"
          >
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <div className="text-sm font-bold text-slate-800 capitalize">
            {format(calendarMonth, "MMMM yyyy")}
          </div>
          <button
            onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            className="public-hover-brand h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-all"
          >
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="h-8 flex items-center justify-center text-[11px] font-semibold text-slate-400">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-sm">
          {days.map((day) => {
            const iso = format(day, "yyyy-MM-dd");
            const disabled = !isSameMonth(day, calendarMonth);
            const selected =
              form.preferredDate &&
              isSameDay(parseISO(form.preferredDate), day);

            return (
              <button
                key={iso}
                disabled={disabled}
                onClick={() => handleSelectDay(day)}
                className={`h-9 rounded-xl text-sm font-medium transition-all duration-150
                  ${selected
                    ? "text-white public-selected-shadow"
                    : disabled
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-700 public-hover-brand"
                  }`}
                style={selected ? {
                  background: "var(--brand-gradient-main)",
                } : undefined}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await AppointmentRequestService.createPublic({
        companyId: Number(form.companyId),
        serviceId: Number(form.serviceId),
        professionalId: form.professionalId
          ? Number(form.professionalId)
          : undefined,
        clientName: form.clientName,
        clientEmail: form.clientEmail || undefined,
        clientPhone: form.clientPhone,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        notes: form.notes || undefined,
      });

      setSuccessOpen(true);
    } catch {
      showAlert({
        title: "Erro ao enviar solicitação",
        message: "Não foi possível enviar seu pedido agora. Tente novamente.",
        type: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
      />

      <div className="public-page-bg min-h-screen px-4 py-12" style={publicThemeVars}>
        {/* Branded header */}
        <div className="max-w-6xl mx-auto mb-8 flex items-center gap-3">
          <div className="sidebar-brand-icon h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Calendar size={18} />
          </div>
          <div>
            <span className="text-xl font-bold gradient-text">AgendaPro</span>
            <div className="public-brand-subtle text-xs mt-0.5">Agendamento Online</div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

          <div className="lg:col-span-2 space-y-6">
            <AppointmentStepper form={form} />

            <div className="public-card rounded-2xl backdrop-blur-sm shadow-xl overflow-hidden">
              {/* Card gradient header */}
              <div className="public-header-soft px-6 py-5">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ background: "var(--brand-gradient-main)", boxShadow: "0 4px 12px rgba(var(--brand-primary-rgb, 5, 150, 105), 0.28)" }}
                  >
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Agende seu horário</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Leva menos de 1 minuto</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {!form.companyId && (
                  <CompanySelector
                    companies={companies}
                    onSelect={(id) => {
                      onChange("companyId", id);
                      loadCompany(Number(id));
                    }}
                  />
                )}

                {companyLoading && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={14} className="animate-spin public-brand-text" />
                    Carregando dados da empresa...
                  </div>
                )}

                {companyInfo && (
                  <CardService
                    services={companyInfo.services ?? []}
                    selectedId={form.serviceId}
                    onSelect={(id) => onChange("serviceId", id)}
                  />
                )}

                {form.serviceId && renderCalendar()}

                {form.preferredDate && (
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Escolha o horário</h3>
                    <TimeSlotsSection
                      slots={availableSlots}
                      selected={form.preferredTime}
                      loading={slotsLoading}
                      onSelect={(time) => onChange("preferredTime", time)}
                    />
                  </div>
                )}

                {form.preferredTime && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Seus dados</h3>
                    <Input
                      placeholder="Seu nome completo"
                      value={form.clientName}
                      onChange={(e) => onChange("clientName", e.target.value)}
                      className="brand-input-focus h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                    />
                    <Input
                      placeholder="Telefone / WhatsApp"
                      value={form.clientPhone}
                      onChange={(e) => onChange("clientPhone", e.target.value)}
                      className="brand-input-focus h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                    />
                    <Input
                      placeholder="Email (opcional)"
                      value={form.clientEmail}
                      onChange={(e) => onChange("clientEmail", e.target.value)}
                      className="brand-input-focus h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                    />

                    <button
                      disabled={!isValid || loading}
                      onClick={handleSubmit}
                      className="btn-gradient w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Confirmar agendamento
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <SummaryCard
            company={companyInfo?.name}
            service={selectedService?.service_name}
            date={form.preferredDate}
            time={form.preferredTime}
            price={selectedService?.price ?? undefined}
          />
        </div>
      </div>
    </>
  );
};
