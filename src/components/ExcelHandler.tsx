import { useState, useRef } from 'react';
import { useMetrics } from '@/contexts/MetricsContext';
import { MetricData } from '@/types/metrics';
import { Upload, Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { toast } from 'sonner';

interface ExcelHandlerProps {
  onImportComplete?: () => void;
}

const ExcelHandler = ({ onImportComplete }: ExcelHandlerProps) => {
  const { importData, exportData, metrics } = useMetrics();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const importedData: Record<string, MetricData[]> = {};
      
      workbook.eachSheet((worksheet) => {
        const sheetName = worksheet.name;
        const rows: { month: string; value: number }[] = [];
        
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // skip header
          const month = String(row.getCell(1).value ?? '');
          const value = Number(row.getCell(2).value) || 0;
          if (month) rows.push({ month, value });
        });
        
        const metric = metrics.find(
          m => m.id.toLowerCase() === sheetName.toLowerCase() ||
               m.shortName.toLowerCase() === sheetName.toLowerCase()
        );
        
        if (metric && rows.length > 0) {
          importedData[metric.id] = rows.map(row => ({
            month: row.month,
            value: row.value,
          }));
        }
      });
      
      if (Object.keys(importedData).length > 0) {
        importData(importedData);
        toast.success(`Імпортовано дані для ${Object.keys(importedData).length} показників`);
        onImportComplete?.();
      } else {
        toast.error('Не вдалося розпізнати дані. Переконайтеся, що назви листів відповідають показникам.');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Помилка імпорту файлу');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    const data = exportData();
    const workbook = new ExcelJS.Workbook();
    
    Object.entries(data).forEach(([metricId, metricData]) => {
      const metric = metrics.find(m => m.id === metricId);
      const name = metric?.shortName || metricId;
      if (metricData.length > 0) {
        const sheet = workbook.addWorksheet(name);
        sheet.columns = [
          { header: 'month', key: 'month', width: 15 },
          { header: 'value', key: 'value', width: 15 },
        ];
        metricData.forEach(row => sheet.addRow(row));
      }
    });
    
    const hasData = Object.values(data).some(d => d.length > 0);
    if (!hasData) {
      metrics.forEach(metric => {
        const sheet = workbook.addWorksheet(metric.shortName);
        sheet.columns = [
          { header: 'month', key: 'month', width: 15 },
          { header: 'value', key: 'value', width: 15 },
        ];
        sheet.addRow({ month: '2024-01', value: 0 });
        sheet.addRow({ month: '2024-02', value: 0 });
      });
      toast.info('Експортовано шаблон для заповнення');
    } else {
      toast.success('Дані експортовано');
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'perfomia-data.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImport}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
      >
        {isImporting ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        Імпорт Excel
      </button>
      
      <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
        <Download className="w-4 h-4" />
        Експорт
      </button>
    </div>
  );
};

export default ExcelHandler;
