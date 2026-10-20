import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  FileText,
  Check,
  CheckSquare,
  Square,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertCircle,
  Loader2,
  Layers,
  ArrowRight,
  Compass,
  Plus,
  Trash2,
  FileCheck2,
} from 'lucide-react';
import { BOQSection, TakeoffLine } from '../types/boq';
import { ExtractedMeasurementItem, ExtractionResponse } from '../types/aiCad';
import { SAMPLE_CAD_DRAWINGS } from '../data/sampleCadDrawings';
import { formatNumber, calculateBarUnitWeight } from '../utils/formatters';

interface UploadedDrawingFile {
  id: string;
  name: string;
  type: 'image' | 'dxf';
  dataUri?: string;
  textContent?: string;
  rawBase64?: string;
  mimeType?: string;
  sizeFormatted: string;
}

interface AiCadMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: BOQSection[];
  onApplyMeasurements: (
    itemsToApply: {
      boqItemId: string;
      takeoffLine: TakeoffLine;
      quantity: number;
    }[]
  ) => void;
  currency: string;
}

export const AiCadMeasurementModal: React.FC<AiCadMeasurementModalProps> = ({
  isOpen,
  onClose,
  sections,
  onApplyMeasurements,
  currency: _currency,
}) => {
  const [activeTab, setActiveTab] = useState<'samples' | 'upload'>('samples');
  // Multiple selected samples:
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([
    SAMPLE_CAD_DRAWINGS[0].id,
    SAMPLE_CAD_DRAWINGS[1].id,
  ]);
  // Multiple uploaded files:
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDrawingFile[]>([]);

  const [focusNote, setFocusNote] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [extractionResult, setExtractionResult] = useState<ExtractionResponse | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  const [itemBoqMappings, setItemBoqMappings] = useState<Record<number, string>>({});

  // Active sheet index shown in the preview pane
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Flatten available non-note BOQ items for the dropdown selector
  const availableBoqItems: { id: string; code: string; label: string; unit: string; secTitle: string }[] = [];
  sections.forEach((sec) => {
    sec.groups.forEach((grp) => {
      grp.items.forEach((it) => {
        if (!it.isNote && it.itemNo) {
          availableBoqItems.push({
            id: it.id,
            code: it.itemNo,
            label: `${it.itemNo}: ${it.description.slice(0, 60)}... (${it.unit})`,
            unit: it.unit,
            secTitle: sec.title,
          });
        }
      });
    });
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFilesSelected = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMsg(null);

    const newFiles: Promise<UploadedDrawingFile>[] = Array.from(filesList).map((file) => {
      const fileName = file.name;
      const isDxf = fileName.toLowerCase().endsWith('.dxf');
      const sizeStr = formatFileSize(file.size);

      return new Promise((resolve) => {
        if (isDxf) {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: fileName,
              type: 'dxf',
              textContent: e.target?.result as string,
              sizeFormatted: sizeStr,
            });
          };
          reader.readAsText(file);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUri = e.target?.result as string;
            const rawBase64 = dataUri.split(',')[1];
            resolve({
              id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: fileName,
              type: 'image',
              dataUri,
              rawBase64,
              mimeType: file.type || 'image/png',
              sizeFormatted: sizeStr,
            });
          };
          reader.readAsDataURL(file);
        }
      });
    });

    Promise.all(newFiles).then((loaded) => {
      setUploadedFiles((prev) => [...prev, ...loaded]);
      setActiveTab('upload');
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleToggleSample = (sampleId: string) => {
    setSelectedSampleIds((prev) =>
      prev.includes(sampleId)
        ? prev.filter((id) => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const handleStartAnalysis = async () => {
    setErrorMsg(null);
    setIsAnalyzing(true);
    setAnalysisStep('Packaging drawing sheets...');

    try {
      const filesPayload: {
        name: string;
        imageBase64?: string;
        mimeType?: string;
        cadText?: string;
      }[] = [];

      if (activeTab === 'samples') {
        if (selectedSampleIds.length === 0) {
          throw new Error('Please select at least one sample drawing.');
        }
        selectedSampleIds.forEach((id) => {
          const sample = SAMPLE_CAD_DRAWINGS.find((s) => s.id === id);
          if (sample) {
            filesPayload.push({
              name: sample.title,
              imageBase64: sample.svgDataUri.split(',')[1],
              mimeType: 'image/svg+xml',
            });
          }
        });
      } else {
        if (uploadedFiles.length === 0) {
          throw new Error('Please upload at least one drawing image or CAD file.');
        }
        uploadedFiles.forEach((file) => {
          if (file.type === 'image') {
            filesPayload.push({
              name: file.name,
              imageBase64: file.rawBase64,
              mimeType: file.mimeType || 'image/png',
            });
          } else {
            filesPayload.push({
              name: file.name,
              cadText: file.textContent,
            });
          }
        });
      }

      setAnalysisStep(
        `Gemini 3.8 Flash analyzing ${filesPayload.length} drawing sheet(s) simultaneously...`
      );

      const response = await fetch('/api/ai/extract-measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: filesPayload,
          userNotes: focusNote,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      setAnalysisStep('Extracting quantities and mapping to Bill of Quantities...');
      const data: ExtractionResponse = await response.json();

      if (!data.extractedItems || data.extractedItems.length === 0) {
        throw new Error('No measurable items could be extracted from these drawings. Try clearer blueprints or specify element focus.');
      }

      // Initialize selection and mapping defaults
      const initialSelection: Record<number, boolean> = {};
      const initialMappings: Record<number, string> = {};

      data.extractedItems.forEach((item, idx) => {
        initialSelection[idx] = true;

        // Match suggestedBoqCode
        const match = availableBoqItems.find(
          (b) =>
            b.code.toLowerCase() === (item.suggestedBoqCode || '').toLowerCase() ||
            b.code.toLowerCase().replace(/[^a-z0-9]/g, '') ===
              (item.suggestedBoqCode || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        );

        if (match) {
          initialMappings[idx] = match.id;
        } else {
          const fallback = availableBoqItems.find(
            (b) => b.unit.toLowerCase() === item.unit.toLowerCase()
          );
          initialMappings[idx] = fallback ? fallback.id : availableBoqItems[0]?.id || '';
        }
      });

      setExtractionResult(data);
      setSelectedItems(initialSelection);
      setItemBoqMappings(initialMappings);
      setActivePreviewIndex(0);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to extract measurements from drawing(s).');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleApplyToBoq = () => {
    if (!extractionResult) return;

    const payload: {
      boqItemId: string;
      takeoffLine: TakeoffLine;
      quantity: number;
    }[] = [];

    extractionResult.extractedItems.forEach((item, idx) => {
      if (!selectedItems[idx]) return;
      const targetBoqId = itemBoqMappings[idx];
      if (!targetBoqId) return;

      const isRebar = item.unit.toLowerCase() === 'kg' || !!item.barDiameterMm;
      const sourceTag = item.sourceDrawing ? `[${item.sourceDrawing}] ` : '';

      let takeoffLine: TakeoffLine;
      if (isRebar && item.barDiameterMm) {
        const dia = item.barDiameterMm;
        const unitWeight = calculateBarUnitWeight(dia);
        const len = item.barLengthM || item.length || 1;
        const count = item.barCountPerMember || 1;
        const members = item.memberCount || item.count || 1;
        const resultWeight = len * count * members * unitWeight;

        takeoffLine = {
          id: `ai-to-${Date.now()}-${idx}`,
          note: `${sourceTag}${item.elementTag}: ${item.notes || item.description}`,
          dims: [],
          barLen: len,
          barCount: count,
          memberCount: members,
          kgPerM: unitWeight,
          result: Math.round(resultWeight * 100) / 100,
        };
      } else {
        const count = item.count || 1;
        const l = item.length || 1;
        const w = item.width || 1;
        const h = item.height || 1;

        let dims: number[];
        if (item.unit.toLowerCase() === 'm³' || item.unit.toLowerCase() === 'm3') {
          dims = [count, l, w, h];
        } else if (item.unit.toLowerCase() === 'm²' || item.unit.toLowerCase() === 'm2') {
          dims = [count, l, w];
        } else if (item.unit.toLowerCase() === 'ml') {
          dims = [count, l];
        } else {
          dims = [count];
        }

        takeoffLine = {
          id: `ai-to-${Date.now()}-${idx}`,
          note: `${sourceTag}${item.elementTag}: ${item.notes || item.description}`,
          dims,
          result: Math.round(item.calculatedQuantity * 100) / 100,
        };
      }

      payload.push({
        boqItemId: targetBoqId,
        takeoffLine,
        quantity: Math.round(item.calculatedQuantity * 100) / 100,
      });
    });

    onApplyMeasurements(payload);
    onClose();
  };

  // Preview sheets list for results viewer
  const previewSheets =
    activeTab === 'samples'
      ? SAMPLE_CAD_DRAWINGS.filter((s) => selectedSampleIds.includes(s.id)).map((s) => ({
          title: s.title,
          uri: s.svgDataUri,
          type: 'image' as const,
        }))
      : uploadedFiles.map((f) => ({
          title: f.name,
          uri: f.dataUri,
          type: f.type,
        }));

  const activeSheet = previewSheets[activePreviewIndex] || previewSheets[0];
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-[#B9C7D3] max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-[#D7E1EA] flex items-center justify-between bg-[#0F2C4C] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#E3A008] text-[#0F2C4C] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight m-0 flex items-center gap-2">
                <span>Multi-Drawing &amp; CAD Measurement Take-Off</span>
                <span className="text-[10.5px] uppercase font-bold tracking-wider bg-[#E3A008] text-[#0F2C4C] px-2 py-0.5 rounded">
                  Gemini 3.8 Multi-Image
                </span>
              </h2>
              <p className="text-xs text-[#A9BCCD] m-0 hidden sm:block">
                Upload multiple drawings, floor plans, foundation sheets, and rebar details at once. Gemini cross-references all sheets to extract comprehensive take-off measurements.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {!extractionResult ? (
            /* Setup & Multi-File Upload View */
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-[#D7E1EA] gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('samples')}
                  className={`pb-2.5 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'samples'
                      ? 'border-[#0F2C4C] text-[#0F2C4C]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#E3A008]" />
                  <span>Sample CAD Blueprints ({selectedSampleIds.length} selected)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`pb-2.5 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'border-[#0F2C4C] text-[#0F2C4C]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Multiple Drawings ({uploadedFiles.length})</span>
                </button>
              </div>

              {activeTab === 'samples' ? (
                /* Sample Blueprints Selection (Multi-select) */
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Select one or both architectural/structural blueprint sheets:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSampleIds(
                          selectedSampleIds.length === SAMPLE_CAD_DRAWINGS.length
                            ? []
                            : SAMPLE_CAD_DRAWINGS.map((s) => s.id)
                        )
                      }
                      className="text-[#0F2C4C] font-semibold hover:underline"
                    >
                      {selectedSampleIds.length === SAMPLE_CAD_DRAWINGS.length
                        ? 'Deselect All'
                        : 'Select All Sheets'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SAMPLE_CAD_DRAWINGS.map((sample) => {
                      const isSelected = selectedSampleIds.includes(sample.id);
                      return (
                        <div
                          key={sample.id}
                          onClick={() => handleToggleSample(sample.id)}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#0F2C4C] bg-[#FFFBF0] shadow-sm'
                              : 'border-[#D7E1EA] bg-white hover:border-slate-400 opacity-75'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // handled by parent onClick
                                  className="accent-[#0F2C4C] w-4 h-4 cursor-pointer"
                                />
                                <span className="font-bold text-sm text-[#0F2C4C]">
                                  {sample.title}
                                </span>
                              </div>
                              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {sample.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                              {sample.description}
                            </p>
                          </div>

                          {/* Thumbnail */}
                          <div className="relative rounded overflow-hidden border border-[#D7E1EA] bg-[#0A2038] h-36 flex items-center justify-center">
                            <img
                              src={sample.svgDataUri}
                              alt={sample.title}
                              className="w-full h-full object-contain"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-[#0F2C4C] text-[#E3A008] text-[10.5px] font-bold px-2 py-0.5 rounded border border-[#E3A008] flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Sheet Included</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Multi-File Upload Tab */
                <div className="space-y-4">
                  {/* Drag-and-drop Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFilesSelected(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-[#B9C7D3] hover:border-[#0F2C4C] rounded-xl p-7 text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] cursor-pointer transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.dxf"
                      className="hidden"
                      onChange={(e) => handleFilesSelected(e.target.files)}
                    />
                    <Upload className="w-9 h-9 text-[#0F2C4C] mx-auto mb-2.5" />
                    <h4 className="text-sm font-bold text-[#0F2C4C] m-0 mb-1">
                      Click to browse or drop multiple drawings / images
                    </h4>
                    <p className="text-xs text-slate-500 m-0 max-w-lg mx-auto">
                      Select multiple files simultaneously. Upload foundation plans, floor layouts, section drawings, structural details, and rebar schedules (PNG, JPG, SVG, WEBP, or .DXF).
                    </p>
                  </div>

                  {/* Uploaded Files Gallery */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>{uploadedFiles.length} Drawing Sheet(s) Attached:</span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[#0F2C4C] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add more drawings</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {uploadedFiles.map((f, fIdx) => (
                          <div
                            key={f.id}
                            className="bg-white border border-[#B9C7D3] rounded-lg p-2.5 flex items-center gap-3 relative group shadow-2xs"
                          >
                            {/* Mini Thumbnail */}
                            <div className="w-12 h-12 rounded bg-[#0A2038] overflow-hidden shrink-0 flex items-center justify-center border border-slate-300">
                              {f.dataUri ? (
                                <img
                                  src={f.dataUri}
                                  alt={f.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileText className="w-6 h-6 text-slate-300" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-6">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                                Sheet {fIdx + 1}
                              </span>
                              <b className="text-xs text-[#0F2C4C] truncate block" title={f.name}>
                                {f.name}
                              </b>
                              <span className="text-[10.5px] text-slate-500">
                                {f.type === 'dxf' ? 'CAD DXF' : 'Image'} · {f.sizeFormatted}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(f.id);
                              }}
                              className="absolute top-2 right-2 text-slate-400 hover:text-red-600 p-1 rounded"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Optional Prompt / Focus Field */}
              <div className="bg-[#FAFBFD] border border-[#D7E1EA] rounded-lg p-3.5 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4C5C6E]">
                  Optional: Focus Elements or Measurement Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extract footings from foundation sheet and match walls from floor plan sheet"
                  value={focusNote}
                  onChange={(e) => setFocusNote(e.target.value)}
                  className="w-full bg-white border border-[#B9C7D3] focus:border-[#E3A008] rounded px-3 py-1.5 text-xs text-[#0F1B24] outline-none"
                />
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={
                    isAnalyzing ||
                    (activeTab === 'upload' && uploadedFiles.length === 0) ||
                    (activeTab === 'samples' && selectedSampleIds.length === 0)
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F2C4C] hover:bg-[#173A5E] text-white rounded-lg text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E3A008]" />
                      <span>{analysisStep || 'Analyzing Drawings...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#E3A008]" />
                      <span>
                        Analyze{' '}
                        {activeTab === 'samples'
                          ? `${selectedSampleIds.length} Sample Sheet(s)`
                          : `${uploadedFiles.length} Uploaded Drawing(s)`}{' '}
                        with Gemini AI
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results & Multi-Sheet Review View */
            <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 items-start">
              {/* Left Column: Multi-Sheet Drawing Viewer */}
              <div className="bg-[#0A2038] border border-[#B9C7D3] rounded-lg p-3 text-white flex flex-col space-y-2 sticky top-0">
                <div className="flex items-center justify-between pb-2 border-b border-[#203A58]">
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-white truncate block">
                      {extractionResult.drawingTitle}
                    </span>
                    <span className="text-[11px] text-[#A9BCCD]">
                      Scale: {extractionResult.detectedScale || 'Annotated'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                      className="p-1 hover:bg-[#173A5E] rounded text-slate-300"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                      className="p-1 hover:bg-[#173A5E] rounded text-slate-300"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="p-1 hover:bg-[#173A5E] rounded text-slate-300"
                      title="Reset Zoom"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Multiple Sheets Tab Navigator */}
                {previewSheets.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-[#203A58]">
                    {previewSheets.map((sheet, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setActivePreviewIndex(sIdx)}
                        className={`px-2.5 py-1 text-[11px] rounded whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                          activePreviewIndex === sIdx
                            ? 'bg-[#E3A008] text-[#0A2038] font-bold'
                            : 'bg-[#122B45] text-slate-300 hover:bg-[#1B3B5C]'
                        }`}
                      >
                        <FileCheck2 className="w-3 h-3" />
                        <span>Sheet {sIdx + 1}: {sheet.title.slice(0, 18)}...</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Drawing Image / Canvas */}
                <div className="w-full h-[400px] overflow-auto rounded bg-[#071728] flex items-center justify-center p-2 relative">
                  {activeSheet?.uri ? (
                    <img
                      src={activeSheet.uri}
                      alt={activeSheet.title}
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                      className="max-w-none transition-transform duration-150"
                    />
                  ) : (
                    <div className="text-center p-4 text-xs text-slate-400">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                      <span>{activeSheet?.title} (CAD DXF geometric entities extracted)</span>
                    </div>
                  )}
                </div>

                {extractionResult.generalNotes && (
                  <p className="text-[11px] text-[#A9BCCD] leading-relaxed pt-1 border-t border-[#203A58] m-0">
                    <b className="text-[#E3A008]">Notes:</b> {extractionResult.generalNotes}
                  </p>
                )}
              </div>

              {/* Right Column: Extracted Measurements Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#D7E1EA]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#0F2C4C]" />
                    <h3 className="m-0 text-sm font-bold text-[#0F2C4C]">
                      Extracted Take-Off Measurements ({extractionResult.extractedItems.length} items from {previewSheets.length} sheet{previewSheets.length > 1 ? 's' : ''})
                    </h3>
                  </div>

                  {/* Bulk selection */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = selectedCount === extractionResult.extractedItems.length;
                        const next: Record<number, boolean> = {};
                        extractionResult.extractedItems.forEach((_, i) => {
                          next[i] = !allSelected;
                        });
                        setSelectedItems(next);
                      }}
                      className="text-[#0F2C4C] hover:underline font-semibold cursor-pointer"
                    >
                      {selectedCount === extractionResult.extractedItems.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 font-medium">
                      {selectedCount} selected
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {extractionResult.extractedItems.map((item, idx) => {
                    const isSelected = !!selectedItems[idx];
                    const isRebar = item.unit.toLowerCase() === 'kg' || !!item.barDiameterMm;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-white border-[#0F2C4C] shadow-2xs'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => ({ ...prev, [idx]: !prev[idx] }))
                            }
                            className="mt-0.5 text-[#0F2C4C] cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#0F2C4C]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            {/* Header row */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-[#0F2C4C] bg-[#EEF2F5] px-2 py-0.5 rounded border border-[#D7E1EA]">
                                  {item.elementTag}
                                </span>
                                {item.sourceDrawing && (
                                  <span
                                    className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 cursor-pointer hover:bg-blue-100"
                                    onClick={() => {
                                      // If sourceDrawing matches one of our preview sheets, jump to it
                                      const foundIdx = previewSheets.findIndex((s) =>
                                        s.title.toLowerCase().includes((item.sourceDrawing || '').toLowerCase()) ||
                                        (item.sourceDrawing || '').toLowerCase().includes(s.title.toLowerCase())
                                      );
                                      if (foundIdx >= 0) setActivePreviewIndex(foundIdx);
                                    }}
                                    title="Click to view this sheet in preview"
                                  >
                                    {item.sourceDrawing}
                                  </span>
                                )}
                                <span className="text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {item.confidence || 'verified'}
                                </span>
                              </div>

                              <div className="font-mono-num text-xs font-bold text-[#0F2C4C]">
                                {formatNumber(item.calculatedQuantity)} {item.unit}
                              </div>
                            </div>

                            {/* Description and dimension formula */}
                            <p className="text-xs text-[#1F2937] m-0 font-medium">
                              {item.description}
                            </p>

                            {/* Dimension breakdown */}
                            <div className="bg-[#FAFBFD] border border-[#E5E7EB] rounded px-2.5 py-1 text-[11px] text-slate-600 font-mono-num flex flex-wrap gap-x-3 gap-y-1">
                              {isRebar ? (
                                <>
                                  <span>Ø{item.barDiameterMm || 16}mm</span>
                                  <span>L = {item.barLengthM || item.length}m</span>
                                  <span>{item.barCountPerMember || 1} bars/member</span>
                                  <span>{item.memberCount || item.count || 1} members</span>
                                  <span>
                                    Unit Wt ={' '}
                                    {calculateBarUnitWeight(item.barDiameterMm || 16).toFixed(3)} kg/m
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span>Count: {item.count || 1}</span>
                                  {item.length !== undefined && <span>L: {item.length}m</span>}
                                  {item.width !== undefined && <span>W: {item.width}m</span>}
                                  {item.height !== undefined && <span>H: {item.height}m</span>}
                                </>
                              )}
                            </div>

                            {item.notes && (
                              <p className="text-[11px] text-slate-500 italic m-0">
                                Location/Note: {item.notes}
                              </p>
                            )}

                            {/* Map to Target BOQ Item */}
                            <div className="pt-1.5 flex items-center gap-2 text-xs">
                              <span className="text-slate-500 text-[11px] shrink-0 font-semibold uppercase">
                                Map to BOQ:
                              </span>
                              <select
                                value={itemBoqMappings[idx] || ''}
                                onChange={(e) =>
                                  setItemBoqMappings((prev) => ({
                                    ...prev,
                                    [idx]: e.target.value,
                                  }))
                                }
                                className="w-full bg-white border border-[#B9C7D3] rounded px-2 py-1 text-xs text-[#0F1B24] outline-none focus:border-[#E3A008]"
                              >
                                {availableBoqItems.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    [{b.secTitle.slice(0, 16)}] {b.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Action Footer */}
                <div className="p-3 bg-[#F8FAFC] border border-[#D7E1EA] rounded-lg flex flex-wrap items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setExtractionResult(null)}
                    className="text-xs text-slate-600 hover:text-[#0F2C4C] underline cursor-pointer"
                  >
                    ← Choose or upload other drawings
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 border border-[#B9C7D3] rounded text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyToBoq}
                      disabled={selectedCount === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2C4C] hover:bg-[#173A5E] text-white rounded text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                    >
                      <Check className="w-4 h-4 text-[#E3A008]" />
                      <span>Apply {selectedCount} Measurements to BOQ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
