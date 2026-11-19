import { DEMO_PRESET_USER_IDS } from '../data/cakedayData';
import { resetDemoPresetAnniversaries } from './anniversaryStorage';
import { resetDemoPresetOrders } from './orderStorage';

export interface DemoResetSummary {
  anniversariesCount: number;
  ordersCount: number;
}

/**
 * Resets ONLY demo preset account data (demo-dual-001, demo-consumer-002, demo-seller-003)
 * back to initial presentation state while strictly preserving any signed-up user data.
 */
export function resetAllDemoTestData(): DemoResetSummary {
  const anniversariesCount = resetDemoPresetAnniversaries(DEMO_PRESET_USER_IDS);
  const ordersCount = resetDemoPresetOrders(DEMO_PRESET_USER_IDS);
  return {
    anniversariesCount,
    ordersCount,
  };
}
