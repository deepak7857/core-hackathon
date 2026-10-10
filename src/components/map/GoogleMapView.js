'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
  DirectionsRenderer,
} from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '650px',
};

const DEFAULT_CENTER = { lat: 29.58, lng: 80.21 };

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#090d16' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
];

function GoogleMapView({
  anomalies = [],
  selectedAnomaly = null,
  onSelectAnomaly,
  directionsResponse = null,
  routeIndex = 0,
  onResolveAnomaly,
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [activeItem, setActiveItem] = useState(null);
  const mapRef = useRef(null);

  // Sync active info window and pan to anomaly when selected from sidebar
  useEffect(() => {
    if (selectedAnomaly) {
      setActiveItem(selectedAnomaly);
      if (mapRef.current && selectedAnomaly.lat && selectedAnomaly.lng) {
        mapRef.current.panTo({
          lat: Number(selectedAnomaly.lat),
          lng: Number(selectedAnomaly.lng),
        });
        mapRef.current.setZoom(16);
      }
    }
  }, [selectedAnomaly]);

  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Map settings
  const mapOptions = useMemo(
    () => ({
      styles: darkMapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
    }),
    []
  );
  const directionsRendererOptions = useMemo(
    () => ({
      polylineOptions: {
        strokeColor: '#10b981', 
        strokeWeight: 6,
        strokeOpacity: 0.9,
      },
      suppressMarkers: false,
    }),
    []
  );

  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl p-6 text-rose-400 font-semibold text-sm">
        Failed to load Google Maps script. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400 animate-pulse text-sm">
        Initializing Google Maps Engine...
      </div>
    );
  }

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={DEFAULT_CENTER}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            routeIndex={Number(routeIndex) || 0}
            options={directionsRendererOptions}
          />
        )}

      
        {anomalies.map((item) => {
          let pinIcon = 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
          if (item.status === 'REPAIRED') {
            pinIcon = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
          } else if (item.waterPresent) {
            pinIcon = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
          } else if (item.severity === 'HIGH') {
            pinIcon = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
          }
          return (
            <MarkerF
              key={item.id}
              position={{ lat: Number(item.lat), lng: Number(item.lng) }}
              icon={{ url: pinIcon }}
              onClick={() => {
                setActiveItem(item);
                if (onSelectAnomaly) onSelectAnomaly(item);
              }}
            />
          );
        })}


        {activeItem && (
          <InfoWindowF
            position={{ lat: Number(activeItem.lat), lng: Number(activeItem.lng) }}
            onCloseClick={() => {
              setActiveItem(null);
              if (onSelectAnomaly) onSelectAnomaly(null);
            }}
          >
            <div className="text-slate-900 p-2 max-w-xs font-sans">
              <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-2">
                <span className="font-bold text-sm">
                  {activeItem.status === 'REPAIRED'
                    ? '✅ Dig Repaired'
                    : activeItem.waterPresent
                    ? '🌊 Submerged Cavity'
                    : '⚠️ Road Cavity'}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    activeItem.severity === 'HIGH'
                      ? 'bg-rose-100 text-rose-700'
                      : activeItem.severity === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {activeItem.severity}
                </span>
              </div>

              <div className="text-xs space-y-1 mb-3 text-slate-700">
                <p>
                  <strong>Node ID:</strong> {activeItem.deviceId || 'ESP32_NODE_01'}
                </p>
                <p>
                  <strong>Depth:</strong> {activeItem.depthCm} cm
                </p>
                <p>
                  <strong>Vertical Shock:</strong> {activeItem.zPeakG} g
                </p>
                <p>
                  <strong>Speed:</strong> {activeItem.speedKmh} km/h
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={
                      activeItem.status === 'REPAIRED'
                        ? 'text-emerald-600 font-bold'
                        : 'text-amber-600 font-bold'
                    }
                  >
                    {activeItem.status}
                  </span>
                </p>
              </div>


              {activeItem.status !== 'REPAIRED' && (
                <button
                  type="button"
                  onClick={() => {
                    if (onResolveAnomaly) {
                      onResolveAnomaly(activeItem.id);
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors shadow-sm"
                >
                  Mark Dig as Repaired / Finished
                </button>
              )}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}

export default memo(GoogleMapView);