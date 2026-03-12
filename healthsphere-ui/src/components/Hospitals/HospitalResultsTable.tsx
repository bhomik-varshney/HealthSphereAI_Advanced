import { ExternalLink, Phone, MapPin, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Hospital {
  id: string;
  name: string;
  phone: string | null;
  website: string | null;
  address: string;
}

interface HospitalResultsTableProps {
  hospitals: Hospital[];
  viewMode?: "table" | "cards";
}

export function HospitalResultsTable({
  hospitals,
  viewMode = "table",
}: HospitalResultsTableProps) {
  if (hospitals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          No hospitals found
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Try searching with a different location or search type.
        </p>
      </div>
    );
  }

  if (viewMode === "cards") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hospitals.map((hospital) => (
          <Card key={hospital.id} variant="interactive" className="fade-in">
            <CardContent className="p-4">
              <h3 className="font-display font-semibold text-foreground line-clamp-2">
                {hospital.name}
              </h3>
              
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-2">{hospital.address}</span>
                </div>
                
                {hospital.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <a
                      href={`tel:${hospital.phone}`}
                      className="hover:text-primary hover:underline"
                    >
                      {hospital.phone}
                    </a>
                  </div>
                )}
              </div>
              
              {hospital.website && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                >
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Name</TableHead>
            <TableHead className="min-w-[150px]">Phone</TableHead>
            <TableHead className="min-w-[100px]">Website</TableHead>
            <TableHead className="min-w-[250px]">Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hospitals.map((hospital) => (
            <TableRow key={hospital.id} className="fade-in">
              <TableCell className="font-medium">{hospital.name}</TableCell>
              <TableCell>
                {hospital.phone ? (
                  <a
                    href={`tel:${hospital.phone}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {hospital.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                {hospital.website ? (
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Visit
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell className="max-w-[300px]">
                <span className="line-clamp-2 text-muted-foreground">
                  {hospital.address}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
