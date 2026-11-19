export type CakeCategory = 'All' | 'Botanical' | 'Chocolate' | 'Tea & Citrus';

export interface CakeProduct {
  id: string;
  name: string;
  category: Exclude<CakeCategory, 'All'>;
  tagline: string;
  description: string;
  basePrice: number;
  leadTimeDays: number;
  imageUrl: string;
  defaultFrostingId: string;
  notes: string[];
}

export interface CakeSizeOption {
  id: string;
  label: string;
  servings: string;
  priceDelta: number;
}

export interface FrostingOption {
  id: string;
  label: string;
  detail: string;
  priceDelta: number;
}

export interface DietaryOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface CustomCakeDraft {
  cakeId: string;
  sizeId: string;
  frostingId: string;
  dietaryId: string;
  inscription: string;
  deliveryDate: string;
  deliveryWindow: string;
  saveAsReminder: boolean;
  reminderTitle: string;
  reminderLeadDays: number;
}

export interface CartItem {
  id: string;
  cakeId: string;
  cakeName: string;
  imageUrl: string;
  sizeLabel: string;
  frostingLabel: string;
  dietaryLabel: string;
  inscription: string;
  deliveryDate: string;
  deliveryWindow: string;
  unitPrice: number;
  quantity: number;
}

export type ReminderOccasion = 'Anniversary' | 'Birthday' | 'Milestone';

export interface AnniversaryReminder {
  id: string;
  personName: string;
  occasion: ReminderOccasion;
  monthDay: string; // MM-DD
  yearStarted?: number;
  leadDays: number;
  preferredCakeId: string;
  defaultInscription: string;
  note: string;
  active: boolean;
}

export interface CakeOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: 'Delivery' | 'Atelier Pickup';
  deliveryAddress: string;
  paymentMethod: 'Card' | 'Pay on Delivery';
  items: CartItem[];
  totalAmount: number;
  status: 'Confirmed' | 'In Kitchen' | 'Scheduled';
}
