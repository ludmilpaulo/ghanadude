'use client';

import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
} from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLocationStatistics } from '@/services/adminService';
import ReactWorldFlags from 'react-world-flags';
import countries from 'world-countries';

interface Point {
  name: string;
  lat: number;
  lng: number;
  total_sales: number;
}

interface Threshold {
  min: number;
  max: number;
  color: string;
}

const WorldLeafletMap: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [region, setRegion] = useState<'country' | 'city'>('country');

  useEffect(() => {
    const load = async () => {
      const res = await fetchLocationStatistics(region);
      setPoints(res.points || []);
      setThresholds(res.thresholds || []);
    };
    load();
  }, [region]);

  const getColor = (value: number): string => {
    const match = thresholds.find((t) => value >= t.min && value < t.max);
    return match?.color || '#ccc';
  };

  const getCountryCode = (countryName: string): string | undefined => {
    const country = countries.find(
      (c) => c.name.common.toLowerCase() === countryName.toLowerCase()
    );
    return country?.cca2;
  };

  const mapCenter: LatLngExpression = [20, 0];

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🌍 Global Revenue Map</h2>
        <select
          className="border px-3 py-2 rounded-md text-sm"
          value={region}
          onChange={(e) => setRegion(e.target.value as 'country' | 'city')}
        >
          <option value="country">By Country</option>
          <option value="city">By City</option>
        </select>
      </div>

      <MapContainer
        id="leaflet-map"
        center={mapCenter}
        zoom={2}
        style={{ height: '500px', borderRadius: '10px' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />

        {points.map((point, index) => {
          const countryCode = getCountryCode(point.name);
          return (
            <CircleMarker
              key={index}
              center={[point.lat, point.lng] as LatLngExpression}
              radius={Math.sqrt(point.total_sales) / 8 + 5}
              pathOptions={{
                color: getColor(point.total_sales),
                fillColor: getColor(point.total_sales),
                fillOpacity: 0.75,
              }}
            >
              <Popup>
                <div className="text-sm">
                  {countryCode ? (
                    <span className="flex items-center">
                      <ReactWorldFlags code={countryCode} style={{ width: 24, height: 16, marginRight: 8 }} />
                      <strong>{point.name}</strong>
                    </span>
                  ) : (
                    <strong>{point.name}</strong>
                  )}
                  <br />
                  💰 R{point.total_sales.toLocaleString()}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

   
    </div>
  );
};

export default WorldLeafletMap;
