import { create } from "zustand";

type AlertType = "default" | "destructive" | "success" | "warning";

type AlertState = {
  open: boolean;
  title?: string;
  message?: string;
  type: AlertType;

  showAlert: (data: {
    title: string;
    message: string;
    type?: AlertType;
  }) => void;

  closeAlert: () => void;
};

export const useAlert = create<AlertState>((set) => ({
  open: false,
  title: "",
  message: "",
  type: "default",

  showAlert: ({ title, message, type = "default" }) =>
    set({ open: true, title, message, type }),
  closeAlert: () =>
    set({ open: false, title: "", message: "", type: "default" }),
}));
