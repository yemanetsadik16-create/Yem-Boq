import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BOQSection,
  AncillaryItem,
  ProjectInfo,
  MarkupSettings,
  CalculatedCostSummary,
  BOQItem,
  TakeoffLine,
} from './types/boq';
import {
  createInitialBoq,
  INITIAL_PROJECT_INFO,
  INITIAL_MARKUP,
  INITIAL_ANCILLARY,
} from './data/defaultBoq';
import { exportBOQToExcel } from './utils/excelExport';
import { exportBOQToPDF } from './utils/pdfExport';
import { TopBar } from './components/TopBar';
import { TitleBlock } from './components/TitleBlock';
import { GroupCard } from './components/GroupCard';
import { AncillarySection } from './components/AncillarySection';
import { CostSummaryCard } from './components/CostSummaryCard';
import { SectionNav } from './components/SectionNav';
import { CostBreakdownModal } from './components/CostBreakdownModal';
import { ProjectPresetsModal } from './components/ProjectPresetsModal';
import { ConfirmDialogModal } from './components/ConfirmDialogModal';
import { AiCadMeasurementModal } from './components/AiCadMeasurementModal';
import { formatNumber, getTakeoffTypeForUnit } from './utils/formatters';
import { Info, HelpCircle, Compass, CheckCircle2, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'boq_universal_estimator_v1';

export default function App() {
  // Load saved state or default sample
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectInfo) return parsed.projectInfo;
      }
    } catch {
      // ignore
    }
    return INITIAL_PROJECT_INFO;
  });

  const [sections, setSections] = useState<BOQSection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sections && Array.isArray(parsed.sections)) return parsed.sections;
      }
    } catch {
      // ignore
    }
    return createInitialBoq();
  });

  const [ancillary, setAncillary] = useState<AncillaryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ancillary && Array.isArray(parsed.ancillary)) return parsed.ancillary;
      }
    } catch {
      // ignore
    }
    return INITIAL_ANCILLARY;
  });

  const [markup, setMarkup] = useState<MarkupSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.markup) return parsed.markup;
      }
    } catch {
      // ignore
    }
    return INITIAL_MARKUP;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isAiCadOpen, setIsAiCadOpen] = useState(false);
  const [isConfirmBlankOpen, setIsConfirmBlankOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          projectInfo,
          sections,
          ancillary,
          markup,
        })
      );
    } catch {
      // storage unavailable or full
    }
  }, [projectInfo, sections, ancillary, markup]);

  // Recalculate summary metrics
  const summary: CalculatedCostSummary = useMemo(() => {
    const sectionTotals: Record<string, number> = {};
    let subTotal = 0;

    sections.forEach((sec) => {
      let secTotal = 0;
      sec.groups.forEach((grp) => {
        grp.items.forEach((item) => {
          if (!item.isNote && item.amount) {
            secTotal += item.amount;
          }
        });
      });
      sectionTotals[sec.id] = secTotal;
      subTotal += secTotal;
    });

    const ancillaryTotal = ancillary.reduce((acc, curr) => {
      const v = typeof curr.amount === 'number' ? curr.amount : 0;
      return acc + v;
    }, 0);

    subTotal += ancillaryTotal;

    const profitAmount = subTotal * ((markup.profitPct || 0) / 100);
    const overheadAmount = subTotal * ((markup.overheadPct || 0) / 100);
    const totalBeforeVat = subTotal + profitAmount + overheadAmount;
    const vatAmount = totalBeforeVat * ((markup.vatPct || 0) / 100);
    const grandTotal = totalBeforeVat + vatAmount;

    return {
      sectionTotals,
      ancillaryTotal,
      subTotal,
      profitAmount,
      overheadAmount,
      totalBeforeVat,
      vatAmount,
      grandTotal,
    };
  }, [sections, ancillary, markup]);

  // Section titles map
  const sectionTitles = useMemo(() => {
    const map: Record<string, string> = {};
    sections.forEach((s) => {
      map[s.id] = s.title;
    });
    return map;
  }, [sections]);

  // Handlers for items
  const handleUpdateItem = useCallback(
    (secId: string, groupId: string, itemId: string, updated: Partial<BOQItem>) => {
      setSections((prev) =>
        prev.map((sec) => {
          if (sec.id !== secId) return sec;
          return {
            ...sec,
            groups: sec.groups.map((grp) => {
              if (grp.id !== groupId) return grp;
              return {
                ...grp,
                items: grp.items.map((it) => (it.id === itemId ? { ...it, ...updated } : it)),
              };
            }),
          };
        })
      );
    },
    []
  );

  const handleToggleGroup = useCallback((secId: string, groupId: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          groups: sec.groups.map((grp) =>
            grp.id === groupId ? { ...grp, isOpen: !grp.isOpen } : grp
          ),
        };
      })
    );
  }, []);

  const handleAddCustomItem = useCallback((secId: string, groupId: string) => {
    const newItem: BOQItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isNote: false,
      itemNo: '+',
      description: '',
      unit: 'pcs',
      quantity: '',
      unitRate: '',
      amount: 0,
      isCustom: true,
      takeoffType: 'dims',
      takeoffLines: [],
      isTakeoffOpen: false,
    };

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          groups: sec.groups.map((grp) => {
            if (grp.id !== groupId) return grp;
            return {
              ...grp,
              isOpen: true,
              items: [...grp.items, newItem],
            };
          }),
        };
      })
    );
  }, []);

  const handleDeleteCustomItem = useCallback(
    (secId: string, groupId: string, itemId: string) => {
      setSections((prev) =>
        prev.map((sec) => {
          if (sec.id !== secId) return sec;
          return {
            ...sec,
            groups: sec.groups.map((grp) => {
              if (grp.id !== groupId) return grp;
              return {
                ...grp,
                items: grp.items.filter((it) => it.id !== itemId),
              };
            }),
          };
        })
      );
    },
    []
  );

  const handleExpandAll = useCallback(() => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        groups: sec.groups.map((g) => ({ ...g, isOpen: true })),
      }))
    );
  }, []);

  const handleCollapseAll = useCallback(() => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        groups: sec.groups.map((g) => ({ ...g, isOpen: false })),
      }))
    );
  }, []);

  // Ancillary handlers
  const handleUpdateAncillary = (id: string, updated: Partial<AncillaryItem>) => {
    setAncillary((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  };

  const handleAddAncillary = () => {
    const newItem: AncillaryItem = {
      id: `anc-${Date.now()}`,
      description: '',
      amount: '',
    };
    setAncillary((prev) => [...prev, newItem]);
  };

  const handleDeleteAncillary = (id: string) => {
    setAncillary((prev) => prev.filter((item) => item.id !== id));
  };

  // Load Blank Template - resets all quantities, rates, take-offs, and custom items
  const handleLoadBlank = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    const freshBoq = createInitialBoq();
    const freshAncillary: AncillaryItem[] = [
      {
        id: 'anc-1',
        description: 'Septic tank & manhole (complete, per site take-off)',
        amount: '',
      },
    ];
    const freshProjectInfo: ProjectInfo = {
      projectName: '',
      location: '',
      client: '',
      contractor: '',
      consultant: '',
      currency: 'ETB',
      sheetDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    const freshMarkup: MarkupSettings = {
      profitPct: 7.0,
      overheadPct: 7.0,
      vatPct: 15.0,
    };

    setSections(freshBoq);
    setAncillary(freshAncillary);
    setProjectInfo(freshProjectInfo);
    setMarkup(freshMarkup);
    setSearchQuery('');
    setIsConfirmBlankOpen(false);
    setIsPresetsOpen(false);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          projectInfo: freshProjectInfo,
          sections: freshBoq,
          ancillary: freshAncillary,
          markup: freshMarkup,
        })
      );
    } catch {
      // ignore
    }

    setToastMessage('Blank template loaded! All quantities and rates have been reset to zero.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleImportData = (data: any) => {
    if (data.sections) {
      const cleanSections = data.sections.map((sec: any) => ({
        ...sec,
        groups: sec.groups.map((grp: any) => ({
          ...grp,
          items: grp.items.map((it: any) => ({
            ...it,
            takeoffType: it.takeoffType || getTakeoffTypeForUnit(it.unit || ''),
          })),
        })),
      }));
      setSections(cleanSections);
    }
    if (data.ancillary) setAncillary(data.ancillary);
    if (data.projectInfo) setProjectInfo(data.projectInfo);
    if (data.markup) setMarkup(data.markup);
  };

  const handleRequestBlankTemplate = () => {
    setIsConfirmBlankOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportBOQToExcel(projectInfo, sections, ancillary, summary, markup);
      setToastMessage('Excel workbook exported and downloaded successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Could not export Excel spreadsheet. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      await exportBOQToPDF(projectInfo, sections, ancillary, summary, markup);
      setToastMessage('Print-ready PDF generated and downloaded successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Could not export PDF document. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Apply measurements extracted by Gemini AI from CAD/Image drawings
  const handleApplyMeasurements = (
    itemsToApply: {
      boqItemId: string;
      takeoffLine: TakeoffLine;
      quantity: number;
    }[]
  ) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        groups: sec.groups.map((grp) => {
          const hasTarget = grp.items.some((it) =>
            itemsToApply.some((m) => m.boqItemId === it.id)
          );
          return {
            ...grp,
            isOpen: hasTarget ? true : grp.isOpen,
            items: grp.items.map((it) => {
              const matchedEntries = itemsToApply.filter((m) => m.boqItemId === it.id);
              if (matchedEntries.length === 0) return it;

              const updatedTakeoffLines = [
                ...(it.takeoffLines || []),
                ...matchedEntries.map((m) => m.takeoffLine),
              ];
              const totalQuantity = updatedTakeoffLines.reduce(
                (acc, l) => acc + (l.result || 0),
                0
              );
              const roundedQty = Math.round(totalQuantity * 1000) / 1000;
              const rate = typeof it.unitRate === 'number' ? it.unitRate : 0;

              return {
                ...it,
                takeoffLines: updatedTakeoffLines,
                quantity: roundedQty,
                amount: roundedQty * rate,
                isTakeoffOpen: true,
              };
            }),
          };
        }),
      }))
    );

    setToastMessage(
      `Successfully applied ${itemsToApply.length} measurements from CAD drawing directly into your Bill of Quantities!`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filter sections if search active
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase().trim();

    return sections
      .map((sec) => ({
        ...sec,
        groups: sec.groups
          .map((grp) => {
            const matchesGroupTitle = grp.title.toLowerCase().includes(query);
            const filteredItems = grp.items.filter((item) => {
              if (matchesGroupTitle) return true;
              return (
                (item.itemNo && item.itemNo.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query))
              );
            });
            return {
              ...grp,
              isOpen: filteredItems.length > 0 || matchesGroupTitle,
              items: filteredItems,
            };
          })
          .filter((grp) => grp.items.length > 0),
      }))
      .filter((sec) => sec.groups.length > 0);
  }, [sections, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2F5]">
      {/* Top sticky navigation bar */}
      <TopBar
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onPrint={handlePrint}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onLoadBlankTemplate={handleRequestBlankTemplate}
        onReset={handleRequestBlankTemplate}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenBreakdown={() => setIsBreakdownOpen(true)}
        onOpenAiCad={() => setIsAiCadOpen(true)}
        isExportingExcel={isExporting}
        isExportingPDF={isExportingPdf}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#0F2C4C] text-white border-2 border-[#E3A008] px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#E3A008] shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Title Block Header */}
      <TitleBlock
        info={projectInfo}
        onChange={(up) => setProjectInfo((prev) => ({ ...prev, ...up }))}
      />

      {/* Main 2-column layout */}
      <main className="max-w-[1180px] w-full mx-auto px-4 py-5 pb-28 lg:pb-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 items-start">
          {/* Left Column: Navigation & Desktop Sticky Summary */}
          <aside className="no-print space-y-4 lg:sticky lg:top-20">
            <SectionNav
              sections={sections.map((s) => ({
                id: s.id,
                title: s.title,
                total: summary.sectionTotals[s.id] || 0,
              }))}
              ancillaryTotal={summary.ancillaryTotal}
              currency={projectInfo.currency || 'ETB'}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
              onLoadBlankTemplate={handleRequestBlankTemplate}
            />

            <CostSummaryCard
              summary={summary}
              markup={markup}
              currency={projectInfo.currency || 'ETB'}
              onMarkupChange={(up) => setMarkup((prev) => ({ ...prev, ...up }))}
              sectionTitles={sectionTitles}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              isExportingPDF={isExportingPdf}
            />
          </aside>

          {/* Right Column: Sections, Groups and Bill Items */}
          <div className="space-y-6 min-w-0">
            {/* AI CAD Take-Off Spotlight Banner */}
            <div className="bg-gradient-to-r from-[#0F2C4C] to-[#173A5E] text-white rounded-lg p-4 sm:p-5 border border-[#33526E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E3A008] text-[#0F2C4C] flex items-center justify-center shrink-0 shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white m-0 flex items-center gap-2">
                    <span>AI CAD &amp; Drawing Take-Off</span>
                    <span className="bg-[#E3A008] text-[#0F2C4C] text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  </h3>
                  <p className="text-xs text-[#A9BCCD] m-0 mt-0.5 max-w-xl leading-relaxed">
                    Upload a CAD drawing, floor plan, structural foundation sheet (image or .DXF), or choose an architectural sample. Gemini AI automatically measures concrete pads, columns, walls, slabs, rebar weights, and populates your BOQ take-off schedule.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAiCadOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E3A008] hover:bg-amber-400 text-[#0F2C4C] font-bold text-xs rounded shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#0F2C4C]" />
                <span>Launch AI Take-Off</span>
              </button>
            </div>

            {/* Info Banner when template is ready */}
            {summary.subTotal === 0 ? (
              <div className="bg-[#FAFBFD] border border-[#B9C7D3] rounded-lg p-3.5 flex items-start gap-3 text-xs text-[#0F1B24] no-print shadow-2xs">
                <Info className="w-5 h-5 text-[#0F2C4C] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#0F2C4C] m-0 mb-1">
                    Blank Estimating Template Active
                  </p>
                  <p className="text-slate-600 m-0 leading-relaxed">
                    All quantities and unit rates are blank and ready for your project. Enter your project items directly below, build take-offs using the measurement (📐) and bar schedule (Ø) tools, or use the <b>AI CAD Take-Off</b> above to extract quantities directly from your drawings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#0A2038] no-print">
                <span className="text-slate-600">
                  Current project has active quantities. Want to start over with a fresh sheet?
                </span>
                <button
                  type="button"
                  onClick={handleRequestBlankTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F2C4C] bg-white hover:bg-amber-100 border border-amber-300 hover:border-amber-400 rounded transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Load Blank Template</span>
                </button>
              </div>
            )}

            {/* Render Bill of Quantities Sections */}
            {filteredSections.map((sec) => {
              const secTotal = summary.sectionTotals[sec.id] || 0;
              return (
                <section
                  key={sec.id}
                  id={`sec-${sec.id}`}
                  className="scroll-mt-20 print-avoid-break"
                >
                  <div className="flex items-baseline justify-between gap-3 pb-2 border-b-2 border-[#0F2C4C] mb-3">
                    <h3 className="m-0 text-base sm:text-lg font-bold text-[#0A2038]">
                      {sec.title}
                    </h3>
                    <span className="font-mono-num text-sm sm:text-base font-bold text-[#0F2C4C]">
                      {formatNumber(secTotal)}{' '}
                      <span className="text-xs text-slate-500 font-normal">
                        {projectInfo.currency || 'ETB'}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sec.groups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        currency={projectInfo.currency || 'ETB'}
                        onToggleOpen={() => handleToggleGroup(sec.id, group.id)}
                        onUpdateItem={(itemId, up) =>
                          handleUpdateItem(sec.id, group.id, itemId, up)
                        }
                        onAddCustomItem={() => handleAddCustomItem(sec.id, group.id)}
                        onDeleteCustomItem={(itemId) =>
                          handleDeleteCustomItem(sec.id, group.id, itemId)
                        }
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Ancillary Section (Section C) */}
            <AncillarySection
              items={ancillary}
              currency={projectInfo.currency || 'ETB'}
              onUpdateItem={handleUpdateAncillary}
              onAddItem={handleAddAncillary}
              onDeleteItem={handleDeleteAncillary}
            />

            {/* Architectural & Surveying Footnote */}
            <div className="bg-white/80 border border-[#D7E1EA] rounded p-4 text-xs text-[#7A8A9B] leading-relaxed no-print">
              <div className="flex items-center gap-1.5 font-bold text-[#4C5C6E] uppercase tracking-wider mb-1">
                <HelpCircle className="w-4 h-4 text-[#A9740A]" />
                <span>Quantity Surveying &amp; Measurement Guide</span>
              </div>
              <p className="m-0">
                Item descriptions follow international standard building specifications (SMM7 / CESMM). Click the{' '}
                <span className="font-bold text-[#0F2C4C]">📐 icon</span> beside any quantity to build that volume/area from dimensional measurements (No. × L × W × H). For reinforcement steel items, click the{' '}
                <span className="font-bold text-[#0F2C4C]">Ø icon</span> to build bar weights automatically using standard diameter weights (unit weight ={' '}
                <span className="font-mono-num">d² / 162</span> kg/m). Linked items turn emerald green and automatically update the Bill of Quantities.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* AI CAD / Drawing Measurement Modal */}
      <AiCadMeasurementModal
        isOpen={isAiCadOpen}
        onClose={() => setIsAiCadOpen(false)}
        sections={sections}
        onApplyMeasurements={handleApplyMeasurements}
        currency={projectInfo.currency || 'ETB'}
      />

      {/* Analytics Modal */}
      <CostBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        sections={sections}
        ancillary={ancillary}
        summary={summary}
        markup={markup}
        currency={projectInfo.currency || 'ETB'}
      />

      {/* Template & Backup Modal */}
      <ProjectPresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onLoadBlank={handleLoadBlank}
        currentData={{ projectInfo, sections, ancillary, markup }}
        onImportData={handleImportData}
      />

      {/* In-App Confirmation Modal for Loading Blank Template */}
      <ConfirmDialogModal
        isOpen={isConfirmBlankOpen}
        onClose={() => setIsConfirmBlankOpen(false)}
        onConfirm={handleLoadBlank}
        title="Load Clean Blank Template?"
        message="Are you sure you want to load a clean blank template? This will reset all item quantities, unit rates, custom lines, and measurement take-offs back to 0.00. Standard architectural & civil trade specifications (Excavation, Concrete, Masonry, Finishes, MEP) will remain available."
        confirmLabel="Yes, Load Blank Template"
      />
    </div>
  );
}
