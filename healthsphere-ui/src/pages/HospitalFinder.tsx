import { useState } from "react";
import { Type, Map, LayoutGrid, List } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HospitalSearchForm } from "@/components/Hospitals/HospitalSearchForm";
import { HospitalResultsTable, type Hospital } from "@/components/Hospitals/HospitalResultsTable";
import { MapSelector } from "@/components/Hospitals/MapSelector";
import { ScrapingLogs, type ScrapingLog } from "@/components/Hospitals/ScrapingLogs";
import { StatusBanner } from "@/components/common/StatusBanner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { searchHospitals as searchHospitalsAPI, geocodeLocation } from "@/services/api";

async function searchHospitals(
  location: string,
  searchType: string,
  onLog: (log: Omit<ScrapingLog, "id">) => void
): Promise<Hospital[]> {
  onLog({ message: `Starting search: "${searchType} ${location}"`, timestamp: new Date(), type: "info" });
  
  try {
    onLog({ message: "Initializing browser...", timestamp: new Date(), type: "info" });
    onLog({ message: "Navigating to Google Maps...", timestamp: new Date(), type: "info" });
    
    const result = await searchHospitalsAPI(location, searchType);
    
    if (result.scraper_output) {
      // Parse scraper output for logs
      const outputLines = result.scraper_output.split('\n');
      for (const line of outputLines) {
        if (line.trim()) {
          onLog({ message: line.trim(), timestamp: new Date(), type: "info" });
        }
      }
    }
    
    onLog({ message: `Found ${result.count} listings`, timestamp: new Date(), type: "success" });
    onLog({ message: "Data extraction complete!", timestamp: new Date(), type: "success" });
    
    // Transform API response to match Hospital interface
    const hospitals: Hospital[] = result.hospitals.map((h, idx) => ({
      id: idx.toString(),
      name: h.name || 'Unknown',
      phone: h.phone || null,
      website: h.website || null,
      address: h.address || 'No address provided'
    }));
    
    return hospitals;
  } catch (error) {
    onLog({ 
      message: error instanceof Error ? error.message : "Search failed", 
      timestamp: new Date(), 
      type: "error" 
    });
    throw error;
  }
}

export default function HospitalFinder() {
  const [activeTab, setActiveTab] = useState("text");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const addLog = (log: Omit<ScrapingLog, "id">) => {
    setLogs((prev) => [...prev, { ...log, id: Date.now().toString() }]);
  };

  const handleTextSearch = async (location: string, searchType: string) => {
    setError(null);
    setIsLoading(true);
    setLogs([]);
    setHospitals([]);

    try {
      const results = await searchHospitals(location, searchType, addLog);
      setHospitals(results);
    } catch (err) {
      setError("Failed to search hospitals. Please try again.");
      addLog({ message: "Error occurred during search", timestamp: new Date(), type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapSearch = async () => {
    if (!selectedMapLocation) return;

    setError(null);
    setIsLoading(true);
    setLogs([]);
    setHospitals([]);

    try {
      // Get address from coordinates if not already available
      let address = selectedMapLocation.address;
      if (!address) {
        addLog({ message: "Getting location address...", timestamp: new Date(), type: "info" });
        address = await geocodeLocation(selectedMapLocation.lat, selectedMapLocation.lng);
      }
      
      const results = await searchHospitals(
        address,
        "in or near",
        addLog
      );
      setHospitals(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search hospitals. Please try again.";
      setError(errorMessage);
      addLog({ message: "Error occurred during search", timestamp: new Date(), type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedMapLocation({ lat, lng, address });
  };

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Find Hospitals
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search for hospitals, clinics, and healthcare facilities near you
        </p>
      </div>

      <div className="space-y-6">
        {/* Search Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Search Method</CardTitle>
            <CardDescription>
              Choose how you want to find healthcare facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Use Text
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Use Map
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-0">
                <HospitalSearchForm
                  onSearch={handleTextSearch}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="map" className="mt-0 space-y-4">
                <MapSelector
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedMapLocation}
                  isLoading={isLoading}
                />
                
                {selectedMapLocation && (
                  <Button
                    onClick={handleMapSearch}
                    disabled={isLoading}
                    variant="hero"
                  >
                    Search Hospitals Near This Location
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Scraping Logs */}
        {logs.length > 0 && <ScrapingLogs logs={logs} isActive={isLoading} />}

        {/* Error Banner */}
        {error && (
          <StatusBanner
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="py-12">
            <LoadingSpinner size="lg" text="Searching for hospitals..." />
          </Card>
        )}

        {/* Results */}
        {!isLoading && hospitals.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    Found {hospitals.length} healthcare facilities
                  </CardDescription>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "cards" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <HospitalResultsTable hospitals={hospitals} viewMode={viewMode} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
