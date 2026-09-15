// MHMS Oral Screening - Tooth Chart Component
// Interactive tooth chart for DMFT/dmft recording
// WHO 5th edition compliant

import { useState } from 'react';
import type { ToothFinding, PermanentToothStatus, PrimaryToothStatus } from '../lib/types';
import { PERMANENT_TEETH, PRIMARY_TEETH } from '../lib/clinical';

interface ToothChartProps {
  dentition: 'permanent' | 'primary';
  findings: ToothFinding[];
  onToothClick: (toothCode: string, status: PermanentToothStatus | PrimaryToothStatus) => void;
}

// Status options with clarifying questions
const PERMANENT_STATUS_OPTIONS: { 
  value: PermanentToothStatus; 
  label: string; 
  question: string;
  color: string;
}[] = [
  { 
    value: 'sound', 
    label: 'Sound (healthy)',
    question: 'Is this tooth completely healthy with no caries, fillings, or restorations?',
    color: 'bg-white border-gray-300'
  },
  { 
    value: 'decayed', 
    label: 'Decayed (D)',
    question: 'Is there visible caries (cavitation, soft enamel, or dentin)?',
    color: 'bg-red-100 border-red-500'
  },
  { 
    value: 'filled_decay', 
    label: 'Filled with decay (D)',
    question: 'Does this tooth have a filling AND secondary caries?',
    color: 'bg-red-200 border-red-600'
  },
  { 
    value: 'filled', 
    label: 'Filled, no decay (F)',
    question: 'Does this tooth have a filling with NO caries present?',
    color: 'bg-blue-100 border-blue-500'
  },
  { 
    value: 'missing_caries', 
    label: 'Missing due to caries (M)',
    question: 'Was this tooth extracted or missing BECAUSE OF CARIES?',
    color: 'bg-gray-400 border-gray-600'
  },
  { 
    value: 'missing_other', 
    label: 'Missing — other reason',
    question: 'Is this tooth missing for a reason OTHER than caries? (e.g., trauma, orthodontic, congenital)',
    color: 'bg-gray-300 border-gray-400'
  },
  { 
    value: 'excluded', 
    label: 'Excluded',
    question: 'Should this tooth be excluded from the examination? (e.g., not erupted, orthodontic extraction, crown/bridge abutment)',
    color: 'bg-gray-100 border-gray-200'
  },
];

const PRIMARY_STATUS_OPTIONS: { 
  value: PrimaryToothStatus; 
  label: string; 
  question: string;
  color: string;
}[] = [
  { 
    value: 'sound', 
    label: 'Sound (healthy)',
    question: 'Is this tooth completely healthy with no caries, fillings, or restorations?',
    color: 'bg-white border-gray-300'
  },
  { 
    value: 'decayed', 
    label: 'Decayed (d)',
    question: 'Is there visible caries (cavitation, soft enamel, or dentin)?',
    color: 'bg-red-100 border-red-500'
  },
  { 
    value: 'filled_decay', 
    label: 'Filled with decay (d)',
    question: 'Does this tooth have a filling AND secondary caries?',
    color: 'bg-red-200 border-red-600'
  },
  { 
    value: 'filled', 
    label: 'Filled, no decay (f)',
    question: 'Does this tooth have a filling with NO caries present?',
    color: 'bg-blue-100 border-blue-500'
  },
  { 
    value: 'missing_caries', 
    label: 'Missing due to caries (m)',
    question: 'Was this tooth missing BECAUSE OF CARIES?',
    color: 'bg-gray-400 border-gray-600'
  },
  { 
    value: 'extracted_caries', 
    label: 'Extracted due to caries (e)',
    question: 'Was this tooth extracted BECAUSE OF CARIES?',
    color: 'bg-gray-500 border-gray-700'
  },
  { 
    value: 'missing_other', 
    label: 'Missing — other reason',
    question: 'Is this tooth missing for a reason OTHER than caries?',
    color: 'bg-gray-300 border-gray-400'
  },
  { 
    value: 'extracted_other', 
    label: 'Extracted — other reason',
    question: 'Was this tooth extracted for a reason OTHER than caries? (e.g., trauma, orthodontic)',
    color: 'bg-gray-200 border-gray-300'
  },
  { 
    value: 'excluded', 
    label: 'Excluded',
    question: 'Should this tooth be excluded from the examination? (e.g., not erupted, exfoliating)',
    color: 'bg-gray-100 border-gray-200'
  },
];

function getToothStatusClass(status: PermanentToothStatus | PrimaryToothStatus): string {
  switch (status) {
    case 'sound': return 'bg-white border-gray-300 text-gray-700';
    case 'decayed':
    case 'filled_decay': return 'bg-red-100 border-red-500 text-red-800';
    case 'filled': return 'bg-blue-100 border-blue-500 text-blue-800';
    case 'missing_caries':
    case 'extracted_caries': return 'bg-gray-500 border-gray-700 text-white';
    case 'missing_other':
    case 'extracted_other': return 'bg-gray-300 border-gray-400 text-gray-600';
    case 'excluded': return 'bg-gray-100 border-gray-200 text-gray-400';
    case 'not_recorded': return 'bg-yellow-50 border-yellow-300 text-yellow-700';
    default: return 'bg-white border-gray-300 text-gray-700';
  }
}

