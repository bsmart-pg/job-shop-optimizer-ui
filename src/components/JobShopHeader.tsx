
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function JobShopHeader() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-3xl">Job Shop Planer</CardTitle>
        <CardDescription className="text-lg">
          Generiere den optimalen Plan für deine Produktionslinien.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
