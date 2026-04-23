import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
export interface ServicePackageListItem {
  id: number;
  client_id: number;
  service_id: number;
  quantidade_sessoes: number;
  frequencia: string;
  dia_semana: string;
  horario: string;
  data_inicio: string;
}

interface Props {
  data: ServicePackageListItem[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (item: ServicePackageListItem) => void;
  onDelete: (id: number) => void;
}

export const ServicePackageList = ({
  data,
  loading,
  search,
  onSearchChange,
  onEdit,
  onDelete,
}: Props) => {
  const filtered = useMemo(() => {
    if (!search) return data;

    const s = search.toLowerCase();

    return data.filter((item) =>
      item.client_id.toString().includes(s) ||
      item.service_id.toString().includes(s) ||
      item.frequencia.toLowerCase().includes(s)
    );
  }, [data, search]);

  return (
    <div className="space-y-4">

      {/* SEARCH */}
      <div>
        <input
          type="text"
          placeholder="Buscar por cliente, serviço ou frequência..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border rounded-xl p-2"
        />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-sm text-gray-500">
          Carregando...
        </div>
      )}

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <div className="text-center text-sm text-gray-500">
          Nenhum pacote encontrado
        </div>
      )}

      {/* TABLE */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-xl overflow-hidden">

            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Serviço</th>
                <th className="p-3">Sessões</th>
                <th className="p-3">Frequência</th>
                <th className="p-3">Dia</th>
                <th className="p-3">Horário</th>
                <th className="p-3">Início</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">

                  <td className="p-3">#{item.client_id}</td>
                  <td className="p-3">#{item.service_id}</td>
                  <td className="p-3">{item.quantidade_sessoes}</td>
                  <td className="p-3 capitalize">{item.frequencia}</td>
                  <td className="p-3 capitalize">{item.dia_semana}</td>
                  <td className="p-3">{item.horario}</td>
                  <td className="p-3">{item.data_inicio}</td>

                  <td className="p-3 text-right space-x-2">

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil size={14} />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 size={14} />
                    </Button>

                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};