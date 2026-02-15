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

export const AppointmentPage = () => {
  const { appointments, loading, fetchByCompany, createAppointment, updateAppointment, deleteAppointment } = useAppointmentStore();
  const { showAlert } = useAlert();
  const { clients, fetchAll: fetchClients } = useClientStore();
  const { professionals, fetchAll: fetchProfessionals } = useProfessionalStore();
  const { services, fetchAll: fetchServices } = useServiceStore();
  const { user } = AuthStore();
  const { settings } = useSettingsStore();
  const labels = getSegmentLabels(settings?.segment);

  const [currentMonth, setCurrentMonth] = useState(new Date());
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
    fetchByCompany();
    fetchClients();
    fetchProfessionals();
    fetchServices();
    loadRequests();
  }, [fetchByCompany, fetchClients, fetchProfessionals, fetchServices]);

  const clientOptions = useMemo(
    () => clients.map((c) => ({ value: c.id ?? 0, label: c.name })),
    [clients]
  );
  const professionalOptions = useMemo(
    () => professionals.map((p) => ({ value: p.id ?? 0, label: p.name })),
    [professionals]
  );
  const serviceOptions = useMemo(
    () => services.map((s) => ({ value: s.id ?? 0, label: s.name })),
    [services]
  );

  const calendarAppointments: CalendarAppointment[] = useMemo(
    () => (appointments || []).map((a) => ({
      id: a.id,
      startAt: a.startAt,
      title: `#${a.id ?? ""}`,
    })),
    [appointments]
  );

  const toDateTimeFields = (iso: string) => {
    const date = new Date(iso);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
  };

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
    const base = date ?? new Date();
    const baseDate = new Date(base);
    baseDate.setHours(9, 0, 0, 0);
    const { date: d, time: t } = toDateTimeFields(baseDate.toISOString());
    setEditingId(null);
    setInitialForm({ date: d, startTime: t, endTime: addMinutes(baseDate.toISOString(), 30), notes: "" });
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

    setEditingId(target.id ?? null);
    setInitialForm({
      professionalId: target.professionalId,
      clientId: target.clientId,
      serviceId: target.serviceId,
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
      const storedEmpresa = sessionStorage.getItem("empresa-storage");
      const empresaIdFromStorage = storedEmpresa
        ? (JSON.parse(storedEmpresa)?.state?.company?.id as number | undefined)
        : undefined;
      const companyId = empresaIdFromStorage ?? user?.empresaId ?? 0;

      const startDate = toLocalDate(data.date, data.startTime);
      const endDate = toLocalDate(data.date, data.endTime);
      const durationMinutes = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
      const startAt = `${data.date} ${data.startTime}:00`;
      const endAt = `${data.date} ${data.endTime}:00`;
      const now = new Date();
      if (startDate.getTime() < now.getTime()) {
        showAlert({ title: "Erro", message: "Não é permitido agendar em datas passadas", type: "destructive" });
        return;
      }

      const hasConflict = (appointments || []).some((a) => {
        if (!a.startAt) return false;
        if (editingId && a.id === editingId) return false;
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
      const payload = {
        companyId, professionalId: data.professionalId,
        clientId: data.clientId,
        serviceId: data.serviceId,
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
    setApprovalInitialForm({
      date: baseDate,
      startTime: baseTime,
      endTime,
      serviceId: request.service_id ?? 0,
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

      await AppointmentRequestService.approve(approvalRequestId, {
        professionalId: data.professionalId,
        clientId: data.clientId,
        serviceId: data.serviceId,
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
    } catch {
      showAlert({ title: "Erro", message: "Falha ao aprovar solicitação", type: "destructive" });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{labels.appointments.plural}</CardTitle>
            <CardDescription>Calendário em tela cheia com criação rápida</CardDescription>
          </div>

        </CardHeader>
        <CardContent>
          <div className="h-auto md:h-[calc(100vh-16rem)]">
            <AppointmentCalendar
              currentMonth={currentMonth}
              appointments={calendarAppointments}
              onMonthChange={setCurrentMonth}
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
              title={editingId ? `Editar ${labels.appointments.singular.toLowerCase()}` : `Novo ${labels.appointments.singular.toLowerCase()}`}
              description={`Selecione cliente, ${labels.professionals.singular.toLowerCase()}, ${labels.services.singular.toLowerCase()} e horário`}
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
        title={editingId ? "Editar agendamento" : "Novo agendamento"}
        description="Selecione cliente, profissional, serviço e horário"
        initialValues={initialForm}
        professionals={professionalOptions}
        clients={clientOptions}
        services={serviceOptions}
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
        loading={loading}
        onSubmit={handleApproveSubmit}
      />
    </div>
  );
};
