'use client';

import React, { useEffect, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { fetchLocationStatistics } from '@/services/adminService';

const geoUrl =
  'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json';

interface CountryRevenue {
  country: string;
  total_sales: number;
}

const WorldHeatmap: React.FC = () => {
  const [stats, setStats] = useState<CountryRevenue[]>([]);
  const [maxValue, setMaxValue] = useState<number>(0);

  useEffect(() => {
    const loadStats = async () => {
      const data: CountryRevenue[] = await fetchLocationStatistics('country');
      setStats(data);
      const max = Math.max(...data.map((s) => s.total_sales));
      setMaxValue(max);
    };

    loadStats();
  }, []);

  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range(['#d1e9ff', '#08306b']);

  const getSalesByCountry = (countryName: string): number => {
    const countryData = stats.find(
      (c) => c.country.toLowerCase() === countryName.toLowerCase()
    );
    return countryData?.total_sales || 0;
  };

  return (
    <div className="overflow-auto">
      <h2 className="text-xl font-bold mb-4">🌍 World Revenue Heatmap</h2>
      <ComposableMap projectionConfig={{ scale: 150 }} width={980} height={500}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.NAME;
              const sales = getSalesByCountry(name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(sales)}
                  stroke="#FFF"
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      fill: '#ffcc00',
                      cursor: 'pointer',
                    },
                    pressed: { fill: '#ff6600' },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default WorldHeatmap;
