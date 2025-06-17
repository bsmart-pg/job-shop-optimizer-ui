
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackagingRequirement } from "@/lib/utils/packagingUtils";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface PackagingViewProps {
  requirements: PackagingRequirement[];
}

export function PackagingView({ requirements }: PackagingViewProps) {
  // Group requirements by date
  const groupedByDate = requirements.reduce((acc, req) => {
    if (!acc[req.date]) {
      acc[req.date] = [];
    }
    acc[req.date].push(req);
    return acc;
  }, {} as Record<string, PackagingRequirement[]>);

  // Calculate total packaging per type across all dates
  const totalsByType = requirements.reduce((acc, req) => {
    acc[req.packagingType] = (acc[req.packagingType] || 0) + req.quantity;
    return acc;
  }, {} as Record<string, number>);

  const grandTotal = Object.values(totalsByType).reduce((sum, qty) => sum + qty, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Packmittelbedarf</CardTitle>
      </CardHeader>
      <CardContent>
        {requirements.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Keine Packmittelanforderungen gefunden.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Daily breakdown */}
            <div className="space-y-4">
              {Object.entries(groupedByDate).map(([date, dateRequirements]) => {
                const dailyTotal = dateRequirements.reduce((sum, req) => sum + req.quantity, 0);
                
                return (
                  <div key={date} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">
                        {format(parseISO(date), 'dd.MM.yyyy', { locale: de })}
                      </h3>
                      <Badge variant="secondary">
                        Gesamt: {dailyTotal}
                      </Badge>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Packmitteltyp</TableHead>
                          <TableHead className="text-right">Menge</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dateRequirements.map((req, index) => (
                          <TableRow key={index}>
                            <TableCell>{req.packagingType}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{req.quantity}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Zusammenfassung</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Packmitteltyp</TableHead>
                    <TableHead className="text-right">Gesamtmenge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(totalsByType).map(([type, quantity]) => (
                    <TableRow key={type}>
                      <TableCell className="font-medium">{type}</TableCell>
                      <TableCell className="text-right">
                        <Badge>{quantity}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Gesamtsumme</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default">{grandTotal}</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
