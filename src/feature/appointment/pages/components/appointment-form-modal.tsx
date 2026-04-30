import { useEffect, useMemo, type ComponentType, type ReactNode } from "react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarClock, Clock, Plus, Scissors, StickyNote, Trash2, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppointmentDTO } from "../../services/appointment-service";
import type { SettingsDTO } from "@/feature/config/services/settings-service";
import { computeFreeSlotStarts, isDateInConfiguredWorkingDays } from "../../utils/free-slots";

const appointmentSchema = z.object({
  professionalId: z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "Selecione um profissional")
    .int()
    .min(1, "Selecione um profissional"),
  clientId: z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "Selecione um cliente"),
  clientFirstName: z.string().optional(),
  clientLastName: z.string().optional(),
  serviceIds: z.array(z.coerce.number().int().min(1, "Selecione o serviço")).min(1, "Inclua ao menos um serviço"),
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

  const cid = values.clientId;
  if (cid >= 1) return;

  const fn = (values.clientFirstName ?? "").trim();
  const ln = (values.clientLastName ?? "").trim();
  if (fn.length < 1 || ln.length < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["clientFirstName"],
      message: "Selecione um cliente cadastrado ou informe nome e sobrenome para cadastro automático.",
    });
  }
});

export type AppointmentFormValues = z.output<typeof appointmentSchema>;
type AppointmentFormInput = z.input<typeof appointmentSchema>;

