import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HospitalSearchFormProps {
  onSearch: (location: string, searchType: string) => void;
  isLoading?: boolean;
}

const searchTypes = [
  { value: "hospitals in", label: "Hospitals in" },
  { value: "hospitals near", label: "Hospitals near" },
  { value: "clinics in", label: "Clinics in" },
  { value: "pharmacies near", label: "Pharmacies near" },
];

export function HospitalSearchForm({ onSearch, isLoading }: HospitalSearchFormProps) {
  const [location, setLocation] = useState("");
  const [searchType, setSearchType] = useState("hospitals in");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location.trim(), searchType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city, area, or address..."
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="searchType">Search Type</Label>
          <Select value={searchType} onValueChange={setSearchType} disabled={isLoading}>
            <SelectTrigger id="searchType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {searchTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!location.trim() || isLoading}
        className="w-full sm:w-auto"
      >
        <Search className="mr-2 h-4 w-4" />
        {isLoading ? "Searching..." : "Search Hospitals"}
      </Button>
    </form>
  );
}
