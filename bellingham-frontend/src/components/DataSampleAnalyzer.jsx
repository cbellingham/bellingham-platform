import React, { useCallback, useRef, useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import Button from './ui/Button';

const DataSampleAnalyzer = ({
  selectedFile,
  onSelectFile,
  onRemoveFile,
  onAnalyze,
  isAnalyzing,
  analysisError,
  report,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const triggerFileDialog = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        onSelectFile?.(file);
        onAnalyze?.(file);
      }
    },
    [onAnalyze, onSelectFile],
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragActive(false);

      const file = event.dataTransfer?.files?.[0];
      if (file) {
        onSelectFile?.(file);
        onAnalyze?.(file);
      }
    },
    [onAnalyze, onSelectFile],
  );

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  }, []);

  const dropzoneClasses = [
    'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors',
    'border-slate-700/80 bg-slate-900/60 text-slate-200 hover:border-[#00D1FF] hover:bg-slate-900/80',
    isDragActive ? 'border-[#00D1FF] bg-slate-900/70 shadow-[0_0_0_1px_rgba(0,209,255,0.35)]' : '',
  ].join(' ');

  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        onClick={triggerFileDialog}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            triggerFileDialog();
          }
        }}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={dropzoneClasses}
        aria-label="Upload a sample data file"
      >
        <FiUploadCloud className="h-10 w-10 text-[#00D1FF]" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-base font-semibold">Drag and drop your sample data</p>
          <p className="text-sm text-slate-400">
            Supported formats: CSV or JSON. We will analyse the structure and highlight key contract terms automatically.
          </p>
        </div>
        <Button type="button" variant="primary" className="mt-2" disabled={isAnalyzing}>
          Browse files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {selectedFile && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
          <div className="space-y-1">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-xs text-slate-400">
              {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'unknown format'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              isLoading={isAnalyzing}
              disabled={isAnalyzing}
              onClick={() => selectedFile && onAnalyze?.(selectedFile)}
            >
              Re-run analysis
            </Button>
            <Button type="button" variant="ghost" onClick={onRemoveFile} disabled={isAnalyzing}>
              Remove
            </Button>
          </div>
        </div>
      )}

      {analysisError && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {analysisError}
        </div>
      )}

      {report && (
        <div className="space-y-5 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6">
          <div>
            <h4 className="text-lg font-semibold text-slate-100">Automated data profile</h4>
            <p className="text-sm text-slate-400">{report.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {report.columns?.map((column) => (
              <div
                key={column.name}
                className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-200"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-100">{column.name || 'Column'}</p>
                  <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300">
                    {Math.round((column.fillRate ?? 0) * 100)}% filled
                  </span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#00D1FF]">{column.inferredType}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>
                    <dt className="font-semibold text-slate-300">Distinct</dt>
                    <dd>{column.distinctCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-300">Example</dt>
                    <dd className="truncate" title={column.exampleValue}>
                      {column.exampleValue || '–'}
                    </dd>
                  </div>
                  {column.numericMin !== null && (
                    <div>
                      <dt className="font-semibold text-slate-300">Min</dt>
                      <dd>{column.numericMin}</dd>
                    </div>
                  )}
                  {column.numericMax !== null && (
                    <div>
                      <dt className="font-semibold text-slate-300">Max</dt>
                      <dd>{column.numericMax}</dd>
                    </div>
                  )}
                  {column.numericAverage !== null && (
                    <div className="col-span-2">
                      <dt className="font-semibold text-slate-300">Average</dt>
                      <dd>{column.numericAverage.toFixed(2)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>

          {report.qualityAlerts?.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">Quality alerts</h5>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-200">
                {report.qualityAlerts.map((alert) => (
                  <li key={alert}>{alert}</li>
                ))}
              </ul>
            </div>
          )}

          {report.contractRecommendations?.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">Contract suggestions</h5>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-200">
                {report.contractRecommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          {report.sampleRows?.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Sample rows</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/60 text-slate-200">
                    <tr>
                      {Object.keys(report.sampleRows[0]).map((header) => (
                        <th key={header} className="px-3 py-2 font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.sampleRows.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`} className="odd:bg-slate-950/40">
                        {Object.entries(row).map(([header, value]) => (
                          <td key={`${header}-${rowIndex}`} className="px-3 py-2">
                            {value || '–'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataSampleAnalyzer;
