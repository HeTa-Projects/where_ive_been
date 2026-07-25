"use client";

import L from "leaflet";
import { useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type CityMapPoint = {
  id: string;
  name: string;
  coordinates: [number, number];
  placesCount: number;
  visits: number;
  category?: string;
};

export type UserPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: "visited" | "wishlist" | "favorite";
  note?: string;
};

const MAP_STYLES = {
  dark: {
    name: "🌙 Gece Modu",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  satellite: {
    name: "🛰️ Canlı Uydu",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  voyager: {
    name: "🗺️ Renkli Harita",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
};

function createCityIcon(isSelected: boolean, cityName: string, placesCount: number) {
  return L.divIcon({
    className: `custom-map-pin ${isSelected ? "custom-map-pin-active" : ""}`,
    html: `
      <div class="pin-pulse"></div>
      <div class="pin-core">
        <span class="pin-dot"></span>
      </div>
      <div class="pin-badge">${placesCount}</div>
      <div class="pin-label">${cityName}</div>
    `,
    iconAnchor: [16, 32],
    iconSize: [32, 32],
    popupAnchor: [0, -32],
  });
}

function createUserPinIcon(type: "visited" | "wishlist" | "favorite") {
  const colors = {
    visited: "#10B981",
    wishlist: "#F59E0B",
    favorite: "#F43F5E",
  };
  const icons = {
    visited: "✅",
    wishlist: "📌",
    favorite: "❤️",
  };
  return L.divIcon({
    className: "custom-user-pin",
    html: `
      <div class="user-pin-bubble" style="background: ${colors[type]};">
        <span>${icons[type]}</span>
      </div>
    `,
    iconAnchor: [14, 28],
    iconSize: [28, 28],
    popupAnchor: [0, -28],
  });
}

function MapFocus({ coordinates }: { coordinates: [number, number] }) {
  const map = useMap();
  map.setView(coordinates, 8, { animate: true });
  return null;
}

function MapClickHandler({
  onAddPinClick,
}: {
  onAddPinClick: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onAddPinClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function TravelMap({
  cities,
  selectedCity,
  onSelectCity,
  userPins = [],
  onAddNewUserPin,
}: {
  cities: CityMapPoint[];
  selectedCity: CityMapPoint;
  onSelectCity: (cityId: string) => void;
  userPins?: UserPin[];
  onAddNewUserPin?: (pin: Omit<UserPin, "id">) => void;
}) {
  const [currentStyle, setCurrentStyle] = useState<keyof typeof MAP_STYLES>("dark");
  const [newPinCoords, setNewPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newPinTitle, setNewPinTitle] = useState("");
  const [newPinCategory, setNewPinCategory] = useState<"visited" | "wishlist" | "favorite">("visited");
  const [newPinNote, setNewPinNote] = useState("");

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinCoords || !newPinTitle.trim()) return;

    if (onAddNewUserPin) {
      onAddNewUserPin({
        lat: newPinCoords.lat,
        lng: newPinCoords.lng,
        title: newPinTitle.trim(),
        category: newPinCategory,
        note: newPinNote.trim(),
      });
    }

    setNewPinCoords(null);
    setNewPinTitle("");
    setNewPinNote("");
  };

  return (
    <div className="map-container-wrapper">
      <MapContainer
        center={selectedCity.coordinates}
        className="real-map"
        scrollWheelZoom={true}
        zoomControl={false}
        zoom={6}
      >
        <TileLayer
          attribution={MAP_STYLES[currentStyle].attribution}
          url={MAP_STYLES[currentStyle].url}
        />
        <ZoomControl position="bottomright" />
        <MapFocus coordinates={selectedCity.coordinates} />
        
        <MapClickHandler
          onAddPinClick={(coords) => setNewPinCoords(coords)}
        />

        {/* Sehir Pinleri */}
        {cities.map((city) => {
          const isSelected = city.id === selectedCity?.id;
          return (
            <Marker
              eventHandlers={{
                click: () => onSelectCity(city.id),
              }}
              icon={createCityIcon(isSelected, city.name, city.placesCount)}
              key={city.id}
              position={city.coordinates}
            >
              <Popup className="dark-map-popup">
                <div className="popup-card">
                  <h3>📍 {city.name}</h3>
                  <p>🏛️ {city.placesCount} Popüler Mekan</p>
                  <p>👥 {city.visits} Gezgin Topluluk Notu</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Kullanici Pinleri */}
        {userPins.map((pin) => (
          <Marker
            icon={createUserPinIcon(pin.category)}
            key={pin.id}
            position={[pin.lat, pin.lng]}
          >
            <Popup className="dark-map-popup">
              <div className="popup-card">
                <h3>{pin.category === "visited" ? "✅ Gittim" : pin.category === "wishlist" ? "📌 Rota Listemde" : "❤️ Favorim"}: {pin.title}</h3>
                {pin.note && <p>💬 "{pin.note}"</p>}
                <p><small>Kişisel Pinim</small></p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Yeni Pin Taslagi */}
        {newPinCoords && (
          <Marker
            icon={createUserPinIcon(newPinCategory)}
            position={[newPinCoords.lat, newPinCoords.lng]}
          />
        )}
      </MapContainer>

      {/* Harita Stili Değiştirici Butonlar */}
      <div className="map-style-switcher" aria-label="Harita Görünüm Seçimi">
        {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map((key) => (
          <button
            className={`style-btn ${currentStyle === key ? "active" : ""}`}
            key={key}
            onClick={() => setCurrentStyle(key)}
            type="button"
          >
            {MAP_STYLES[key].name}
          </button>
        ))}
      </div>

      {/* Yeni Pin Oluşturma Paneli Modal */}
      {newPinCoords && (
        <div className="pin-modal-overlay">
          <form className="pin-modal" onSubmit={handleCreatePin}>
            <button
              className="modal-close"
              onClick={() => setNewPinCoords(null)}
              type="button"
            >
              ✕
            </button>
            <h3>📍 Yeni Yer İşaretle</h3>
            <p className="coords-info">
              Koordinat: {newPinCoords.lat.toFixed(4)}, {newPinCoords.lng.toFixed(4)}
            </p>

            <label>
              <span>Yer / Mekan Adı</span>
              <input
                autoFocus
                onChange={(e) => setNewPinTitle(e.target.value)}
                placeholder="Örn: Kapadokya Balon Seyir Tepesi"
                required
                type="text"
                value={newPinTitle}
              />
            </label>

            <label>
              <span>Durum / Kategori</span>
              <div className="category-options">
                <button
                  className={newPinCategory === "visited" ? "selected visited" : ""}
                  onClick={() => setNewPinCategory("visited")}
                  type="button"
                >
                  ✅ Gittim
                </button>
                <button
                  className={newPinCategory === "wishlist" ? "selected wishlist" : ""}
                  onClick={() => setNewPinCategory("wishlist")}
                  type="button"
                >
                  📌 Rota Listemde
                </button>
                <button
                  className={newPinCategory === "favorite" ? "selected favorite" : ""}
                  onClick={() => setNewPinCategory("favorite")}
                  type="button"
                >
                  ❤️ Favorim
                </button>
              </div>
            </label>

            <label>
              <span>Not / Anı (İsteğe Bağlı)</span>
              <textarea
                onChange={(e) => setNewPinNote(e.target.value)}
                placeholder="Buradaki en harika manzarayı ve tavsiyelerini yaz..."
                rows={2}
                value={newPinNote}
              />
            </label>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setNewPinCoords(null)}
                type="button"
              >
                İptal
              </button>
              <button className="save-btn" type="submit">
                Pin Kaydet ✨
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
