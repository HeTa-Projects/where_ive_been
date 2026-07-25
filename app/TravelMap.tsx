"use client";

import L from "leaflet";
import { useEffect, useState } from "react";
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
import type { Ulke } from "./gezi-verileri";
import { useThemeAndLang } from "./ThemeAndLangProvider";

export type CityMapPoint = {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
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
  voyager: {
    name: "🗺️ Canlı Harita",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  dark: {
    name: "🌙 Gece Modu",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  topo: {
    name: "🏔️ Arazi & Sınırlar",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri',
  },
  satellite: {
    name: "🛰️ Canlı Uydu",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri',
  },
};

function createCountryIcon(country: Ulke) {
  return L.divIcon({
    className: "custom-country-pin",
    html: `
      <div class="country-pulse"></div>
      <div class="country-bubble">
        <span class="country-flag">${country.bayrak}</span>
        <span class="country-name">${country.ad}</span>
        <span class="country-count">${country.sehirSayisi} Şehir</span>
      </div>
    `,
    iconAnchor: [36, 18],
    iconSize: [72, 36],
    popupAnchor: [0, -20],
  });
}

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

function MapFlyTo({
  target,
  zoom,
}: {
  target: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(target, zoom, {
      duration: 1.4,
      easeLinearity: 0.25,
    });
  }, [map, target, zoom]);

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
  countries = [],
  cities = [],
  selectedCity,
  selectedCountry,
  onSelectCity,
  onSelectCountry,
  userPins = [],
  onAddNewUserPin,
}: {
  countries?: Ulke[];
  cities: CityMapPoint[];
  selectedCity: CityMapPoint;
  selectedCountry: Ulke;
  onSelectCity: (cityId: string) => void;
  onSelectCountry: (country: Ulke) => void;
  userPins?: UserPin[];
  onAddNewUserPin?: (pin: Omit<UserPin, "id">) => void;
}) {
  const { theme, t } = useThemeAndLang();
  const [viewLevel, setViewLevel] = useState<"countries" | "cities">("cities");
  const [currentStyle, setCurrentStyle] = useState<keyof typeof MAP_STYLES>(
    theme === "dark" ? "dark" : "voyager",
  );

  useEffect(() => {
    setCurrentStyle(theme === "dark" ? "dark" : "voyager");
  }, [theme]);

  // Map Target & Zoom state for animated smooth flyTo
  const [mapTarget, setMapTarget] = useState<[number, number]>(selectedCity.coordinates);
  const [mapZoom, setMapZoom] = useState<number>(6);

  // Pin creation modal state
  const [newPinCoords, setNewPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newPinTitle, setNewPinTitle] = useState("");
  const [newPinCategory, setNewPinCategory] = useState<"visited" | "wishlist" | "favorite">("visited");
  const [newPinNote, setNewPinNote] = useState("");

  const handleCountryClick = (country: Ulke) => {
    onSelectCountry(country);
    setMapTarget(country.koordinat);
    setMapZoom(country.zoom);
    setViewLevel("cities");
  };

  const handleCityClick = (city: CityMapPoint) => {
    onSelectCity(city.id);
    setMapTarget(city.coordinates);
    setMapZoom(8);
  };

  const handleZoomToWorld = () => {
    setViewLevel("countries");
    setMapTarget([42.0, 20.0]); // European/Global center
    setMapZoom(4);
  };

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
      {/* Harita Hiyerarşi & Gezinme Çubuğu */}
      <div className="map-level-nav">
        <div className="level-buttons">
          <button
            className={`level-btn ${viewLevel === "countries" ? "active" : ""}`}
            onClick={handleZoomToWorld}
            type="button"
          >
            {t.countriesMode}
          </button>
          <button
            className={`level-btn ${viewLevel === "cities" ? "active" : ""}`}
            onClick={() => setViewLevel("cities")}
            type="button"
          >
            {t.citiesMode} ({selectedCountry.bayrak} {selectedCountry.ad})
          </button>
        </div>

        {viewLevel === "cities" && (
          <button
            className="zoom-out-btn"
            onClick={handleZoomToWorld}
            type="button"
          >
            {t.zoomOutWorld}
          </button>
        )}
      </div>

      <MapContainer
        center={mapTarget}
        className="real-map"
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={1.0}
        maxZoom={18}
        minZoom={3}
        scrollWheelZoom={true}
        zoom={mapZoom}
        zoomControl={false}
      >
        <TileLayer
          attribution={MAP_STYLES[currentStyle].attribution}
          key={currentStyle}
          url={MAP_STYLES[currentStyle].url}
        />
        <ZoomControl position="bottomright" />
        
        {/* Animated FlyTo transitions */}
        <MapFlyTo target={mapTarget} zoom={mapZoom} />

        <MapClickHandler
          onAddPinClick={(coords) => setNewPinCoords(coords)}
        />

        {/* ÜLKELER MODU PINLERI */}
        {viewLevel === "countries" &&
          countries.map((country) => (
            <Marker
              eventHandlers={{
                click: () => handleCountryClick(country),
              }}
              icon={createCountryIcon(country)}
              key={country.id}
              position={country.koordinat}
            >
              <Popup className="dark-map-popup">
                <div className="popup-card">
                  <h3>{country.bayrak} {country.ad}</h3>
                  <p>📍 {country.sehirSayisi} {t.places}</p>
                  <p>👥 {country.ziyaretSayisi} {t.reviews}</p>
                  <button
                    className="primary-link compact-link"
                    onClick={() => handleCountryClick(country)}
                    style={{ marginTop: 8, width: "100%" }}
                    type="button"
                  >
                    {t.openGuide}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ŞEHİRLER MODU PINLERI */}
        {viewLevel === "cities" &&
          cities.map((city) => {
            const isSelected = city.id === selectedCity?.id;
            return (
              <Marker
                eventHandlers={{
                  click: () => handleCityClick(city),
                }}
                icon={createCityIcon(isSelected, city.name, city.placesCount)}
                key={city.id}
                position={city.coordinates}
              >
                <Popup className="dark-map-popup">
                  <div className="popup-card">
                    <h3>📍 {city.name} ({city.countryName})</h3>
                    <p>🏛️ {city.placesCount} {t.popularPlaces}</p>
                    <p>👥 {city.visits} {t.visitors}</p>
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
                <h3>
                  {pin.category === "visited"
                    ? t.visited
                    : pin.category === "wishlist"
                    ? t.wishlist
                    : t.favorite}
                  : {pin.title}
                </h3>
                {pin.note && <p>💬 "{pin.note}"</p>}
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

      {/* Harita Stili Değiştirici (Sağ Üst) */}
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
            <h3>{t.newPinTitle}</h3>
            <p className="coords-info">
              {newPinCoords.lat.toFixed(4)}, {newPinCoords.lng.toFixed(4)}
            </p>

            <label>
              <span>{t.placeName}</span>
              <input
                autoFocus
                onChange={(e) => setNewPinTitle(e.target.value)}
                placeholder={t.placeNamePlaceholder}
                required
                type="text"
                value={newPinTitle}
              />
            </label>

            <label>
              <span>{t.categoryStatus}</span>
              <div className="category-options">
                <button
                  className={newPinCategory === "visited" ? "selected visited" : ""}
                  onClick={() => setNewPinCategory("visited")}
                  type="button"
                >
                  {t.visited}
                </button>
                <button
                  className={newPinCategory === "wishlist" ? "selected wishlist" : ""}
                  onClick={() => setNewPinCategory("wishlist")}
                  type="button"
                >
                  {t.wishlist}
                </button>
                <button
                  className={newPinCategory === "favorite" ? "selected favorite" : ""}
                  onClick={() => setNewPinCategory("favorite")}
                  type="button"
                >
                  {t.favorite}
                </button>
              </div>
            </label>

            <label>
              <span>Not / Anı</span>
              <textarea
                onChange={(e) => setNewPinNote(e.target.value)}
                placeholder={t.notePlaceholder}
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
                {t.cancel}
              </button>
              <button className="save-btn" type="submit">
                {t.savePin}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
