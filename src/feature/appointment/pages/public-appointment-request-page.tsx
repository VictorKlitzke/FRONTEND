import { useEffect, useState, useRef } from "react";
import { startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, subMonths, addMonths, format, parseISO } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AppointmentRequestService } from "../services/appointment-request-service";
import { PublicAvailabilityService, type PublicCompanyInfo, type PublicCompanyItem } from "../services/public-availability-service";

import CardService from "./components/public/card-service";
import SuccessModal from "./components/public/card-success-modal-page";
import AppointmentStepper from "./components/public/card-appointment-stepper";
import CompanySelector from "./components/public/card-company-selector-page";
import TimeSlotsSection from "./components/public/card-timeslots-section-page";
import SummaryCard from "./components/public/card-summary-page";

export const PublicAppointmentRequestPage = () => {
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [companyInfo, setCompanyInfo] = useState<PublicCompanyInfo | null>(null);
  const [companies, setCompanies] = useState<PublicCompanyItem[]>([]);

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availabilityCache, setAvailabilityCache] = useState<Record<string, string[]>>({});
  const inflightDates = useRef<Set<string>>(new Set());
  const [slotsLoading, setSlotsLoading] = useState(false);

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

  const loadCompany = async (id: number) => {
    try {
      const info = await PublicAvailabilityService.getCompanyInfo(id);
      setCompanyInfo(info);
    } catch {
      setCompanyInfo(null);
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
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
            {"<"}
          </button>
          <div className="font-semibold">
            {format(calendarMonth, "MMMM yyyy")}
          </div>
          <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
            {">"}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-sm">
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
                className={`h-12 rounded-xl transition
                  ${
                    selected
                      ? "bg-teal-600 text-white shadow-md"
                      : "hover:bg-teal-50"
                  }
                  ${disabled && "opacity-40 cursor-not-allowed"}
                `}
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
      alert("Erro ao enviar solicitação.");
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

      <div className="min-h-screen from-slate-50 to-white px-4 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            <AppointmentStepper form={form} />

            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Agende seu horário
                </CardTitle>
                <CardDescription>
                  Leva menos de 1 minuto
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">

                {!form.companyId && (
                  <CompanySelector
                    companies={companies}
                    onSelect={(id) => {
                      onChange("companyId", id);
                      loadCompany(Number(id));
                    }}
                  />
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
                  <TimeSlotsSection
                    slots={availableSlots}
                    selected={form.preferredTime}
                    loading={slotsLoading}
                    onSelect={(time) => onChange("preferredTime", time)}
                  />
                )}

                {form.preferredTime && (
                  <div className="space-y-4">
                    <Input
                      placeholder="Seu nome"
                      value={form.clientName}
                      onChange={(e) =>
                        onChange("clientName", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Telefone"
                      value={form.clientPhone}
                      onChange={(e) =>
                        onChange("clientPhone", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Email (opcional)"
                      value={form.clientEmail}
                      onChange={(e) =>
                        onChange("clientEmail", e.target.value)
                      }
                    />

                    <Button
                      size="lg"
                      className="w-full h-12 text-base font-semibold shadow-lg"
                      disabled={!isValid || loading}
                      onClick={handleSubmit}
                    >
                      {loading ? "Enviando..." : "Confirmar agendamento"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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