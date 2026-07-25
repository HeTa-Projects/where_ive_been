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
import { ulkeBayrakUrl } from "./gezi-verileri";
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
    name: "🗺️ Canlı Harita & Sınırlar (HD)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    lightUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  dark: {
    name: "🌙 Gece Haritası",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    lightUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  topo: {
    name: "🏔️ Topoğrafya & Sınırlar",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    lightUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri World Topo',
  },
  satellite: {
    name: "🛰️ Canlı Uydu Görünümü",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    lightUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri World Imagery',
  },
};

function createCountryIcon(country: Ulke) {
  const flagUrl = ulkeBayrakUrl(country.id);
  return L.divIcon({
    className: "custom-country-pin-wrapper",
    html: `
      <div class="country-bubble">
        <img src="${flagUrl}" alt="${country.ad}" class="flag-icon-img" />
        <span class="country-name">${country.ad}</span>
      </div>
    `,
    iconAnchor: [60, 18],
    iconSize: [120, 36],
    popupAnchor: [0, -18],
  });
}

function createCityIcon(isSelected: boolean, cityName: string, placesCount: number, countryId?: string) {
  const flagUrl = countryId ? ulkeBayrakUrl(countryId) : "";
  return L.divIcon({
    className: "custom-city-pin-wrapper",
    html: `
      <div class="city-bubble ${isSelected ? "active" : ""}">
        ${flagUrl ? `<img src="${flagUrl}" alt="${cityName}" class="flag-icon-img" />` : `<span class="city-flag">📍</span>`}
        <span class="city-name">${cityName}</span>
        <span class="city-count">${placesCount}</span>
      </div>
    `,
    iconAnchor: [60, 18],
    iconSize: [120, 36],
    popupAnchor: [0, -18],
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
    map.flyTo(target, zoom, { duration: 1.2, animate: true });
  }, [map, target[0], target[1], zoom]);
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
  countries,
  cities,
  selectedCountry,
  selectedCity,
  userPins = [],
  isLoggedIn = false,
  onSelectCountry,
  onSelectCity,
  onAddNewUserPin,
  onAuthRequired,
}: {
  countries: Ulke[];
  cities: CityMapPoint[];
  selectedCountry: Ulke;
  selectedCity?: CityMapPoint;
  userPins?: UserPin[];
  isLoggedIn?: boolean;
  onSelectCountry: (country: Ulke) => void;
  onSelectCity: (cityId: string) => void;
  onAddNewUserPin?: (pin: Omit<UserPin, "id">) => void;
  onAuthRequired?: () => void;
}) {
  const { theme, t } = useThemeAndLang();
  const [currentStyle, setCurrentStyle] =
    useState<keyof typeof MAP_STYLES>("voyager");
  const [activeCountryId, setActiveCountryId] = useState<string | null>(null);
  const [mapTarget, setMapTarget] = useState<[number, number]>([38.0, 20.0]);
  const [mapZoom, setMapZoom] = useState<number>(4);

  const activeTileUrl =
    theme === "light"
      ? MAP_STYLES[currentStyle].lightUrl
      : MAP_STYLES[currentStyle].url;

  // New Pin Modal State
  const [newPinCoords, setNewPinCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [newPinTitle, setNewPinTitle] = useState("");
  const [newPinCategory, setNewPinCategory] = useState<
    "visited" | "wishlist" | "favorite"
  >("visited");
  const [newPinNote, setNewPinNote] = useState("");

  const handleCountryClick = (country: Ulke) => {
    onSelectCountry(country);
    setMapTarget([country.koordinat[0], country.koordinat[1]]);
    setMapZoom(country.zoom || 6);
  };

  const handleShowCountryCities = (country: Ulke) => {
    setActiveCountryId(country.id);
    onSelectCountry(country);
    setMapTarget([country.koordinat[0], country.koordinat[1]]);
    setMapZoom(country.zoom || 8);
  };

  const handleCityClick = (city: CityMapPoint) => {
    onSelectCity(city.id);
    setMapTarget(city.coordinates);
    setMapZoom(9);
  };

  const handleZoomToWorld = () => {
    setActiveCountryId(null);
    setMapTarget([38.0, 20.0]);
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
      {/* Harita Katman Değiştirici & Dünya Görünümü Butonu */}
      <div className="map-level-nav">
        <button
          className="zoom-out-btn"
          onClick={handleZoomToWorld}
          type="button"
        >
          🌍 {t.zoomOutWorld}
        </button>
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
          key={`${currentStyle}-${theme}`}
          url={activeTileUrl}
        />
        <ZoomControl position="bottomright" />
        
        {/* Animated FlyTo transitions */}
        <MapFlyTo target={mapTarget} zoom={mapZoom} />

        <MapClickHandler
          onAddPinClick={(coords) => setNewPinCoords(coords)}
        />

        {/* TÜM ÜLKE PINLERİ */}
        {countries.map((country) => (
          <Marker
            eventHandlers={{
              click: () => handleCountryClick(country),
            }}
            icon={createCountryIcon(country)}
            key={country.id}
            position={country.koordinat}
          >
            <Popup autoPan={false} className="dark-map-popup">
              <div className="popup-card">
                <h3>
                  <img
                    alt={country.ad}
                    className="popup-flag-img"
                    src={ulkeBayrakUrl(country.id)}
                  />
                  {country.ad}
                </h3>
                <p>📍 {country.sehirSayisi} {t.places} • 👥 {country.ziyaretSayisi} {t.reviews}</p>

                <div className="country-quick-actions">
                  <button
                    className="quick-pin-btn visited"
                    onClick={() => {
                      if (!isLoggedIn) {
                        onAuthRequired?.();
                        return;
                      }
                      if (onAddNewUserPin) {
                        onAddNewUserPin({
                          lat: country.koordinat[0],
                          lng: country.koordinat[1],
                          title: `${country.bayrak} ${country.ad}`,
                          category: "visited",
                          note: `${country.ad} ülkesine gidildi.`,
                        });
                      }
                    }}
                    type="button"
                  >
                    ✅ {t.visited}
                  </button>

                  <button
                    className="quick-pin-btn wishlist"
                    onClick={() => {
                      if (!isLoggedIn) {
                        onAuthRequired?.();
                        return;
                      }
                      if (onAddNewUserPin) {
                        onAddNewUserPin({
                          lat: country.koordinat[0],
                          lng: country.koordinat[1],
                          title: `${country.bayrak} ${country.ad}`,
                          category: "wishlist",
                          note: `${country.ad} ülkesi gezi listesinde.`,
                        });
                      }
                    }}
                    type="button"
                  >
                    📌 {t.wishlist}
                  </button>

                  <button
                    className="quick-pin-btn favorite"
                    onClick={() => {
                      if (!isLoggedIn) {
                        onAuthRequired?.();
                        return;
                      }
                      if (onAddNewUserPin) {
                        onAddNewUserPin({
                          lat: country.koordinat[0],
                          lng: country.koordinat[1],
                          title: `${country.bayrak} ${country.ad}`,
                          category: "favorite",
                          note: `${country.ad} ülkesi favorilerde.`,
                        });
                      }
                    }}
                    type="button"
                  >
                    ❤️ {t.favorite}
                  </button>
                </div>

                <button
                  className="outline-link compact-link"
                  onClick={() => handleShowCountryCities(country)}
                  style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
                  type="button"
                >
                  🔍 {country.ad} Şehirlerini Gör
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ŞEHİR PINLERİ - Sadece bir ülkeye Yakınlaş denildiğinde görünür */}
        {activeCountryId &&
          cities
            .filter((city) => city.countryId === activeCountryId)
            .map((city) => {
              const isSelected = city.id === selectedCity?.id;
              return (
                <Marker
                  eventHandlers={{
                    click: () => handleCityClick(city),
                  }}
                  icon={createCityIcon(
                    isSelected,
                    city.name,
                    city.placesCount,
                    city.countryId,
                  )}
                  key={city.id}
                  position={city.coordinates}
                >
                  <Popup autoPan={false} className="dark-map-popup">
                    <div className="popup-card">
                      <h3>📍 {city.name} ({city.countryName})</h3>
                      <p>🏛️ {city.placesCount} {t.popularPlaces}</p>
                      <p>👥 {city.visits} {t.visitors}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

        {/* Kullanıcı Pinleri */}
        {userPins.map((pin) => (
          <Marker
            icon={createUserPinIcon(pin.category)}
            key={pin.id}
            position={[pin.lat, pin.lng]}
          >
            <Popup autoPan={false} className="dark-map-popup">
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
      </MapContainer>

      {/* Harita Stili Seçim Paneli (Sağ Üst) */}
      <div className="map-style-selector">
        {Object.entries(MAP_STYLES).map(([key, style]) => (
          <button
            className={`style-btn ${currentStyle === key ? "active" : ""}`}
            key={key}
            onClick={() => setCurrentStyle(key as keyof typeof MAP_STYLES)}
            type="button"
          >
            {style.name}
          </button>
        ))}
      </div>

      {/* Yeni Pin Ekleme Modalı */}
      {newPinCoords && (
        <div className="pin-modal-overlay">
          <div className="pin-modal">
            <button
              className="modal-close"
              onClick={() => setNewPinCoords(null)}
              type="button"
            >
              ✕
            </button>
            <h3>📍 Yeni Harita Pini Ekle</h3>
            <p className="coords-info">
              Koordinat: {newPinCoords.lat.toFixed(4)}, {newPinCoords.lng.toFixed(4)}
            </p>

            <form onSubmit={handleCreatePin}>
              <label>
                Mekan / Şehir Adı
                <input
                  autoFocus
                  onChange={(e) => setNewPinTitle(e.target.value)}
                  placeholder="Örn: Kapadokya Balon Seyir Tepesi"
                  required
                  value={newPinTitle}
                />
              </label>

              <label>
                Pin Türü
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
                Notun (İsteğe Bağlı)
                <textarea
                  onChange={(e) => setNewPinNote(e.target.value)}
                  placeholder="Bu harika mekan hakkındaki anın veya notun..."
                  rows={3}
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
                <button className="primary-link" type="submit">
                  Pini Kaydet ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
