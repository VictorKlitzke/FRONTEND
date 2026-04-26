import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { ServiceService, type ServiceDTO } from "@/feature/service/services/service-service";
import { useEmpresaStore } from "@/feature/empresa/stores/empresa-store";
import { ClientService, type ClientDTO } from "@/feature/client/services/client-service";

export interface ServicePackageForm {
  client_id: number;
  service_id: number;
  quantidade_sessoes: number;
  frequencia: string;
  dia_semana?: string;
  horario: string;
  data_inicio: string;
  data_fim?: string;
}

interface Props {
  initialValues?: Partial<ServicePackageForm>;
  onSubmit: (data: ServicePackageForm) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

export const ServicePackageCreate = ({
  initialValues,
  onSubmit,
  loading,
  onCancel,
}: Props) => {
  const weekdayMap = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const resolveWeekdayFromDate = (dateInput: string): string => {
    const raw = String(dateInput || "").trim();
    if (!raw) return "segunda";
    const date = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "segunda";
    return weekdayMap[date.getDay()] ?? "segunda";
  };
  const normalizeTime = (timeInput: string): string => {
    const raw = String(timeInput || "").trim();
    if (!raw) return "16:00";
    return raw.length >= 5 ? raw.slice(0, 5) : raw;
  };

  const { company } = useEmpresaStore();

  const [clients, setClients] = useState<ClientDTO[]>([]);

  useEffect(() => {
    if (company?.id) {
      ClientService.getAll().then(setClients);
    }
  }, [company?.id]);

  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [form, setForm] = useState<ServicePackageForm>({
    client_id: initialValues?.client_id ?? 0,
    service_id: initialValues?.service_id ?? 0,
    quantidade_sessoes: initialValues?.quantidade_sessoes ?? 4,
    frequencia: initialValues?.frequencia ?? "semanal",
    dia_semana: initialValues?.dia_semana ?? resolveWeekdayFromDate(initialValues?.data_inicio ?? ""),
    horario: normalizeTime(initialValues?.horario ?? "16:00"),
    data_inicio: initialValues?.data_inicio ?? "",
    data_fim: initialValues?.data_fim ?? "",
  });

  useEffect(() => {
    if (company?.id) {
      ServiceService.getByCompany(company.id).then(setServices);
    }
  }, [company?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      // Dia da semana é derivado da data de início para evitar redundância no formulário.
      dia_semana: resolveWeekdayFromDate(form.data_inicio),
      horario: normalizeTime(form.horario),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="text-sm font-medium">Cliente</label>
          <select
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
            className="w-full border rounded-xl p-2 mt-1"
            required
          >
            <option value="">Selecione</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Serviço</label>
          <select
            name="service_id"
            value={form.service_id}
            onChange={handleChange}
            className="w-full border rounded-xl p-2 mt-1"
            required
          >
            <option value="">Selecione</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONFIG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="text-sm font-medium">Sessões</label>
          <input
            type="number"
            name="quantidade_sessoes"
            value={form.quantidade_sessoes}
            onChange={handleChange}
            className="w-full border rounded-xl p-2 mt-1"
            min={1}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Frequência</label>
          <select
            name="frequencia"
            value={form.frequencia}
            onChange={handleChange}
            className="w-full border rounded-xl p-2 mt-1"
          >
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
          </select>
        </div>

      </div>

      {/* DATAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div>
          <label className="text-sm font-medium">Horário</label>
          <input
            type="time"
            name="horario"
            value={form.horario}
            onChange={handleChange}
            className="w-full border rounded-xl p-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Data início</label>
          <input
            type="date"
            name="data_inicio"
            value={form.data_inicio}
            onChange={handleChange}
            className="w-full border rounded-xl p-2 mt-1"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Data fim</label>
          <input
            type="date"
            name="data_fim"
            value={form.data_fim}
            onChange={handleChange}
            className="w-full border rounded-xl p-2 mt-1"
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};