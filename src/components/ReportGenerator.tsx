import { useState } from "react";
import { FileText, Loader2, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import reportService from "../services/reportService";

interface ReportGeneratorProps {
  isPremium: boolean;
  selectedMonth: number;
  selectedYear: number;
}

export function ReportGenerator({
  isPremium,
  selectedMonth,
  selectedYear,
}: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!isPremium) {
      toast.error("Recurso exclusivo para membros Premium! 🚀");
      return;
    }

    try {
      setIsGenerating(true);
      toast.info("Preparando seu relatório PDF...");

      // 1. Recebe os dados binários da service
      const data = await reportService.downloadReportPdf(
        selectedMonth,
        selectedYear,
      );

      // 2. Transforma os dados em um arquivo (Blob)
      const blob = new Blob([data], { type: "application/pdf" });

      // 3. Cria uma URL temporária para esse arquivo
      const url = window.URL.createObjectURL(blob);

      // 4. Cria um link "fantasma", clica nele e remove
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `relatorio_${selectedMonth + 1}_${selectedYear}.pdf`,
      );
      document.body.appendChild(link);
      link.click();

      // Limpeza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Relatório baixado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      const msg =
        error?.message || "Falha ao gerar o PDF. Verifique sua conexão.";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all
        ${
          isPremium
            ? "bg-white border border-stone-200 text-slate-700 hover:bg-stone-50 active:scale-95"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
      ) : isPremium ? (
        <FileText className="w-4 h-4 text-emerald-600" />
      ) : (
        <Download className="w-4 h-4 text-slate-400" />
      )}

      <span className="text-sm">
        {isGenerating ? "Gerando..." : "Exportar PDF"}
      </span>

      {!isPremium && <AlertCircle className="w-3 h-3 ml-1" />}
    </button>
  );
}
