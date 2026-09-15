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

// Status options for permanent teeth
const PERMANENT_STATUS_OPTIONS: { value: PermanentToothStatus; label: string }[] = [
  { value: 'not_recorded', label: '— Not recorded —' },
  { value: 'sound', label: 'Sound (healthy)' },
  { value: 'decayed', label: 'Decayed (D)' },
  { value: 'filled_decay', label: 'Filled with decay (D)' },
  { value: 'filled', label: 'Filled, no decay (F)' },
  { value: 'missing_caries', label: 'Missing due to caries (M)' },
  { value: 'missing_other', label: 'Missing — other reason' },
  { value: 'excluded', label: 'Excluded' },
];

// Status options for primary teeth
const PRIMARY_STATUS_OPTIONS: { value: PrimaryToothStatus; label: string }[] = [
  { value: 'not_recorded', label: '— Not recorded —' },
  { value: 'sound', label: 'Sound (healthy)' },
  { value: 'decayed', label: 'Decayed (d)' },
  { value: 'filled_decay', label: 'Filled with decay (d)' },
  { value: 'filled', label: 'Filled, no decay (f)' },
  { value: 'missing_caries', label: 'Missing due to caries (m)' },
  { value: 'extracted_caries', label: 'Extracted due to caries (e)' },
  { value: 'missing_other', label: 'Missing — other reason' },
  { value: 'extracted_other', label: 'Extracted — other reason' },
  { value: 'excluded', label: 'Excluded' },
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
    upperLeft = getQuadrant(teeth, 11, 18).reverse();  // 18,17,...,11
    upperRight = getQuadrant(teeth, 21, 28);            // 21,22,...,28
    lowerLeft = getQuadrant(teeth, 41, 48).reverse();   // 48,47,...,41
    lowerRight = getQuadrant(teeth, 31, 38);            // 31,32,...,38
  } else {
    upperLeft = getQuadrant(teeth, 51, 55).reverse();   // 55,54,...,51
    upperRight = getQuadrant(teeth, 61, 65);            // 61,62,...,65
    lowerLeft = getQuadrant(teeth, 81, 85).reverse();   // 85,84,...,81
    lowerRight = getQuadrant(teeth, 71, 75);            // 71,72,...,75
  }

  const renderToothButton = (code: string) => {
    const finding = getFinding(code);
    const status = finding?.status || 'not_recorded';
    const isSelected = selectedTooth === code;

    return (
      <button
        key={code}
        type="button"
        onClick={() => setSelectedTooth(isSelected ? null : code)}
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

        {/* Upper arch — stacked quadrants */}
        <div className="space-y-2 mb-3">
          <div className="text-[10px] text-gray-400 text-center uppercase tracking-wide">Upper Arch</div>
          {renderQuadrant(upperLeft, dentition === 'permanent' ? 'Upper Right (18→11)' : 'Upper Right (55→51)')}
          {renderQuadrant(upperRight, dentition === 'permanent' ? 'Upper Left (21→28)' : 'Upper Left (61→65)')}
        </div>

        {/* Midline divider */}
        <div className="border-t-2 border-dashed border-gray-300 my-2" />

        {/* Lower arch — stacked quadrants */}
        <div className="space-y-2">
          <div className="text-[10px] text-gray-400 text-center uppercase tracking-wide">Lower Arch</div>
          {renderQuadrant(lowerLeft, dentition === 'permanent' ? 'Lower Right (48→41)' : 'Lower Right (85→81)')}
          {renderQuadrant(lowerRight, dentition === 'permanent' ? 'Lower Left (31→38)' : 'Lower Left (71→75)')}
        </div>
      </div>

      {/* Status selector — DROPDOWN for mobile/tablet */}
      {selectedTooth && (
        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm">
              Tooth {selectedTooth}
            </div>
            <button
              type="button"
              onClick={() => setSelectedTooth(null)}
              className="text-xs text-gray-500 underline"
            >
              Close
            </button>
          </div>
          <label className="form-label">Select Status</label>
          <select
            className="form-select"
            value={currentStatus}
            onChange={e => {
              onToothClick(selectedTooth, e.target.value as PermanentToothStatus | PrimaryToothStatus);
            }}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="mt-2 text-xs text-gray-500">
            Tap another tooth to change selection, or tap "Close" to dismiss.
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
