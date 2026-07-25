"use client";

import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type CityMapPoint = {
  id: string;
  name: string;
  coordinates: [number, number];
  placesCount: number;
  visits: number;
};

const cityIcon = L.divIcon({
  className: "custom-map-pin",
  html: "<span></span>",
  iconAnchor: [13, 26],
  iconSize: [26, 26],
  popupAnchor: [0, -24],
});

function MapFocus({ coordinates }: { coordinates: [number, number] }) {
  const map = useMap();
  map.setView(coordinates, 8, { animate: true });
  return null;
}

export function TravelMap({
  cities,
  selectedCity,
  onSelectCity,
}: {
  cities: CityMapPoint[];
  selectedCity: CityMapPoint;
  onSelectCity: (cityId: string) => void;
}) {
  return (
    <MapContainer
      center={selectedCity.coordinates}
      className="real-map"
      scrollWheelZoom={false}
      zoomControl={false}
      zoom={6}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <MapFocus coordinates={selectedCity.coordinates} />
      {cities.map((city) => (
        <Marker
          eventHandlers={{
            click: () => onSelectCity(city.id),
          }}
          icon={cityIcon}
          key={city.id}
          position={city.coordinates}
        >
          <Popup>
            <strong>{city.name}</strong>
            <br />
            {city.placesCount} mekan, {city.visits} ziyaret
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
