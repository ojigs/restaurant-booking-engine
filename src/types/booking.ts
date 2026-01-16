import { PriceResult } from "./pricing";

export interface AvailableSlot {
  startTime: string; // ISO String
  endTime: string; // ISO String
  available: boolean;
  priceDetails: PriceResult;
}
