
import React from "react";
import { Job } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Package } from "lucide-react";

interface StockDoneJobsProps {
  jobs: Job[];
}

export const StockDoneJobs = ({ jobs }: StockDoneJobsProps) => {
  if (!jobs || jobs.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Package className="h-5 w-5" />
          Stock Done Jobs ({jobs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Used Stock</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>{job.product.name}</TableCell>
                <TableCell>{job.customerName}</TableCell>
                <TableCell>
                  {job.usedStock !== undefined ? job.usedStock : "N/A"}
                </TableCell>
                <TableCell>
                  {job.dueDateTime 
                    ? format(new Date(job.dueDateTime), "MMM d, yyyy")
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
