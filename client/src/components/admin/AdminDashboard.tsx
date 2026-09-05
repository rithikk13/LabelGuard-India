import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  MapPin,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  Filter,
  FileDown,
  Eye,
  Building2,
  BookOpen,
  Activity,
  Calendar,
  Layers
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { DashboardSummary, Inspection, ProductCategory, RegulationVersion } from '../../types';
import { GeospatialMap } from './GeospatialMap';
import { RuleManagement } from './RuleManagement';

interface AdminDashboardProps {
  categories: ProductCategory[];
  versions: RegulationVersion[];
  onInspectEvidence: (inspection: Inspection) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  versions,
  onInspectEvidence
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'inspections' | 'rules' | 'audits'>('overview');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, inspRes] = await Promise.all([
        ApiService.getDashboardSummary(),
        ApiService.getInspections({
          search: searchTerm,
          status: statusFilter,
          categoryId: categoryFilter
        })
      ]);
      if (sumRes.success) setSummary(sumRes);
      if (inspRes.success) setInspections(inspRes.inspections);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
              DIRECTORATE PORTAL
            </span>
            <span className="text-xs text-slate-500 font-semibold">Executive Legal Metrology Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Authority Compliance & Analytics Dashboard
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Trends
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
              activeTab === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Geospatial Map</span>
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'inspections' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inspection Registry
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
              activeTab === 'rules' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>Regulations</span>
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'audits' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Scans</span>
            <div className="text-2xl font-black text-slate-900">{summary.kpi.totalInspections}</div>
            <div className="text-[10px] text-slate-500">Across all districts</div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Appears Compliant</span>
            <div className="text-2xl font-black text-emerald-700">{summary.kpi.appearsCompliant}</div>
            <div className="text-[10px] text-emerald-600">Zero discrepancies</div>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Needs Review</span>
            <div className="text-2xl font-black text-amber-700">{summary.kpi.needsVerification}</div>
            <div className="text-[10px] text-amber-600">Ambiguous / Uncaptured</div>
          </div>

          <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Potential Issues</span>
            <div className="text-2xl font-black text-rose-700">{summary.kpi.potentialIssues}</div>
            <div className="text-[10px] text-rose-600">Flagged for verification</div>
          </div>

          <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Field Verified</span>
            <div className="text-2xl font-black text-sky-700">{summary.kpi.verified}</div>
            <div className="text-[10px] text-sky-600">Officer sign-off recorded</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Sign-off</span>
            <div className="text-2xl font-black text-slate-800">{summary.kpi.pendingVerification}</div>
            <div className="text-[10px] text-slate-400">Awaiting inspection note</div>
          </div>
        </div>
      )}

      {/* Tab: Overview & Analytics */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issue Types Frequency */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  <span>Statutory Issues Breakdown</span>
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(summary.issueTypes).map(([issue, count]) => (
                  <div key={issue} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{issue}</span>
                      <span className="font-mono text-slate-900">{count} incident(s)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-600"
                        style={{
                          width: `${summary.kpi.totalInspections > 0 ? (count / summary.kpi.totalInspections) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Repeat Manufacturer Observations (Neutral wording) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Manufacturer Trends & Repeat Observations</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Neutral historical observation metrics based on preliminary digital screenings
                </p>
              </div>

              <div className="space-y-2.5">
                {summary.repeatObservations.map((obs, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {obs.manufacturer}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {obs.statusNote}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-bold text-slate-900">
                        {obs.totalInspections} scan(s)
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        obs.potentialFindingsCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {obs.potentialFindingsCount} finding(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Geospatial Map */}
      {activeTab === 'map' && summary && (
        <GeospatialMap locations={summary.mapLocations} />
      )}

      {/* Tab: Inspections Registry */}
      {activeTab === 'inspections' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product, manufacturer, store, inspection ID..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="APPEARS_COMPLIANT">Appears Compliant</option>
              <option value="NEEDS_VERIFICATION">Needs Verification</option>
              <option value="POTENTIAL_ISSUE">Potential Issue</option>
              <option value="VERIFIED_COMPLIANT">Verified Compliant</option>
              <option value="VERIFIED_POTENTIAL_ISSUE">Verified Potential Issue</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Registry Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Inspection ID</th>
                    <th className="p-3">Commodity Particulars</th>
                    <th className="p-3">Establishment / Market</th>
                    <th className="p-3">Rule Version</th>
                    <th className="p-3">Assessment</th>
                    <th className="p-3">Verification</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {inspections.map((insp) => {
                    const isGreen = insp.overallAssessment === 'APPEARS_COMPLIANT';
                    const isYellow = insp.overallAssessment === 'NEEDS_VERIFICATION';

                    return (
                      <tr key={insp.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-sky-700 whitespace-nowrap">
                          {insp.inspectionNumber}
                          <div className="text-[10px] text-slate-400 font-normal">
                            {new Date(insp.timestamp).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{insp.productName}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{insp.manufacturerName}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{insp.storeName}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{insp.storeAddress}</div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {insp.ruleVersionCode}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isGreen
                                ? 'bg-emerald-100 text-emerald-800'
                                : isYellow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isGreen ? 'Compliant' : isYellow ? 'Review' : 'Potential Issue'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-[11px]">
                          {insp.verification ? (
                            <span className="text-emerald-700 font-semibold">
                              ✓ Verified ({insp.verification.decision})
                            </span>
                          ) : (
                            <span className="text-amber-600 italic">Pending Sign-off</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => onInspectEvidence(insp)}
                            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700"
                            title="Inspect Evidence Regions"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={ApiService.getReportPdfUrl(insp.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white"
                            title="Download Panchnama PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Regulatory Rule Management */}
      {activeTab === 'rules' && (
        <RuleManagement versions={versions} categories={categories} />
      )}

      {/* Tab: System Audit Logs */}
      {activeTab === 'audits' && summary && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Immutable System Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographically tracked record of state transitions, inspector actions, and category overrides
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-bold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Officer / User</th>
                  <th className="p-3">State Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {summary.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 uppercase text-[11px] font-bold text-sky-700">
                      {log.entityType} ({log.entityId.substring(0, 10)})
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {log.action}
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      {log.userId || 'system'}
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">
                      {log.previousState ? `${log.previousState} ➔ ` : ''}{JSON.stringify(log.newState)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
