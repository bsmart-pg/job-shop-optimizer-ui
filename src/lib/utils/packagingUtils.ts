
import { Job } from '../types';
import { format, startOfDay } from 'date-fns';

export interface PackagingRequirement {
  date: string;
  packagingType: string;
  quantity: number;
}

export interface CarrierRequirement {
  date: string;
  carrierType: string;
  quantity: number;
}

export interface DailyRequirements {
  packaging: Record<string, Record<string, number>>;
  carriers: Record<string, Record<string, number>>;
}

export const calculateDailyPackagingNeeds = (jobs: Job[]): PackagingRequirement[] => {
  const packagingNeeds: Record<string, Record<string, number>> = {};

  jobs.forEach(job => {
    // Skip jobs without assigned lines or start times
    if (!job.line || (!job.startProductionDateTime && !job.startCleaningDateTime)) {
      return;
    }

    const startDateTime = job.startProductionDateTime || job.startCleaningDateTime;
    if (!startDateTime) return;

    const date = format(startOfDay(new Date(startDateTime)), 'yyyy-MM-dd');
    const quantity = job.quantity || 0;
    
    // Skip if quantity is 0 or if product doesn't exist
    if (quantity === 0 || !job.product) return;
    
    // Only calculate packaging if the product has compatible packaging
    if (job.product.compatiblePackaging && job.product.neededPackagingAmount && job.product.neededPackagingAmount > 0) {
      const packagingType = job.product.compatiblePackaging;
      const packagingNeeded = Math.ceil(quantity / job.product.neededPackagingAmount);
      
      if (!packagingNeeds[date]) {
        packagingNeeds[date] = {};
      }
      
      packagingNeeds[date][packagingType] = (packagingNeeds[date][packagingType] || 0) + packagingNeeded;
    }
  });

  const result: PackagingRequirement[] = [];
  Object.entries(packagingNeeds).forEach(([date, packagingTypes]) => {
    Object.entries(packagingTypes).forEach(([packagingType, quantity]) => {
      result.push({ date, packagingType, quantity });
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
};

export const calculateDailyCarrierNeeds = (jobs: Job[]): CarrierRequirement[] => {
  const carrierNeeds: Record<string, Record<string, number>> = {};

  jobs.forEach(job => {
    // Skip jobs without assigned lines or start times
    if (!job.line || (!job.startProductionDateTime && !job.startCleaningDateTime)) {
      return;
    }

    const startDateTime = job.startProductionDateTime || job.startCleaningDateTime;
    if (!startDateTime) return;

    const date = format(startOfDay(new Date(startDateTime)), 'yyyy-MM-dd');
    const quantity = job.quantity || 0;
    
    // Skip if quantity is 0 or if product doesn't exist or if no compatible carrier
    if (quantity === 0 || !job.product || !job.product.compatibleCarrier || !job.product.neededCarrierAmount || job.product.neededCarrierAmount <= 0) {
      return;
    }

    const carrierType = job.product.compatibleCarrier;
    
    let carriersNeeded = 0;
    
    if (job.product.compatiblePackaging && job.product.neededPackagingAmount && job.product.neededPackagingAmount > 0) {
      // Product has packaging: calculate carriers based on packaging count
      const packagingNeeded = Math.ceil(quantity / job.product.neededPackagingAmount);
      carriersNeeded = Math.ceil(packagingNeeded / job.product.neededCarrierAmount);
    } else {
      // Product has no packaging: calculate carriers directly
      carriersNeeded = Math.ceil(quantity / job.product.neededCarrierAmount);
    }
    
    if (carriersNeeded > 0) {
      if (!carrierNeeds[date]) {
        carrierNeeds[date] = {};
      }
      
      carrierNeeds[date][carrierType] = (carrierNeeds[date][carrierType] || 0) + carriersNeeded;
    }
  });

  const result: CarrierRequirement[] = [];
  Object.entries(carrierNeeds).forEach(([date, carrierTypes]) => {
    Object.entries(carrierTypes).forEach(([carrierType, quantity]) => {
      result.push({ date, carrierType, quantity });
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
};
