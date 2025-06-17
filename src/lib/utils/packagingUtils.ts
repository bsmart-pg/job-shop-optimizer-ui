
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
    // Skip jobs without start production datetime
    if (!job.startProductionDateTime) {
      return;
    }

    // Skip jobs without compatible packaging or if it's empty
    if (!job.product.compatiblePackaging || job.product.compatiblePackaging.trim() === '') {
      return;
    }

    // Skip jobs without needed packaging amount
    if (!job.product.neededPackagingAmount || job.product.neededPackagingAmount <= 0) {
      return;
    }

    const date = format(startOfDay(new Date(job.startProductionDateTime)), 'yyyy-MM-dd');
    const packagingType = job.product.compatiblePackaging;
    const neededAmount = job.product.neededPackagingAmount;
    
    if (!packagingNeeds[date]) {
      packagingNeeds[date] = {};
    }
    
    packagingNeeds[date][packagingType] = (packagingNeeds[date][packagingType] || 0) + neededAmount;
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
    // Skip jobs without start production datetime
    if (!job.startProductionDateTime) {
      return;
    }

    // Skip jobs without compatible carrier or if it's empty
    if (!job.product.compatibleCarrier || job.product.compatibleCarrier.trim() === '') {
      return;
    }

    // Skip jobs without needed carrier amount
    if (!job.product.neededCarrierAmount || job.product.neededCarrierAmount <= 0) {
      return;
    }

    const date = format(startOfDay(new Date(job.startProductionDateTime)), 'yyyy-MM-dd');
    const carrierType = job.product.compatibleCarrier;
    const neededAmount = job.product.neededCarrierAmount;
    
    if (!carrierNeeds[date]) {
      carrierNeeds[date] = {};
    }
    
    carrierNeeds[date][carrierType] = (carrierNeeds[date][carrierType] || 0) + neededAmount;
  });

  const result: CarrierRequirement[] = [];
  Object.entries(carrierNeeds).forEach(([date, carrierTypes]) => {
    Object.entries(carrierTypes).forEach(([carrierType, quantity]) => {
      result.push({ date, carrierType, quantity });
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
};
