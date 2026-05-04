import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppointmentStore } from "../stores/appointment-store";
import { useAlert } from "@/hooks/use-alert";
import { AppointmentCalendar, type CalendarAppointment } from "./components/appointment-calendar";
import { AppointmentFormModal, type AppointmentFormValues } from "./components/appointment-form-modal";
import { AppointmentRequestService, type AppointmentRequestDTO } from "../services/appointment-request-service";
import { useClientStore } from "@/feature/client/stores/client-store";
import { useProfessionalStore } from "@/feature/profissional/stores/professional-store";
import { useServiceStore } from "@/feature/service/stores/service-store";
import { AuthStore } from "@/feature/auth/stores/auth-store";
import { useSettingsStore } from "@/feature/config/store/settings-store";
import { getSegmentLabels } from "@/shared/segments/segment-labels";
import { useEmpresaStore } from "@/feature/empresa/stores/empresa-store";

function splitClientDisplayName(full: string): { first: string; last: string } {
  const t = full.trim();
  if (!t) return { first: "", last: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { first: t, last: "" };
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

export const AppointmentPage = () => {
  const { appointments, loading, fetchByCompany, createAppointment, updateAppointment, deleteAppointment } = useAppointmentStore();
  const { showAlert } = useAlert();
  const { clients, fetchAll: fetchClients } = useClientStore();
  const { professionals, fetchAll: fetchProfessionals } = useProfessionalStore();
  const { services, fetchAll: fetchServices } = useServiceStore();
  const { user } = AuthStore();
  const { company, fetchByUserId } = useEmpresaStore();
  const { settings } = useSettingsStore();
  const labels = getSegmentLabels(settings?.segment);

  /** Qualquer dia da semana visível no calendário semanal */
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialForm, setInitialForm] = useState<Partial<AppointmentFormValues> | undefined>(undefined);
  const [pendingRequests, setPendingRequests] = useState<AppointmentRequestDTO[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalRequestId, setApprovalRequestId] = useState<number | null>(null);
  const [approvalInitialForm, setApprovalInitialForm] = useState<Partial<AppointmentFormValues> | undefined>(undefined);

  const loadRequests = async () => {
    setRequestLoading(true);
    try {
      const list = await AppointmentRequestService.getAll("PENDING");
      setPendingRequests(list);
    } catch {
      setPendingRequests([]);
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && !company?.id) {
      fetchByUserId(user.id);
    }
  }, [company?.id, fetchByUserId, user?.id]);

  useEffect(() => {
    fetchByCompany();
    fetchClients();
    fetchProfessionals();
    fetchServices(company?.id ?? 0);
    loadRequests();
  }, [fetchByCompany, fetchClients, fetchProfessionals, fetchServices, company?.id]);

  const clientOptions = useMemo(
    () => clients.map((c) => ({ value: c.id ?? 0, label: c.name })),
    [clients]
  );
  const professionalOptions = useMemo(
    () => professionals.map((p) => ({ value: p.id ?? 0, label: p.name })),
    [professionals]
  );
  const serviceOptions = useMemo(
    () => services.map((s) => {
      const rawService = s as unknown as Record<string, unknown>;
      const rawDuration =
        rawService.durationMinutes ??
        rawService.duration_minutes ??
        rawService.duracao_minutos ??
        rawService["duração_minutos"] ??
        rawService.duration;

      const parsedDuration =
        typeof rawDuration === "number"
          ? rawDuration
          : typeof rawDuration === "string"
            ? Number.parseInt(rawDuration, 10)
            : 0;

      return {
        value: s.id ?? 0,
        label: s.name,
        durationMinutes: Number.isFinite(parsedDuration) ? parsedDuration : 0,
      };
    }),
    [services]
  );

  const calendarAppointments: CalendarAppointment[] = useMemo(
    () =>
      (appointments || []).map((a) => {
        const svcIds =
          a.serviceIds && a.serviceIds.length > 0
            ? a.serviceIds
            : a.serviceId
              ? [a.serviceId]
              : [];
        const nameParts = svcIds
          .map((id) => services.find((s) => s.id === id)?.name)
          .filter((x): x is string => Boolean(x));
        const title =
          nameParts.length > 0 ? nameParts.join(" + ") : a.serviceId ? `Serviço #${a.serviceId}` : "Agendamento";

        let subtitle = [a.clientFirstName, a.clientLastName].filter(Boolean).join(" ").trim();
        if (!subtitle && a.clientId) {
          subtitle = clients.find((c) => c.id === a.clientId)?.name ?? "";
        }

        return {
          id: a.id,
          startAt: a.startAt,
          endAt: a.endAt,
          durationMinutes: a.durationMinutes,
          title,
          subtitle: subtitle || undefined,
          colorKey: a.professionalId ?? a.id ?? 0,
        };
      }),
    [appointments, services, clients]
  );

  const addMinutes = (iso: string, minutes: number) => {
    const date = new Date(iso);
    date.setMinutes(date.getMinutes() + minutes);
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
  };

  const toLocalDate = (dateStr: string, timeStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = timeStr.split(":").map(Number);
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
  };

  const parseStartAt = (value?: string) => {
    if (!value) return new Date("1970-01-01T00:00:00");
    if (value.includes("T")) return new Date(value);
    const [datePart, timePart = "00:00:00"] = value.split(" ");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss] = timePart.split(":").map(Number);
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
  };

  const handleNew = (date?: Date) => {
    const baseDate = new Date(date ?? Date.now());
    if (!date) {
      baseDate.setHours(9, 0, 0, 0);
    }
    const d = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-${String(baseDate.getDate()).padStart(2, "0")}`;
    const t = `${String(baseDate.getHours()).padStart(2, "0")}:${String(baseDate.getMinutes()).padStart(2, "0")}`;
    const end = new Date(baseDate);
    end.setMinutes(end.getMinutes() + 30);
    const endT = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
    setEditingId(null);
    const firstService = serviceOptions[0];
    setInitialForm({
      date: d,
      startTime: t,
      endTime: endT,
      notes: "",
      clientId: 0,
      clientFirstName: "",
      clientLastName: "",
      serviceIds: firstService?.value != null && Number(firstService.value) > 0 ? [Number(firstService.value)] : [],
    });
    setIsOpen(true);
  };

  const handleEdit = (appointmentId?: number) => {
    const target = (appointments || []).find((a) => a.id === appointmentId);
    if (!target || !target.startAt) return;
    const date = parseStartAt(target.startAt);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const baseDate = `${yyyy}-${mm}-${dd}`;
    const startTime = `${hh}:${mi}`;
    const endTime = addMinutes(target.startAt, target.durationMinutes ?? 0);

    let clientFirst = target.clientFirstName ?? "";
    let clientLast = target.clientLastName ?? "";
    if (!clientFirst && !clientLast && target.clientId) {
      const row = clients.find((c) => c.id === target.clientId);
      if (row?.name) {
        const sp = splitClientDisplayName(row.name);
        clientFirst = sp.first;
        clientLast = sp.last;
      }
    }

    setEditingId(target.id ?? null);
    setInitialForm({
      professionalId: target.professionalId,
      clientId: target.clientId,
      clientFirstName: clientFirst,
      clientLastName: clientLast,
      serviceIds:
        target.serviceIds && target.serviceIds.length > 0
          ? target.serviceIds
          : target.serviceId
            ? [target.serviceId]
            : [],
      date: baseDate,
      startTime,
      endTime,
      notes: target.notes || "",
    });
    setIsOpen(true);
  };

  const handleCancel = async () => {
    if (!editingId) return;
    if (!confirm("Cancelar este agendamento?")) return;
    await deleteAppointment(editingId);
    showAlert({ title: "Sucesso", message: "Agendamento cancelado", type: "success" });
    setIsOpen(false);
    setEditingId(null);
    setInitialForm(undefined);
  };


  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      const companyId = company?.id ?? user?.empresaId ?? 0;
      if (!companyId) {
        showAlert({ title: "Erro", message: "Empresa não encontrada", type: "destructive" });
        return;
      }

      const startDate = toLocalDate(data.date, data.startTime);
      const endDate = toLocalDate(data.date, data.endTime);
      const durationMinutes = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
      const startAt = `${data.date} ${data.startTime}:00`;
      const endAt = `${data.date} ${data.endTime}:00`;

      const hasConflict = (appointments || []).some((a) => {
        if (!a.startAt) return false;
        if (editingId && a.id === editingId) return false;
        if (a.professionalId !== data.professionalId) return false;
        const existingStart = parseStartAt(a.startAt).getTime();
        const existingEnd = existingStart + (a.durationMinutes ?? 0) * 60000;
        const newStart = startDate.getTime();
        const newEnd = endDate.getTime();
        return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasConflict) {
        showAlert({ title: "Erro", message: "Já existe um agendamento nesse horário", type: "destructive" });
        return;
      }
      const primary = data.serviceIds[0] ?? 0;
      if (!primary) {
        showAlert({ title: "Erro", message: "Selecione ao menos um serviço", type: "destructive" });
        return;
      }
      const payload = {
        companyId,
        professionalId: data.professionalId,
        clientId: data.clientId,
        clientFirstName: (data.clientFirstName ?? "").trim(),
        clientLastName: (data.clientLastName ?? "").trim(),
        serviceId: primary,
        serviceIds: data.serviceIds,
        startAt,
        endAt,
        durationMinutes,
        notes: data.notes,
      };

      if (editingId) {
        await updateAppointment(editingId, payload);
        showAlert({ title: "Sucesso", message: "Agendamento atualizado", type: "success" });
      } else {
        await createAppointment(payload);
        showAlert({ title: "Sucesso", message: "Agendamento criado", type: "success" });
      }
      await fetchByCompany();
      await fetchClients();
      setIsOpen(false);
      setEditingId(null);
      setInitialForm(undefined);
    } catch {
      showAlert({ title: "Erro", message: "Falha ao salvar agendamento", type: "destructive" });
    }
  };

  const handleApprove = (request: AppointmentRequestDTO) => {
    const baseDate = request.preferred_date || "";
    const baseTime = request.preferred_time || "";
    const startAtIso = baseDate && baseTime ? `${baseDate} ${baseTime}:00` : undefined;
    const endTime = startAtIso ? addMinutes(startAtIso, 30) : "";

    setApprovalRequestId(request.id);
    const aprvSid = request.service_id ?? 0;
    setApprovalInitialForm({
      date: baseDate,
      startTime: baseTime,
      endTime,
      serviceIds: aprvSid > 0 ? [aprvSid] : [],
      clientId: request.client_id ?? 0,
      notes: request.notes ?? "",
    });
    setApprovalOpen(true);
  };

  const handleReject = async (requestId: number) => {
    try {
      await AppointmentRequestService.reject(requestId);
      showAlert({ title: "Sucesso", message: "Solicitação recusada", type: "success" });
      await loadRequests();
    } catch {
      showAlert({ title: "Erro", message: "Falha ao recusar solicitação", type: "destructive" });
    }
  };

  const handleApproveSubmit = async (data: AppointmentFormValues) => {
    if (!approvalRequestId) return;
    try {
      const startAt = `${data.date} ${data.startTime}:00`;
      const endAt = `${data.date} ${data.endTime}:00`;
      const startDate = toLocalDate(data.date, data.startTime);
      const endDate = toLocalDate(data.date, data.endTime);
      const durationMinutes = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 60000));

      const primaryApprove = data.serviceIds[0] ?? 0;
      await AppointmentRequestService.approve(approvalRequestId, {
        professionalId: data.professionalId,
        clientId: data.clientId,
        serviceId: primaryApprove,
        serviceIds: data.serviceIds,
        startAt,
        endAt,
        durationMinutes,
        notes: data.notes ?? null,
      });

      showAlert({ title: "Sucesso", message: "Solicitação aprovada", type: "success" });
      setApprovalOpen(false);
      setApprovalRequestId(null);
      setApprovalInitialForm(undefined);
      await loadRequests();
      await fetchByCompany();
      await fetchClients();
    } catch {
      showAlert({ title: "Erro", message: "Falha ao aprovar solicitação", type: "destructive" });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardHeader className="flex flex-col gap-3 px-4 pt-6 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{labels.appointments.plural}</CardTitle>
            <CardDescription className="hidden sm:block">
              Visão semanal (segunda a domingo), grade por horário — clique no horário ou no bloco
            </CardDescription>
            <p className="mt-1 text-sm text-muted-foreground sm:hidden">
              Grade semanal · escolha o dia e toque no horário
            </p>
          </div>

        </CardHeader>
        <CardContent className="min-h-0 px-3 pb-6 pt-0 sm:px-6 sm:pb-6">
          <div className="w-full md:max-h-[min(72vh,calc(100vh-13rem))] md:overflow-y-auto md:overscroll-contain md:pr-1">
            <AppointmentCalendar
              viewDate={calendarViewDate}
              appointments={calendarAppointments}
              onWeekChange={(deltaWeeks) => {
                setCalendarViewDate((prev) => {
                  const n = new Date(prev);
                  n.setDate(n.getDate() + deltaWeeks * 7);
                  return n;
                });
              }}
              onNavigateToToday={() => setCalendarViewDate(new Date())}
              onSelectDate={handleNew}
              onSelectAppointment={handleEdit}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Solicitações de {labels.appointments.singular.toLowerCase()}</CardTitle>
            <CardDescription>Pedidos enviados por clientes</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {requestLoading ? (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="rounded-lg border p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium">{req.client_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {req.preferred_date} {req.preferred_time}
                    </div>
                    {req.notes ? (
                      <div className="text-xs text-muted-foreground">{req.notes}</div>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleReject(req.id)}>Recusar</Button>
                    <Button onClick={() => handleApprove(req)}>Aprovar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentFormModal
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingId(null);
            setInitialForm(undefined);
          }
        }}
        title={editingId ? `Editar ${labels.appointments.singular.toLowerCase()}` : `Novo ${labels.appointments.singular.toLowerCase()}`}
        description={`Selecione cliente, ${labels.professionals.singular.toLowerCase()}, ${labels.services.singular.toLowerCase()} e horário`}
        initialValues={initialForm}
        professionals={professionalOptions}
        clients={clientOptions}
        services={serviceOptions}
        scheduleSettings={settings}
        existingAppointments={appointments ?? []}
        editingAppointmentId={editingId}
        loading={loading}
        onSubmit={onSubmit}
        onCancelAppointment={editingId ? handleCancel : undefined}
      />

      <AppointmentFormModal
        open={approvalOpen}
        onOpenChange={(open) => {
          setApprovalOpen(open);
          if (!open) {
            setApprovalRequestId(null);
            setApprovalInitialForm(undefined);
          }
        }}
        title="Aprovar solicitação"
        description="Defina cliente, profissional e horário"
        initialValues={approvalInitialForm}
        professionals={professionalOptions}
        clients={clientOptions}
        services={serviceOptions}
        scheduleSettings={settings}
        existingAppointments={appointments ?? []}
        editingAppointmentId={null}
        loading={loading}
        onSubmit={handleApproveSubmit}
      />
    </div>
  );
};
