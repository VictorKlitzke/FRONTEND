import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AppointmentDTO } from "../../services/appointment-service";
import type { SettingsDTO } from "@/feature/config/services/settings-service";
import { computeFreeSlotStarts, isDateInConfiguredWorkingDays } from "../../utils/free-slots";

const appointmentSchema = z.object({
  professionalId: z.coerce.number().int().min(1),
  clientId: z.coerce.number().int().min(1),
  serviceId: z.coerce.number().int().min(1),
  date: z.string().min(1, "Informe a data"),
  startTime: z.string().min(1, "Informe a hora de início"),
  endTime: z.string().min(1, "Informe a hora de término"),
  notes: z.string().optional().or(z.literal("")),
}).superRefine((values, ctx) => {
  const [sh, sm] = values.startTime.split(":").map(Number);
  const [eh, em] = values.endTime.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "Hora final deve ser maior que a inicial",
    });
  }
});

export type AppointmentFormValues = z.output<typeof appointmentSchema>;
type AppointmentFormInput = z.input<typeof appointmentSchema>;

interface OptionItem {
  value: number;
  label: string;
  durationMinutes?: number;
}

interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  initialValues?: Partial<AppointmentFormValues>;
  professionals: OptionItem[];
  clients: OptionItem[];
  services: OptionItem[];
  /** Expediente e grade (mesmos campos da agenda pública em Configurações). */
  scheduleSettings?: SettingsDTO | null;
  /** Agendamentos da empresa para calcular sobreposição por profissional. */
  existingAppointments?: AppointmentDTO[];
  /** Ao editar, ignora este id no cálculo de conflito. */
  editingAppointmentId?: number | null;
  loading?: boolean;
  onSubmit: (data: AppointmentFormValues) => void | Promise<void>;
  onCancelAppointment?: () => void | Promise<void>;
}

const defaultValues: AppointmentFormValues = {
  professionalId: 0,
  clientId: 0,
  serviceId: 0,
  date: "",
  startTime: "",
  endTime: "",
  notes: "",
};

const addMinutesToTime = (time: string, minutesToAdd: number): string => {
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return time;
  }

  const totalMinutes = hour * 60 + minute + Math.max(0, minutesToAdd);
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const nextHour = String(Math.floor(normalizedMinutes / 60)).padStart(2, "0");
  const nextMinute = String(normalizedMinutes % 60).padStart(2, "0");

  return `${nextHour}:${nextMinute}`;
};

const normalizeTimeValue = (time: string): string => {
  const raw = time.trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) {
    return raw;
  }

  const hour = String(Math.min(23, Math.max(0, Number(match[1])))).padStart(2, "0");
  const minute = String(Math.min(59, Math.max(0, Number(match[2])))).padStart(2, "0");

  return `${hour}:${minute}`;
};

