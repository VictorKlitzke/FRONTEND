import { BarChart3, Box, Calendar, Settings, User } from "lucide-react";

export const menuItens = [
  { label: "Agenda", icon: Calendar, path: "/dashboard", quick: true },
  { label: "Clientes", icon: User, path: "/clientes", quick: true },
  { label: "Profissionais", icon: User, path: "/profissionais" },
  { label: "Serviços", icon: Box, path: "/servicos", quick: true },
  { label: "Estoque", icon: Box, path: "/estoque" },
  { label: "Relatórios", icon: BarChart3, path: "/relatorios" },
  { label: "Configurações", icon: Settings, path: "/config" },
]