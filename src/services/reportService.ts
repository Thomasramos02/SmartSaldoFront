import api from "./api"; // Sua instância do Axios com o token configurado

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
  // Chamada para a rota que retorna o JSON (Visualização no Dashboard)
  getReportData: async (month: number, year: number): Promise<ReportData> => {
    // Backend expects 0-indexed months (0 = Janeiro). Send as-is.
    const response = await api.get<ReportData>(`/reports/generate`, {
      params: { month, year },
    });
    return response.data;
  },

  // Chamada para a rota que retorna o PDF (Binário)
  // Retorna o ArrayBuffer com o conteúdo do PDF para que o componente possa
  // criar o Blob e controlar o download (mais testável e previsível).
  downloadReportPdf: async (month: number, year: number): Promise<ArrayBuffer> => {
    try {
      const response = await api.get(`/reports/download`, {
        params: { month, year },
        responseType: "arraybuffer",
      });

      return response.data as ArrayBuffer;
    } catch (err: any) {
        // Tenta extrair uma mensagem amigável do corpo de erro (que pode vir como JSON)
        if (err.response) {
          const status = err.response.status;
          const headers = err.response.headers;
          let text = '';
          try {
            // response.data pode ser ArrayBuffer (quando axios tentou baixar)
            if (err.response.data instanceof ArrayBuffer) {
              text = new TextDecoder().decode(err.response.data);
            } else if (typeof err.response.data === 'string') {
              text = err.response.data;
            } else {
              text = JSON.stringify(err.response.data);
            }

            let parsedMessage = text;
            try {
              const parsed = JSON.parse(text);
              parsedMessage = parsed.message || parsed.error || JSON.stringify(parsed);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
              // não-JSON, keep text
            }

            console.error('reportService.downloadReportPdf error', { status, headers, parsedMessage });
            throw new Error(`Status ${status}: ${parsedMessage}`);
          } catch (err) {
            throw new Error(err.message || 'Erro desconhecido ao gerar relatório');
          }
        }

        throw new Error(err.message || 'Erro desconhecido ao gerar relatório');
    }
  },
};

export default reportService;