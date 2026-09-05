import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapLocation {
  id: string;
  inspectionNumber: string;
  productName: string;
  storeName: string;
  latitude: number;
  longitude: number;
  assessment: string;
  status: string;
  timestamp: string;
}

interface GeospatialMapProps {
  locations: MapLocation[];
  onSelectInspection?: (id: string) => void;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({ locations, onSelectInspection }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map centered over Central India
      const map = L.map(mapContainerRef.current).setView([22.5, 78.5], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers if any
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add CircleMarkers for each inspection
    locations.forEach((loc) => {
      const isGreen = loc.assessment === 'APPEARS_COMPLIANT';
      const isYellow = loc.assessment === 'NEEDS_VERIFICATION';
      const color = isGreen ? '#16a34a' : isYellow ? '#d97706' : '#dc2626';

      const marker = L.circleMarker([loc.latitude, loc.longitude], {
        radius: 8,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
          <strong style="color: #0f172a; font-size: 13px;">${loc.productName}</strong><br/>
          <span style="color: #64748b;">${loc.storeName}</span><br/>
          <span style="font-family: monospace; font-size: 11px; color: #0284c7;">${loc.inspectionNumber}</span><br/>
          <div style="margin-top: 6px; font-weight: bold; color: ${color};">
            ${isGreen ? 'Appears Compliant' : isYellow ? 'Needs Verification' : 'Potential Issue Flagged'}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }, [locations]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Geospatial Inspection Distribution</h3>
          <p className="text-xs text-slate-500">Live monitoring of field inspections across states and market jurisdictions</p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span>Compliant</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Under Review</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            <span>Potential Issue</span>
          </span>
        </div>
      </div>

      <div ref={mapContainerRef} className="h-[420px] w-full rounded-xl border border-slate-200 z-10" />
    </div>
  );
};
