import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const GoogleSheetsSyncBar: React.FC = () => {
  const { sheetState, syncGoogleSheet, currency } = useFinance();
  const [showConfig, setShowConfig] = useState(false);
  const [inputUrl, setInputUrl] = useState(sheetState.sheetUrl);

  const handleManualSync = () => {
    syncGoogleSheet(inputUrl);
  };

  return (
    <div className="bg-[#1a251e] border border-[#2d3e33] rounded-xl p-4 shadow-sm text-xs font-sans space-y-3">
      {/* Primary Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
              sheetState.isSyncing
                ? 'bg-[#7bd0ff]/15 border-[#7bd0ff]/30 text-[#7bd0ff]'
                : sheetState.error
                ? 'bg-[#ffb3af]/15 border-[#ffb3af]/30 text-[#ffb3af]'
                : 'bg-[#4edea3]/15 border-[#4edea3]/30 text-[#4edea3]'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#dde4dd] text-sm font-sans flex items-center gap-1.5">
                Fuente en Vivo: Google Sheets CSV
              </span>
              {sheetState.isSyncing ? (
                <span className="text-[10px] font-mono bg-[#7bd0ff]/20 text-[#7bd0ff] px-2 py-0.5 rounded-full border border-[#7bd0ff]/30 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Sincronizando...
                </span>
              ) : sheetState.error ? (
                <span className="text-[10px] font-mono bg-[#ffb3af]/20 text-[#ffb3af] px-2 py-0.5 rounded-full border border-[#ffb3af]/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Error de conexión
                </span>
              ) : (
                <span className="text-[10px] font-mono bg-[#4edea3]/20 text-[#4edea3] px-2 py-0.5 rounded-full border border-[#4edea3]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Sincronizado
                </span>
              )}
            </div>

            <p className="text-[#86948a] text-[11px] font-sans mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Filas parseadas: <strong className="text-[#dde4dd]">{sheetState.totalParsedRows}</strong>
              </span>
              <span>•</span>
              <span>
                Suma acumulada MONTO:{' '}
                <strong className="text-[#4edea3] font-mono">
                  {formatCurrency(sheetState.totalMontoSum, currency)}
                </strong>
              </span>
              {sheetState.lastSyncedAt && (
                <>
                  <span>•</span>
                  <span>Último refresco: {sheetState.lastSyncedAt}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => handleManualSync()}
            disabled={sheetState.isSyncing}
            className="bg-[#242c27] hover:bg-[#2f3632] border border-[#3c4a42] hover:border-[#4edea3] text-[#4edea3] px-3.5 py-1.5 rounded-lg text-xs font-semibold font-sans flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Refrescar datos del CSV de Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${sheetState.isSyncing ? 'animate-spin' : ''}`} />
            <span>Actualizar Datos</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="bg-[#0f172a] hover:bg-[#1a251e] border border-[#334155] text-[#86948a] hover:text-[#dde4dd] px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>URL</span>
            {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Error details if any */}
      {sheetState.error && (
        <div className="bg-[#ffb3af]/10 border border-[#ffb3af]/30 text-[#ffb3af] p-2.5 rounded-lg text-xs flex items-center justify-between gap-2">
          <span>{sheetState.error}</span>
          <button
            onClick={() => handleManualSync()}
            className="underline text-xs font-bold font-mono hover:text-white cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Expandable URL Configuration */}
      {showConfig && (
        <div className="pt-2 border-t border-[#2d3e33] space-y-2">
          <label className="block text-[11px] font-mono text-[#86948a]">
            Enlace CSV publicado de Google Sheets:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
              className="flex-1 bg-[#0f172a] border border-[#334155] focus:border-[#4edea3] rounded-lg px-3 py-1.5 text-xs text-[#dde4dd] font-mono outline-none"
            />
            <button
              onClick={() => handleManualSync()}
              disabled={sheetState.isSyncing}
              className="bg-[#4edea3] text-[#003824] px-3 py-1.5 rounded-lg text-xs font-bold font-sans hover:bg-[#3ebe8f] transition-all cursor-pointer whitespace-nowrap"
            >
              Guardar y Cargar
            </button>
            <a
              href={sheetState.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0f172a] border border-[#334155] text-[#86948a] hover:text-[#7bd0ff] px-2.5 py-1.5 rounded-lg flex items-center justify-center transition-colors"
              title="Abrir hoja CSV en navegador"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
