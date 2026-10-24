import React, { useRef } from 'react';
import { DailyClosing, FuelExpense, OtherExpense } from '../types';
import { X, Download, Upload, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';

interface StorageBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  closings: DailyClosing[];
  fuelExpenses: FuelExpense[];
  otherExpenses: OtherExpense[];
  onImportData: (data: { closings: DailyClosing[]; fuelExpenses: FuelExpense[]; otherExpenses: OtherExpense[] }) => void;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
}

export const StorageBackupModal: React.FC<StorageBackupModalProps> = ({
  isOpen,
  onClose,
  closings,
  fuelExpenses,
  otherExpenses,
  onImportData,
  onLoadSampleData,
  onClearAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const data = {
      app: 'DiariaETanque',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      closings,
      fuelExpenses,
      otherExpenses,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_diaria_tanque_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.closings) || Array.isArray(parsed.fuelExpenses)) {
          onImportData({
            closings: parsed.closings || [],
            fuelExpenses: parsed.fuelExpenses || [],
            otherExpenses: parsed.otherExpenses || [],
          });
          alert('Backup restaurado com sucesso!');
          onClose();
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              Dados & Armazenamento Local
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tudo fica 100% salvo no seu navegador / aparelho.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-2.5 text-xs text-neutral-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Seus registros estão seguros e salvos no seu aparelho. Você pode exportar uma cópia a qualquer momento.
            </span>
          </div>

          <div className="space-y-2">
            {/* Exportar */}
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-xl transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-neutral-700" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">Baixar Cópia de Segurança (Backup JSON)</div>
                  <div className="text-[11px] text-neutral-500">Salva todos os seus fechamentos e abastecimentos</div>
                </div>
              </div>
            </button>

            {/* Importar */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-xl transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-neutral-700" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">Restaurar Cópia de Segurança</div>
                  <div className="text-[11px] text-neutral-500">Carregar arquivo de backup salvo anteriormente</div>
                </div>
              </div>
            </button>

            {/* Carregar Exemplo */}
            <button
              onClick={() => {
                if (confirm('Carregar dados de exemplo realistas deste mês?')) {
                  onLoadSampleData();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-xl transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-amber-700" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">Carregar Dados de Exemplo (Demonstração)</div>
                  <div className="text-[11px] text-neutral-500">Preenche vários dias com corridas e gasolina para você testar</div>
                </div>
              </div>
            </button>

            {/* Limpar tudo */}
            <button
              onClick={() => {
                if (confirm('Atenção: Tem certeza que deseja apagar todos os registros do aplicativo?')) {
                  onClearAllData();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-between p-3.5 bg-rose-50/50 border border-rose-200 hover:bg-rose-50 rounded-xl transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <div>
                  <div className="text-xs font-bold text-rose-700">Limpar Todos os Registros</div>
                  <div className="text-[11px] text-rose-500">Zera o histórico para começar do zero</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
