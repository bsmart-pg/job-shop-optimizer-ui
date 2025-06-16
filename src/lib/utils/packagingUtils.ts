
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
    // Only process jobs that are actually scheduled (have line AND start production time)
    if (!job.line || !job.startProductionDateTime) {
      return;
    }

    const quantity = job.quantity;
    if (!quantity || quantity <= 0) {
      return;
    }

    // Only calculate packaging if the product has compatible packaging and needed amount
    if (!job.product.compatiblePackaging || !job.product.neededPackagingAmount) {
      return;
    }

    const date = format(startOfDay(new Date(job.startProductionDateTime)), 'yyyy-MM-dd');
    const packagingType = job.product.compatiblePackaging;
    const packagingNeeded = Math.ceil(quantity / job.product.neededPackagingAmount);
    
    if (!packagingNeeds[date]) {
      packagingNeeds[date] = {};
    }
    
    packagingNeeds[date][packagingType] = (packagingNeeds[date][packagingType] || 0) + packagingNeeded;
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
    // Only process jobs that are actually scheduled (have line AND start production time)
    if (!job.line || !job.startProductionDateTime) {
      return;
    }

    const quantity = job.quantity;
    if (!quantity || quantity <= 0) {
      return;
    }

    const date = format(startOfDay(new Date(job.startProductionDateTime)), 'yyyy-MM-dd');
    const carrierType = job.product.compatibleCarrier;
    
    if (!carrierType) {
      return;
    }
    
    let carriersNeeded = 0;
    
    if (job.product.compatiblePackaging && job.product.neededPackagingAmount) {
      // Product has packaging: calculate carriers based on packaging count
      const packagingNeeded = Math.ceil(quantity / job.product.neededPackagingAmount);
      carriersNeeded = Math.ceil(packagingNeeded / job.product.neededCarrierAmount);
    } else {
      // Product has no packaging: calculate carriers directly
      carriersNeeded = Math.ceil(quantity / job.product.neededCarrierAmount);
    }
    
    if (!carrierNeeds[date]) {
      carrierNeeds[date] = {};
    }
    
    carrierNeeds[date][carrierType] = (carrierNeeds[date][carrierType] || 0) + carriersNeeded;
  });

  const result: CarrierRequirement[] = [];
  Object.entries(carrierNeeds).forEach(([date, carrierTypes]) => {
    Object.entries(carrierTypes).forEach(([carrierType, quantity]) => {
      result.push({ date, carrierType, quantity });
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
};