export function AppointmentFormModal({
  open,
  onOpenChange,
  title,
  description,
  initialValues,
  professionals,
  clients,
  services,
  scheduleSettings,
  existingAppointments,
  editingAppointmentId,
  loading,
  onSubmit,
  onCancelAppointment,
}: AppointmentFormModalProps) {
  const form = useForm<AppointmentFormInput, unknown, AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset({
      ...defaultValues,
      ...initialValues,
      startTime: normalizeTimeValue(initialValues?.startTime ?? defaultValues.startTime),
      endTime: normalizeTimeValue(initialValues?.endTime ?? defaultValues.endTime),
    });
  }, [form, initialValues]);

  const selectedServiceId = form.watch("serviceId");
  const selectedStartTime = form.watch("startTime");
  const watchedDate = form.watch("date");
  const watchedProfessionalId = form.watch("professionalId");

  const freeSlots = useMemo(() => {
    const service = services.find((item) => item.value === selectedServiceId);
    const duration = Number(service?.durationMinutes ?? 0);
    const professionalNumericId = Number(watchedProfessionalId);
    if (!watchedDate || !Number.isFinite(professionalNumericId) || professionalNumericId < 1 || !duration) return [];
    return computeFreeSlotStarts({
      dateStr: watchedDate,
      durationMinutes: duration,
      professionalId: professionalNumericId,
      appointments: existingAppointments ?? [],
      settings: scheduleSettings ?? null,
      excludeAppointmentId: editingAppointmentId ?? null,
    });
  }, [
    watchedDate,
    watchedProfessionalId,
    selectedServiceId,
    services,
    existingAppointments,
    scheduleSettings,
    editingAppointmentId,
  ]);

  const scheduleHint = useMemo(() => {
    const profId = Number(watchedProfessionalId);
    if (!watchedDate || !Number.isFinite(profId) || profId < 1 || !selectedServiceId) {
      return "Selecione profissional, cliente, serviço e data para ver os horários livres.";
    }
    const service = services.find((item) => item.value === selectedServiceId);
    const duration = Number(service?.durationMinutes ?? 0);
    if (!duration) return "Serviço sem duração cadastrada; não é possível sugerir horários.";
    if (!isDateInConfiguredWorkingDays(watchedDate, scheduleSettings ?? null)) {
      return "Este dia não está no expediente configurado (Configurações → agenda pública).";
    }
    if (freeSlots.length === 0) {
      return "Nenhum horário livre neste dia para a duração do serviço e este profissional.";
    }
    return null;
  }, [
    watchedDate,
    watchedProfessionalId,
    selectedServiceId,
    services,
    scheduleSettings,
    freeSlots.length,
  ]);

  useEffect(() => {
    if (!selectedServiceId || !selectedStartTime) {
      return;
    }

    const selectedService = services.find((item) => item.value === selectedServiceId);
    const duration = Number(selectedService?.durationMinutes ?? 0);
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    const normalizedStartTime = normalizeTimeValue(selectedStartTime);
    const computedEndTime = addMinutesToTime(normalizedStartTime, duration);
    const currentEndTime = normalizeTimeValue(form.getValues("endTime"));

    if (normalizedStartTime !== selectedStartTime) {
      form.setValue("startTime", normalizedStartTime, { shouldValidate: true, shouldDirty: true });
    }

    if (currentEndTime !== computedEndTime) {
      form.setValue("endTime", computedEndTime, { shouldValidate: true, shouldDirty: true });
    }
  }, [form, selectedServiceId, selectedStartTime, services]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="professionalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional</FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm"
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={professionals.length === 0}
                    >
                      <option value="" disabled>Selecione um profissional</option>
                      {professionals.map((p) => (
                        <option key={p.value} value={String(p.value)}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  {professionals.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Nenhum profissional disponível</div>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm"
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={clients.length === 0}
                    >
                      <option value="" disabled>Selecione um cliente</option>
                      {clients.map((c) => (
                        <option key={c.value} value={String(c.value)}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  {clients.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Nenhum cliente disponível</div>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço</FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm"
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        field.onChange(selectedId);

                        const selectedService = services.find((item) => item.value === selectedId);
                        const duration = Number(selectedService?.durationMinutes ?? 0);
                        const startTime = normalizeTimeValue(form.getValues("startTime"));

                        if (!startTime || !Number.isFinite(duration) || duration <= 0) {
                          return;
                        }

                        const computedEndTime = addMinutesToTime(startTime, duration);
                        form.setValue("endTime", computedEndTime, { shouldValidate: true, shouldDirty: true });
                      }}
                      disabled={services.length === 0}
                    >
                      <option value="" disabled>Selecione um serviço</option>
                      {services.map((s) => (
                        <option key={s.value} value={String(s.value)}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  {services.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Nenhum serviço disponível</div>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        readOnly={Boolean(form.watch("serviceId"))}
                        disabled={Boolean(form.watch("serviceId"))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {scheduleHint ? (
              <p className="text-xs text-muted-foreground">{scheduleHint}</p>
            ) : null}

            {freeSlots.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">Horários livres neste dia</div>
                <p className="text-xs text-muted-foreground">
                  Com base no expediente configurado e nos agendamentos do profissional. Toque para preencher início e fim.
                </p>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto rounded-md border border-dashed border-muted-foreground/25 p-2">
                  {freeSlots.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={normalizeTimeValue(selectedStartTime) === slot ? "default" : "outline"}
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        form.setValue("startTime", slot, { shouldValidate: true, shouldDirty: true });
                      }}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Opcional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              {onCancelAppointment ? (
                <Button type="button" variant="destructive" onClick={() => onCancelAppointment()}>
                  Cancelar agendamento
                </Button>
              ) : null}
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