interface OptionItem {
  value: number | string;
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
  clientFirstName: "",
  clientLastName: "",
  serviceIds: [],
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

/** RHF / selects podem expor id como string; comparações estritas falham no .find das opções. */
function toPositiveInt(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.trunc(n);
}

function findOptionById<T extends { value: number | string }>(items: T[], id: unknown): T | undefined {
  const n = toPositiveInt(id);
  if (n == null) return undefined;
  return items.find((item) => Number(item.value) === n || String(item.value) === String(id));
}

function totalDurationForServices(serviceIds: number[], serviceOptions: OptionItem[]): number {
  return serviceIds.reduce((sum, id) => {
    const s = findOptionById(serviceOptions, id);
    const d = Number(s?.durationMinutes ?? 0);
    return sum + (Number.isFinite(d) && d > 0 ? d : 0);
  }, 0);
}

const selectFieldClass = cn(
  "h-10 w-full rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-900",
  "shadow-sm transition-[box-shadow,border-color] cursor-pointer",
  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

const inputFieldClass = cn(
  "h-10 rounded-xl border-slate-200/90 bg-white shadow-sm",
  "focus-visible:ring-primary/25"
);

function FormSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/60 bg-white p-4 sm:p-5 shadow-sm",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2.5 border-b border-slate-100/90 pb-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <h3 className="text-sm font-semibold leading-tight text-slate-800">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

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

  const { reset, control: formControl } = form;
  const { fields, append, remove } = useFieldArray({ control: formControl, name: "serviceIds" });

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        p: initialValues?.professionalId,
        c: initialValues?.clientId,
        ss: initialValues?.serviceIds,
        d: initialValues?.date,
        st: initialValues?.startTime,
        et: initialValues?.endTime,
        n: initialValues?.notes,
        cf: initialValues?.clientFirstName,
        cl: initialValues?.clientLastName,
      }),
    [initialValues]
  );

  useEffect(() => {
    if (!open) return;
    const mergedServiceIds =
      initialValues?.serviceIds && initialValues.serviceIds.length > 0
        ? initialValues.serviceIds
        : defaultValues.serviceIds;
    reset({
      ...defaultValues,
      ...initialValues,
      clientFirstName: initialValues?.clientFirstName ?? "",
      clientLastName: initialValues?.clientLastName ?? "",
      serviceIds: mergedServiceIds,
      startTime: normalizeTimeValue(initialValues?.startTime ?? defaultValues.startTime),
      endTime: normalizeTimeValue(initialValues?.endTime ?? defaultValues.endTime),
    });
  }, [open, initialSnapshot, reset]);

  const watchedServiceIds = form.watch("serviceIds");
  const selectedStartTime = form.watch("startTime");
  const watchedDate = form.watch("date");
  const watchedProfessionalId = form.watch("professionalId");
  const watchedClientId = form.watch("clientId");

  const totalSlotDuration = useMemo(
    () => totalDurationForServices((watchedServiceIds ?? []) as number[], services),
    [watchedServiceIds, services]
  );

  const freeSlots = useMemo(() => {
    const professionalNumericId = toPositiveInt(watchedProfessionalId);
    const dateKey = String(watchedDate ?? "").trim();
    if (!dateKey || professionalNumericId == null || !totalSlotDuration) return [];
    return computeFreeSlotStarts({
      dateStr: dateKey,
      durationMinutes: totalSlotDuration,
      professionalId: professionalNumericId,
      appointments: existingAppointments ?? [],
      settings: scheduleSettings ?? null,
      excludeAppointmentId: editingAppointmentId ?? null,
    });
  }, [
    watchedDate,
    watchedProfessionalId,
    totalSlotDuration,
    services,
    existingAppointments,
    scheduleSettings,
    editingAppointmentId,
  ]);

  const scheduleHint = useMemo(() => {
    const profId = toPositiveInt(watchedProfessionalId);
    const dateKey = String(watchedDate ?? "").trim();
    const hasServices = (watchedServiceIds ?? []).length > 0;
    if (!profId) return "Selecione um profissional para ver os horários livres.";
    if (!hasServices) return "Inclua ao menos um serviço para continuar.";
    if (!dateKey) return "Selecione uma data para ver os horários livres.";
    if (!totalSlotDuration) {
      return "Não há duração cadastrada para os serviços selecionados; informe o horário de término manualmente. A grade de sugestão de horários usa a soma das durações.";
    }
    if (!isDateInConfiguredWorkingDays(dateKey, scheduleSettings ?? null)) {
      return "Este dia não está no expediente configurado (Configurações → agenda pública).";
    }
    if (freeSlots.length === 0) {
      return "Nenhum horário livre neste dia para a duração considerada (soma dos serviços) e este profissional.";
    }
    return null;
  }, [
    watchedDate,
    watchedProfessionalId,
    watchedServiceIds,
    totalSlotDuration,
    scheduleSettings,
    freeSlots.length,
  ]);

  const applyEndFromDurations = () => {
    const startTime = normalizeTimeValue(form.getValues("startTime"));
    const ids = form.getValues("serviceIds") ?? [];
    if (!startTime) return;
    const total = totalDurationForServices(ids, services);
    if (!total) return;
    form.setValue("endTime", addMinutesToTime(startTime, total), { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    if (watchedServiceIds.length !== 1 || !selectedStartTime) {
      return;
    }
    const selectedService = findOptionById(services, watchedServiceIds[0]);
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
  }, [form, watchedServiceIds, selectedStartTime, services]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex min-h-0 max-h-[min(92dvh,880px)] flex-col gap-0 overflow-hidden p-0",
          "w-[min(96vw,1120px)] max-w-[min(96vw,1120px)] sm:max-w-[min(96vw,1120px)]",
          "rounded-2xl border-0 bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200/90"
        )}
      >
        <div className="relative shrink-0 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-teal-50/40 px-6 pb-5 pt-6 pr-14">
          <div className="flex gap-3">
            <div className="brand-icon-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md shadow-primary/15">
              <CalendarClock className="h-5 w-5 text-white" aria-hidden />
            </div>
            <DialogHeader className="flex-1 space-y-1.5 text-left">
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">{title}</DialogTitle>
              {description ? (
                <DialogDescription className="text-sm leading-relaxed text-slate-600">{description}</DialogDescription>
              ) : null}
            </DialogHeader>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
            <div className="min-w-0 space-y-5">
            <FormSection title="Cliente e profissional" icon={UserCircle2}>
            <FormField
              control={form.control}
              name="professionalId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-slate-700">Profissional</FormLabel>
                  <FormControl>
                    <select
                      className={selectFieldClass}
                      value={toPositiveInt(field.value) == null ? "" : String(field.value)}
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
                    <div className="text-xs text-amber-700/90">Nenhum profissional disponível</div>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-slate-700">Cliente</FormLabel>
                  <FormControl>
                    <select
                      className={selectFieldClass}
                      value={field.value === undefined || field.value === null ? "" : String(field.value)}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        field.onChange(v);
                        if (v >= 1) {
                          form.setValue("clientFirstName", "");
                          form.setValue("clientLastName", "");
                        }
                      }}
                    >
                      <option value="" disabled>Selecione uma opção</option>
                      <option value="0">Novo cliente — informar nome e sobrenome abaixo</option>
                      {clients.map((c) => (
                        <option key={c.value} value={String(c.value)}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  {clients.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-amber-200/80 bg-amber-50/50 px-3 py-2 text-xs text-amber-900/80">
                      Nenhum cliente cadastrado — escolha &quot;Novo cliente&quot; e preencha nome e sobrenome.
                    </div>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedClientId === 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clientFirstName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700">Nome</FormLabel>
                      <FormControl>
                        <Input {...field} className={inputFieldClass} placeholder="Nome" autoComplete="given-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientLastName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700">Sobrenome</FormLabel>
                      <FormControl>
                        <Input {...field} className={inputFieldClass} placeholder="Sobrenome" autoComplete="family-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}
            </FormSection>
            </div>

            <div className="min-w-0 space-y-5 lg:border-l lg:border-slate-200/80 lg:pl-8">
            <FormSection title="Serviço e horário" icon={Scissors}>
            <div className="space-y-3">
              {fields.map((row, index) => (
                <div key={row.id} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
                  <FormField
                    control={form.control}
                    name={`serviceIds.${index}`}
                    render={({ field }) => (
                      <FormItem className="min-w-0 flex-1 space-y-2">
                        <FormLabel className="text-slate-700">
                          {index === 0 ? "Serviços" : " "}
                        </FormLabel>
                        <FormControl>
                          <select
                            className={selectFieldClass}
                            value={toPositiveInt(field.value) == null ? "" : String(field.value)}
                            onChange={(e) => {
                              const selectedId = Number(e.target.value);
                              const list = (form.getValues("serviceIds") as number[] | undefined) ?? [];
                              const next = list.map((v, i) => (i === index ? selectedId : v));
                              field.onChange(selectedId);
                              if (next.length === 1 && toPositiveInt(next[0]) != null) {
                                const selectedService = findOptionById(services, next[0]);
                                const duration = Number(selectedService?.durationMinutes ?? 0);
                                const startTime = normalizeTimeValue(form.getValues("startTime"));
                                if (startTime && Number.isFinite(duration) && duration > 0) {
                                  form.setValue("endTime", addMinutesToTime(startTime, duration), {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                }
                              }
                            }}
                            disabled={services.length === 0}
                          >
                            <option value="" disabled>
                              Selecione um serviço
                            </option>
                            {services.map((s) => (
                              <option key={s.value} value={String(s.value)}>
                                {s.label}
                                {s.durationMinutes != null && s.durationMinutes > 0
                                  ? ` — ${s.durationMinutes} min`
                                  : " — duração opcional"}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-xl"
                      onClick={() => remove(index)}
                      aria-label="Remover serviço"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="h-10 w-10 shrink-0 sm:mb-0" />
                  )}
                </div>
              ))}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 w-full justify-center gap-2 rounded-xl sm:w-auto"
                  disabled={services.length === 0}
                  onClick={() => {
                    const first = services[0] ? Number(services[0].value) : 1;
                    append(first);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  {fields.length === 0 ? "Adicionar serviço" : "Adicionar outro serviço"}
                </Button>
                {totalSlotDuration > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full justify-center rounded-xl sm:w-auto"
                    onClick={() => applyEndFromDurations()}
                  >
                    Preencher fim (soma {totalSlotDuration} min)
                  </Button>
                ) : null}
              </div>

              {services.length === 0 ? (
                <div className="text-xs text-amber-700/90">Nenhum serviço disponível</div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700">Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className={inputFieldClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700">Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className={inputFieldClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="inline-flex items-center gap-1.5 text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                      Fim
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className={inputFieldClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {scheduleHint ? (
              <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-snug text-slate-600">{scheduleHint}</p>
            ) : null}
            </FormSection>
            </div>
            </div>

            {freeSlots.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-200/60 bg-slate-50/40 p-4 sm:p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-800">
                      <Clock className="h-4 w-4" aria-hidden />
                    </span>
                    Horários livres neste dia
                  </div>
                  <span className="text-xs tabular-nums text-slate-500">{freeSlots.length} horários</span>
                </div>
                <p className="mb-3 text-xs leading-relaxed text-slate-500">
                  Toque em um horário: preenche o início; se a soma das durações dos serviços for conhecida, ajusta também o fim.
                </p>
                <div className="custom-scrollbar max-h-[10.5rem] overflow-y-auto rounded-xl border border-slate-200/70 bg-white p-2.5 sm:max-h-44">
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                    {freeSlots.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant={normalizeTimeValue(selectedStartTime) === slot ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 min-w-0 px-1.5 text-xs font-medium tabular-nums sm:h-8",
                          normalizeTimeValue(selectedStartTime) === slot &&
                            "btn-gradient border-0 text-white shadow-sm shadow-primary/20"
                        )}
                        onClick={() => {
                          form.setValue("startTime", slot, { shouldValidate: true, shouldDirty: true });
                          const ids = (form.getValues("serviceIds") as number[] | undefined) ?? [];
                          const total = totalDurationForServices(ids, services);
                          if (total > 0) {
                            form.setValue("endTime", addMinutesToTime(slot, total), {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }
                        }}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <FormSection title="Observações" icon={StickyNote}>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700">Detalhes opcionais</FormLabel>
                      <FormControl>
                        <Input {...field} className={inputFieldClass} placeholder="Observações para a equipe (opcional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
            </div>
            </div>

            <DialogFooter className="relative z-10 shrink-0 gap-2 border-t border-slate-200 bg-white px-5 py-4 shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.08)] sm:px-6">
              <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              {onCancelAppointment ? (
                <Button type="button" variant="destructive" className="rounded-xl" onClick={() => onCancelAppointment()}>
                  Cancelar agendamento
                </Button>
              ) : null}
              <Button type="submit" disabled={loading} className="btn-gradient rounded-xl px-6 font-semibold text-white shadow-md shadow-primary/20 disabled:opacity-60">
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
