import { BarChart3, Box, Calendar, Settings, User, Shield } from "lucide-react";

export type MenuItem = {
  label: string;
  icon: typeof BarChart3;
  path: string;
  quick?: boolean;
  roles?: string[];
};

export const menuItens: MenuItem[] = [
  { label: "Relatórios", icon: BarChart3, path: "/dashboard" },
  { label: "Agenda", icon: Calendar, path: "/appointments", quick: true },
  { label: "Clientes", icon: User, path: "/clientes", quick: true },
  { label: "Casos", icon: Box, path: "/casos" },
  { label: "Profissionais", icon: User, path: "/profissionais" },
  { label: "Serviços", icon: Box, path: "/servicos", quick: true },
  { label: "Produtos", icon: Settings, path: "/produtos" },
  { label: "Estoque", icon: Box, path: "/estoque/movimentacoes" },
  { label: "Permissões", icon: Shield, path: "/permissoes" },
  { label: "Configurações", icon: Settings, path: "/config" },
];