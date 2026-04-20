import { api } from "@/app/api";

export type PlanCode = "trial" | "basic" | "medium" | "advanced";

export type CheckoutResponse = {
  url: string;
};

export type CompanyPlanStatus = {
  plan: {
    plan_code?: string;
    status?: string;
    current_period_end?: string | null;
  } | null;
};

export type UsageStats = {
  plan: PlanCode;
  limit: number;
  used: number;
  remaining: number;
  percentage: number;
  professionals?: {
    limit: number;
    used: number;
    remaining: number;
  };
};

export class BillingService {
  static async createCheckoutSession(plan: PlanCode, companyId: number): Promise<CheckoutResponse> {
    const { data } = await api.post("/billing/checkout", {
      plan,
      companyId,
    });
    return data?.data ?? data;
  }

  static async getStatus(): Promise<CompanyPlanStatus> {
    const { data } = await api.get("/billing/status");
    return data?.data ?? data;
  }

  static async getUsage(): Promise<UsageStats> {
    const { data } = await api.get("/billing/usage");
    return data?.data ?? data;
  }

  static async getInvoices(month?: string) {
    const params: Record<string, string> = {};
    if (month) params.month = month;
    const { data } = await api.get("/billing/invoices", { params });
    return data.data;
  }

  static async downloadInvoice(invoiceId: string) {
    const response = await api.get(`/billing/invoices/${invoiceId}/download`, { responseType: 'blob' });
    return response.data as Blob;
  }
}