export default function ToothChart({ dentition, findings, onToothClick }: ToothChartProps) {
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const teeth = dentition === 'permanent' ? PERMANENT_TEETH : PRIMARY_TEETH;
  const statusOptions = dentition === 'permanent' ? PERMANENT_STATUS_OPTIONS : PRIMARY_STATUS_OPTIONS;

  const getFinding = (code: string) => findings.find(f => f.toothCode === code);

  // Organize teeth into quadrants for DISPLAY (viewer's perspective looking at patient)
  const getQuadrant = (teethList: string[], start: number, end: number) =>
    teethList.filter(t => {
      const num = parseInt(t);
      return num >= start && num <= end;
    });

  let upperLeft: string[], upperRight: string[], lowerLeft: string[], lowerRight: string[];
  if (dentition === 'permanent') {
    upperLeft = getQuadrant(teeth, 11, 18).reverse();
    upperRight = getQuadrant(teeth, 21, 28);
    lowerLeft = getQuadrant(teeth, 41, 48).reverse();
    lowerRight = getQuadrant(teeth, 31, 38);
  } else {
    upperLeft = getQuadrant(teeth, 51, 55).reverse();
    upperRight = getQuadrant(teeth, 61, 65);
    lowerLeft = getQuadrant(teeth, 81, 85).reverse();
    lowerRight = getQuadrant(teeth, 71, 75);
  }

  const renderToothButton = (code: string) => {
    const finding = getFinding(code);
    const status = finding?.status || 'not_recorded';
    const isSelected = selectedTooth === code;

    return (
      <button
        key={code}
        type="button"
        onClick={() => setSelectedTooth(code)}
        className={`tooth-btn ${getToothStatusClass(status)} ${isSelected ? 'ring-2 ring-[#0066cc] ring-offset-1' : ''}`}
        aria-label={`Tooth ${code}, status: ${status}`}
        title={`Tooth ${code}: ${status}`}
      >
        {code}
      </button>
    );
  };

  const renderQuadrant = (teethList: string[], label: string) => (
    <div className="flex flex-col items-center">
      <div className="text-[10px] text-gray-400 mb-1">{label}</div>
      <div className="flex gap-0.5 sm:gap-1">
        {teethList.map(renderToothButton)}
      </div>
    </div>
  );

  const currentFinding = selectedTooth ? getFinding(selectedTooth) : null;
  const currentStatus = currentFinding?.status || 'not_recorded';

  return (
    <div className="space-y-3">
      {/* Tooth chart */}
      <div className="card p-3">
        <div className="text-xs text-gray-500 mb-3 text-center">
          {dentition === 'permanent' ? 'Permanent Dentition (32 teeth)' : 'Primary Dentition (20 teeth)'}
        </div>

        {/* Upper arch */}
        <div className="space-y-2 mb-3">
          <div className="text-[10px] text-gray-400 text-center uppercase tracking-wide">Upper Arch</div>
          {renderQuadrant(upperLeft, dentition === 'permanent' ? 'Upper Right (18→11)' : 'Upper Right (55→51)')}
          {renderQuadrant(upperRight, dentition === 'permanent' ? 'Upper Left (21→28)' : 'Upper Left (61→65)')}
        </div>

        {/* Midline divider */}
        <div className="border-t-2 border-dashed border-gray-300 my-2" />

        {/* Lower arch */}
        <div className="space-y-2">
          <div className="text-[10px] text-gray-400 text-center uppercase tracking-wide">Lower Arch</div>
          {renderQuadrant(lowerLeft, dentition === 'permanent' ? 'Lower Right (48→41)' : 'Lower Right (85→81)')}
          {renderQuadrant(lowerRight, dentition === 'permanent' ? 'Lower Left (31→38)' : 'Lower Left (71→75)')}
        </div>
      </div>

      {/* Status selector MODAL POPUP */}
      {selectedTooth && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTooth(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b bg-[#0066cc] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-80">Tooth</div>
                  <div className="text-2xl font-bold">{selectedTooth}</div>
                </div>
                <button
                  onClick={() => setSelectedTooth(null)}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              {currentStatus !== 'not_recorded' && (
                <div className="text-xs mt-1 opacity-90">
                  Current status: {statusOptions.find(s => s.value === currentStatus)?.label || currentStatus}
                </div>
              )}
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="text-sm text-gray-600 mb-4">
                Select the status for tooth {selectedTooth}:
              </div>

              <div className="space-y-3">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onToothClick(selectedTooth, option.value);
                      setSelectedTooth(null);
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all
                      ${currentStatus === option.value
                        ? 'border-[#0066cc] bg-[#e6f0ff] ring-2 ring-[#0066cc]/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="font-semibold text-sm mb-1">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.question}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setSelectedTooth(null)}
                className="btn-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded border bg-white border-gray-300 inline-block" /> Sound
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded border bg-red-100 border-red-500 inline-block" /> Decayed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded border bg-blue-100 border-blue-500 inline-block" /> Filled
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded border bg-gray-500 border-gray-700 inline-block" /> Missing (caries)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded border bg-gray-300 border-gray-400 inline-block" /> Missing (other)
        </span>
      </div>
    </div>
  );
}
