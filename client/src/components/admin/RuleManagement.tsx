import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ShieldAlert, CheckCircle2, History, Scale, FileText } from 'lucide-react';
import { RegulationVersion, RuleRequirement, ProductCategory } from '../../types';
import { ApiService } from '../../services/api';

interface RuleManagementProps {
  versions: RegulationVersion[];
  categories: ProductCategory[];
}

export const RuleManagement: React.FC<RuleManagementProps> = ({ versions, categories }) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(versions[0]?.id || 'ver-2021-usp');
  const [requirements, setRequirements] = useState<RuleRequirement[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Rule Form
  const [newClause, setNewClause] = useState('Rule 6(1)(h)');
  const [newTitle, setNewTitle] = useState('QR Code Verification for Electronic Declarations');
  const [newFieldKey, setNewFieldKey] = useState('qr_code');
  const [newDesc, setNewDesc] = useState('Optional electronic barcode/QR code linking to registered statutory details.');
  const [newValidationType, setNewValidationType] = useState<any>('presence');

  useEffect(() => {
    loadRequirements(selectedVersionId);
  }, [selectedVersionId]);

  const loadRequirements = async (vId: string) => {
    const res = await ApiService.getRequirements(vId);
    if (res.success) {
      setRequirements(res.requirements);
    }
  };

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/rules/requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        versionId: selectedVersionId,
        ruleClause: newClause,
        title: newTitle,
        fieldKey: newFieldKey,
        description: newDesc,
        validationType: newValidationType
      })
    });
    const data = await res.json();
    if (data.success) {
      setShowAddModal(false);
      loadRequirements(selectedVersionId);
    }
  };

  const currentVersion = versions.find(v => v.id === selectedVersionId);

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-start space-x-3">
        <Scale className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Official Disclaimer on Regulatory Datasets:</div>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            {currentVersion?.officialDisclaimer || 'Prototype rule dataset — requires official verification by an authorized Legal Metrology Officer before enforcement.'}
            Historical rule versions are immutable and version-controlled.
          </p>
        </div>
      </div>

      {/* Version Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Regulation Version</span>
          <div className="flex items-center space-x-2 mt-0.5">
            <select
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.code} - {v.title}
                </option>
              ))}
            </select>
            {currentVersion?.isActive && (
              <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded uppercase">
                Enforced Version
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Propose Rule Amendment</span>
        </button>
      </div>

      {/* Version Amendment Summary */}
      {currentVersion && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-700">Notification Summary:</span>
          <p className="text-slate-600 leading-relaxed">{currentVersion.amendmentSummary}</p>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Effective From: {currentVersion.effectiveFrom} {currentVersion.effectiveTo ? `to ${currentVersion.effectiveTo}` : '(Current)'}
          </div>
        </div>
      )}

      {/* Requirements Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Mandatory Declarations & Verification Criteria ({requirements.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Clause</th>
                <th className="p-3">Requirement Title</th>
                <th className="p-3">Target Field</th>
                <th className="p-3">Validation Logic</th>
                <th className="p-3">Min Height</th>
                <th className="p-3">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono font-bold text-sky-700 whitespace-nowrap">
                    {req.ruleClause}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{req.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{req.description}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    {req.fieldKey}
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 uppercase">
                      {req.validationType}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    {req.minNumeralHeightMm ? `${req.minNumeralHeightMm} mm` : '-'}
                  </td>
                  <td className="p-3 text-[11px] text-slate-500">
                    {req.applicableCategories && req.applicableCategories.length > 0 ? (
                      <span className="text-amber-700 font-semibold">Specific Categories</span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">Universal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">Propose New Rule Requirement</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRequirement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Clause</label>
                <input
                  type="text"
                  value={newClause}
                  onChange={(e) => setNewClause(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Field Key</label>
                <input
                  type="text"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Validation Type</label>
                <select
                  value={newValidationType}
                  onChange={(e) => setNewValidationType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="presence">Presence Verification</option>
                  <option value="format">Format / Qualification Match</option>
                  <option value="standard_unit">Standard Metric SI Units</option>
                  <option value="unit_sale_price">Unit Sale Price Canonical Unit</option>
                  <option value="contact_info">Multi-channel Contact Verification</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clause Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg"
                >
                  Save to Prototype Rulebase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
