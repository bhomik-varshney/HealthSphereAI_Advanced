import { useState, useEffect, useRef } from "react";
import { MapPin, AlertTriangle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/common/StatusBanner";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { geocodeLocation } from "@/services/api";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
  isLoading?: boolean;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapSelector({
  onLocationSelect,
  selectedLocation,
  isLoading,
}: MapSelectorProps) {
  const [error, setError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default: New Delhi
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const mapRef = useRef<any>(null);

  const handleMapClick = async (lat: number, lng: number) => {
    setError(null);
    setMarkerPosition([lat, lng]);
    setMapCenter([lat, lng]);

    try {
      // Geocode the clicked location to get address
      const address = await geocodeLocation(lat, lng);
      onLocationSelect(lat, lng, address);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get address";
      setError(errorMsg);
      onLocationSelect(lat, lng, `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleGetCurrentLocation = () => {
    setError(null);
    setGettingLocation(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setMapCenter([latitude, longitude]);
        setMarkerPosition([latitude, longitude]);
        
        try {
          const address = await geocodeLocation(latitude, longitude);
          onLocationSelect(latitude, longitude, address);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Failed to get address";
          setError(errorMsg);
          onLocationSelect(latitude, longitude, `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        
        setGettingLocation(false);
      },
      (err) => {
        setError("Unable to retrieve your location. Please enable location permissions.");
        setGettingLocation(false);
      }
    );
  };

  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.lat, selectedLocation.lng]);
      setMarkerPosition([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation]);

  return (
    <div className="space-y-4">
      {/* Interactive Map */}
      <div className="relative">
        <Card className="relative h-[500px] overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {markerPosition && (
              <Marker position={markerPosition}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">Selected Location</p>
                    <p className="text-xs text-muted-foreground">
                      {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </Card>
        
        {/* Get Current Location Button - Floating over map */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Button
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation || isLoading}
            variant="default"
            size="sm"
            className="shadow-lg"
          >
            <Navigation className="mr-2 h-4 w-4" />
            {gettingLocation ? "Locating..." : "My Location"}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border bg-muted/50 p-3">
        <p className="text-sm text-muted-foreground">
          <MapPin className="mr-1 inline h-4 w-4" />
          <strong>Tip:</strong> Click anywhere on the map to search for hospitals at that location, or use the "My Location" button to search near you.
        </p>
      </div>

      {/* Selected location display */}
      {selectedLocation && (
        <Card className="border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Selected Location</p>
              <p className="text-sm text-muted-foreground">
                {selectedLocation.address}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Error display */}
      {error && (
        <StatusBanner
          type="warning"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
}
