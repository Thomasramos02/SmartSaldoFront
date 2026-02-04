import api from "./api";

export interface ReportData {
  month: string;
  year: number;
  totalExpenses: number;
  averageExpense: number;
  budgetInfo: {
    monthlyBudget: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
  };
  categories: Array<{
    name: string;
    icon: string;
    color: string;
    totalSpent: number;
    percentage: number;
    expenses: any[];
  }>;
  topExpenses: Array<{
    description: string;
    amount: number;
    date: string;
    category: string;
  }>;
}

const reportService = {
  // Backend expects 0-indexed months (0 = Janeiro). Send as-is.
  getReportData: async (month: number, year: number): Promise<ReportData> => {
    const response = await api.get<ReportData>(`/reports/generate`, {
      params: { month, year },
    });
    return response.data;
  },

  // Returns ArrayBuffer for PDF download.
  downloadReportPdf: async (
    month: number,
    year: number,
  ): Promise<ArrayBuffer> => {
    try {
      const response = await api.get(`/reports/download`, {
        params: { month, year },
        responseType: "arraybuffer",
      });

      return response.data as ArrayBuffer;
    } catch (err: unknown) {
      const fallbackMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao gerar relatorio";
      const response = (err as { response?: any })?.response;

      if (!response) {
        throw new Error(fallbackMessage);
      }

      const status = response.status;
      const headers = response.headers;
      let text = "";

      try {
        if (response.data instanceof ArrayBuffer) {
          text = new TextDecoder().decode(response.data);
        } else if (typeof response.data === "string") {
          text = response.data;
        } else {
          text = JSON.stringify(response.data);
        }

        let parsedMessage = text;
        try {
          const parsed = JSON.parse(text);
          parsedMessage = parsed.message || parsed.error || JSON.stringify(parsed);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // non-JSON, keep text
        }

        console.error("reportService.downloadReportPdf error", {
          status,
          headers,
          parsedMessage,
        });
        throw new Error(`Status ${status}: ${parsedMessage}`);
      } catch (innerErr) {
        const message =
          innerErr instanceof Error ? innerErr.message : fallbackMessage;
        throw new Error(message);
      }
    }
  },
};

export default reportService;
