import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import { PinItem } from '../types/travel';

interface TravelMapProps {
  pins: PinItem[];
  onLongPress?: (coords: { latitude: number; longitude: number }) => void;
}

function markerColor(category: PinItem['category']) {
  if (category === 'Gittim') return '#10B981';
  if (category === 'İstek') return '#3B82F6';
  return '#EF4444';
}

export function TravelMap({ pins, onLongPress }: TravelMapProps) {
  const html = useMemo(() => {
    const safePins = JSON.stringify(
      pins.map((pin) => ({
        title: pin.title,
        city: `${pin.cityName}, ${pin.countryName}`,
        lat: pin.latitude,
        lng: pin.longitude,
        color: markerColor(pin.category),
      }))
    );

    return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css">
  <style>
    html, body, #map { height: 100%; margin: 0; background: #0F172A; }
    .pin-marker { width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 6px 18px rgba(0,0,0,.35); }
    .leaflet-popup-content-wrapper { border-radius: 10px; }
    .leaflet-popup-content { font: 13px system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
    .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large { background: rgba(14,165,233,.24); }
    .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div { background: #0EA5E9; color: white; font-weight: 800; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
  <script>
    const pins = ${safePins};
    const center = pins.length ? [pins[0].lat, pins[0].lng] : [39, 35];
    const map = L.map('map', { zoomControl: false }).setView(center, pins.length > 1 ? 3 : 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    const bounds = [];
    const clusterLayer = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 42 });
    let longPressTimer = null;
    function sendCoords(latlng) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map-long-press', latitude: latlng.lat, longitude: latlng.lng }));
      }
    }
    map.on('mousedown touchstart', function(event) {
      longPressTimer = setTimeout(function() { sendCoords(event.latlng); }, 650);
    });
    map.on('mouseup mousemove touchend touchmove', function() {
      if (longPressTimer) clearTimeout(longPressTimer);
    });
    pins.forEach((pin) => {
      const icon = L.divIcon({
        className: '',
        html: '<div class="pin-marker" style="background:' + pin.color + '"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      clusterLayer.addLayer(L.marker([pin.lat, pin.lng], { icon }).bindPopup('<strong>' + pin.title + '</strong><br>' + pin.city));
      bounds.push([pin.lat, pin.lng]);
    });
    map.addLayer(clusterLayer);
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [28, 28] });
  </script>
</body>
</html>`;
  }, [pins]);

  if (!pins.length) {
    return (
      <View style={styles.emptyMap}>
        <Text style={styles.emptyTitle}>Haritada gösterecek pin yok</Text>
        <Text style={styles.emptyText}>İlk yerini eklediğinde burada canlı harita görünecek.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'map-long-press') {
              onLongPress?.({ latitude: Number(message.latitude), longitude: Number(message.longitude) });
            }
          } catch {
            // Ignore non-JSON map messages.
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 230, marginHorizontal: 16, marginTop: 12, marginBottom: 8, overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A' },
  webview: { backgroundColor: '#0F172A' },
  emptyMap: { height: 180, margin: 16, borderRadius: 18, borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#111C2F' },
  emptyTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  emptyText: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 6 },
});
