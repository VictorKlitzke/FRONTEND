import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppointmentRequestService } from "../services/appointment-request-service";
import { PublicAvailabilityService, type PublicCompanyInfo, type PublicCompanyItem } from "../services/public-availability-service";
import CardService from "./components/public/card-service";
import CardProfissionals from "./components/public/card-profissionals";

export const PublicAppointmentRequestPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<PublicCompanyInfo | null>(null);
  const [companies, setCompanies] = useState<PublicCompanyItem[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availableSlotsByProfessional, setAvailableSlotsByProfessional] = useState<Record<string, string[]>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);
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

  const loadCompany = async (id: number) => {
    try {
      const info = await PublicAvailabilityService.getCompanyInfo(id);
      setCompanyInfo(info);
    } catch {
      setCompanyInfo(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("company");
    const sid = params.get("service");
    const pid = params.get("professional");
    if (cid) {
      onChange("companyId", cid);
      const id = Number(cid);
      if (id) loadCompany(id);
    }
    if (sid) {
      onChange("serviceId", sid);
    }
    if (pid) {
      onChange("professionalId", pid);
    }
  }, []);

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

  const loadSlots = async (id: number, date: string) => {
    setSlotsLoading(true);
    try {
      // If a professional is already selected, fetch only for that professional
      if (form.professionalId) {
        const pid = Number(form.professionalId);
        const slots = await PublicAvailabilityService.getAvailableSlots(id, date, pid);
        setAvailableSlots(slots);
        setAvailableSlotsByProfessional({});
        return;
      }

      // If company has professionals, fetch per professional
      if (companyInfo?.professionals && companyInfo.professionals.length > 0) {
        const map: Record<string, string[]> = {};
        for (const p of companyInfo.professionals) {
          try {
            const slots = await PublicAvailabilityService.getAvailableSlots(id, date, p.id);
            map[String(p.id)] = slots;
          } catch {
            map[String(p.id)] = [];
          }
        }
        setAvailableSlotsByProfessional(map);
        const union = Array.from(new Set(Object.values(map).flat()));
        setAvailableSlots(union);
        return;
      }

      // Fallback: fetch company-level slots
      const slots = await PublicAvailabilityService.getAvailableSlots(id, date);
      setAvailableSlots(slots);
      setAvailableSlotsByProfessional({});
    } catch {
      setAvailableSlots([]);
      setAvailableSlotsByProfessional({});
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await AppointmentRequestService.createPublic({
        companyId: Number(form.companyId),
        clientName: form.clientName,
        clientEmail: form.clientEmail || undefined,
        clientPhone: form.clientPhone || undefined,
        serviceId: form.serviceId ? Number(form.serviceId) : undefined,
        professionalId: form.professionalId ? Number(form.professionalId) : undefined,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        notes: form.notes || undefined,
      });
      setMessage("Solicitação enviada com sucesso.");
     
      setAvailableSlots([]);
      setCompanyInfo(null);
    } catch {
      setMessage("Não foi possível enviar sua solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Solicitar agendamento</CardTitle>
              <CardDescription>Preencha os dados e escolha um horário disponível</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {!form.companyId ? (
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <select
                      className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm"
                      value={form.companyId}
                      onChange={(e) => {
                        const value = e.target.value;
                        onChange("companyId", value);
                        const id = Number(value);
                        if (id) {
                          loadCompany(id);
                          if (form.preferredDate) {
                            loadSlots(id, form.preferredDate);
                          }
                        } else {
                          setCompanyInfo(null);
                          setAvailableSlots([]);
                        }
                      }}
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Empresa selecionada</Label>
                    <div className="p-2 rounded border bg-white">{companyInfo?.name ?? companies.find((c) => String(c.id) === form.companyId)?.name ?? form.companyId}</div>
                  </div>
                )}

                {companyInfo?.services && companyInfo.services.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Serviço</Label>
                    <CardService
                      services={companyInfo.services}
                      selectedId={form.serviceId}
                      onSelect={(id) => onChange("serviceId", id)}
                    />
                  </div>
                ) : null}

                {companyInfo?.professionals && companyInfo.professionals.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Profissional (opcional)</Label>
                    <CardProfissionals
                      professionals={companyInfo.professionals}
                      selectedId={form.professionalId}
                      onSelect={(id) => {
                        onChange("professionalId", id);
                        const cid = Number(form.companyId);
                        if (cid && form.preferredDate) loadSlots(cid, form.preferredDate);
                      }}
                    />
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={form.clientName} onChange={(e) => onChange("clientName", e.target.value)} placeholder="Seu nome" />
                  </div>

                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input required value={form.clientPhone} onChange={(e) => onChange("clientPhone", e.target.value)} placeholder="(11) 99999-9999" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        onChange("preferredDate", value);
                        const id = Number(form.companyId);
                        if (id && value) {
                          loadSlots(id, value);
                        } else {
                          setAvailableSlots([]);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <div>
                      {slotsLoading ? (
                        <div className="text-sm">Carregando horários...</div>
                      ) : (
                        <div>
                          {(!form.professionalId && Object.keys(availableSlotsByProfessional).length > 0) ? (
                            <div className="space-y-3">
                              {companyInfo?.professionals?.map((p) => {
                                const slots = availableSlotsByProfessional[String(p.id)] || [];
                                return (
                                  <div key={p.id} className="pb-2">
                                    <div className="text-sm font-medium mb-2">{p.name}</div>
                                    {slots.length === 0 ? (
                                      <div className="text-sm text-muted-foreground">Sem horários disponíveis</div>
                                    ) : (
                                      <div className="flex flex-wrap gap-2">
                                        {slots.map((slot) => {
                                          const selected = slot === form.preferredTime && String(p.id) === form.professionalId;
                                          return (
                                            <button
                                              key={slot}
                                              type="button"
                                              onClick={() => {
                                                onChange("professionalId", String(p.id));
                                                onChange("preferredTime", slot);
                                              }}
                                              className={`px-3 py-1.5 rounded-md text-sm border ${selected ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-700 border-slate-200"}`}>
                                              {slot}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            (availableSlots.length === 0) ? (
                              <div className="text-sm text-muted-foreground">Sem horários disponíveis para esta data.</div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {availableSlots.map((slot) => {
                                  const selected = slot === form.preferredTime;
                                  return (
                                    <button
                                      key={slot}
                                      type="button"
                                      onClick={() => onChange("preferredTime", slot)}
                                      className={`px-3 py-1.5 rounded-md text-sm border ${selected ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-700 border-slate-200"}`}>
                                      {slot}
                                    </button>
                                  );
                                })}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input value={form.notes} onChange={(e) => onChange("notes", e.target.value)} placeholder="Opcional" />
                </div>

                {message ? <div className="text-sm text-muted-foreground">{message}</div> : null}

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={loading || !isValid} className="flex-1">
                    {loading ? "Enviando..." : "Enviar solicitação"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Verifique os dados antes de enviar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Empresa</div>
                  <div className="font-medium">{companyInfo ? companyInfo.name : "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Data</div>
                  <div className="font-medium">{form.preferredDate || "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Horário</div>
                  <div className="font-medium">{form.preferredTime || "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Cliente</div>
                  <div className="font-medium">{form.clientName || "—"}</div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Total:</div>
                    <div className="text-lg font-semibold">R$ 0,00</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
