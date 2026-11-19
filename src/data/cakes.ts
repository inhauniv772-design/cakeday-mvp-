import {
  AnniversaryReminder,
  CakeProduct,
  CakeSizeOption,
  DietaryOption,
  FrostingOption,
} from '../types/cakeday';

export const HERO_CAKE_IMAGE = '/src/assets/images/hero_artisanal_cake_1795099385102.jpg';

export const CAKE_CATALOG: CakeProduct[] = [
  {
    id: 'berry-chantilly',
    name: 'Wild Strawberry Chantilly',
    category: 'Botanical',
    tagline: 'Vanilla bean sponge layered with mascarpone cream and orchard berries',
    description:
      'Three light layers of Madagascar vanilla chiffon soaked in elderflower syrup, filled with whipped mascarpone chantilly and seasonal strawberries.',
    basePrice: 78,
    leadTimeDays: 2,
    imageUrl: '/src/assets/images/cake_berry_chantilly_1795099385573.jpg',
    defaultFrostingId: 'mascarpone',
    notes: ['Madagascar Vanilla', 'Mascarpone Chantilly', 'Fresh Berries'],
  },
  {
    id: 'dark-ganache',
    name: 'Valrhona Satin Ganache',
    category: 'Chocolate',
    tagline: '70% dark chocolate sponge finished in mirror ganache and gold leaf',
    description:
      'Deep cocoa sponge layered with salted espresso caramel and silky 70% Guanaja dark chocolate ganache, finished with edible gold leaf.',
    basePrice: 88,
    leadTimeDays: 2,
    imageUrl: '/src/assets/images/cake_dark_ganache_1795099386081.jpg',
    defaultFrostingId: 'satin-ganache',
    notes: ['70% Dark Cocoa', 'Salted Espresso Caramel', 'Edible Gold Leaf'],
  },
  {
    id: 'matcha-yuzu',
    name: 'Kyoto Matcha & Yuzu Curd',
    category: 'Tea & Citrus',
    tagline: 'Ceremonial Uji matcha sponge balanced with bright yuzu citrus curd',
    description:
      'Tender stone-milled Uji matcha layers paired with tart house-made yuzu curd and light Swiss meringue buttercream.',
    basePrice: 84,
    leadTimeDays: 3,
    imageUrl: '/src/assets/images/cake_matcha_yuzu_1795099386604.jpg',
    defaultFrostingId: 'swiss-meringue',
    notes: ['Uji Matcha', 'House Yuzu Curd', 'Swiss Meringue'],
  },
  {
    id: 'earl-grey-fig',
    name: 'Earl Grey & Roasted Fig',
    category: 'Tea & Citrus',
    tagline: 'Bergamot tea sponge with wildflower honey cream and black mission figs',
    description:
      'Steeped organic bergamot sponge folded with roasted pistachio crunch, honeyed mascarpone frosting, and fresh halved figs.',
    basePrice: 86,
    leadTimeDays: 3,
    imageUrl: '/src/assets/images/cake_earl_grey_fig_1795099386504.jpg',
    defaultFrostingId: 'mascarpone',
    notes: ['Bergamot Tea', 'Wildflower Honey', 'Toasted Pistachio'],
  },
];

export const CAKE_SIZES: CakeSizeOption[] = [
  { id: '6-inch', label: '6" Petite', servings: '8–10 guests', priceDelta: 0 },
  { id: '8-inch', label: '8" Classic', servings: '14–18 guests', priceDelta: 26 },
  { id: 'two-tier', label: 'Two-Tier Celebration', servings: '28–35 guests', priceDelta: 74 },
];

export const FROSTING_OPTIONS: FrostingOption[] = [
  {
    id: 'swiss-meringue',
    label: 'Swiss Meringue Buttercream',
    detail: 'Silky, lightly sweet ivory finish',
    priceDelta: 0,
  },
  {
    id: 'mascarpone',
    label: 'Whipped Mascarpone Cream',
    detail: 'Airy cultured cream with vanilla bean',
    priceDelta: 6,
  },
  {
    id: 'satin-ganache',
    label: 'Satin Dark Ganache',
    detail: 'Rich 70% Valrhona chocolate coat',
    priceDelta: 10,
  },
];

export const DIETARY_OPTIONS: DietaryOption[] = [
  { id: 'standard', label: 'Classic Atelier Recipe', priceDelta: 0 },
  { id: 'eggless', label: 'Eggless Sponge', priceDelta: 8 },
  { id: 'gluten-free', label: 'Almond Flour Gluten-Free', priceDelta: 12 },
];

export const DELIVERY_WINDOWS: string[] = [
  '10:00 AM – 12:00 PM',
  '1:00 PM – 3:00 PM',
  '4:00 PM – 6:00 PM',
];

function formatFutureMonthDay(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

export function getDefaultDeliveryDate(minDays = 3): string {
  const date = new Date();
  date.setDate(date.getDate() + minDays);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getNextOccurrenceDate(monthDay: string): Date {
  const [mmStr, ddStr] = monthDay.split('-');
  const mm = Number(mmStr) || 1;
  const dd = Number(ddStr) || 1;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let candidate = new Date(now.getFullYear(), mm - 1, dd);
  if (candidate < todayMidnight) {
    candidate = new Date(now.getFullYear() + 1, mm - 1, dd);
  }
  return candidate;
}

export function getDaysUntilMonthDay(monthDay: string): number {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextDate = getNextOccurrenceDate(monthDay);
  const diffMs = nextDate.getTime() - todayMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatIsoFromMonthDay(monthDay: string): string {
  const next = getNextOccurrenceDate(monthDay);
  const yyyy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDisplayMonthDay(monthDay: string): string {
  const next = getNextOccurrenceDate(monthDay);
  return next.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const INITIAL_REMINDERS: AnniversaryReminder[] = [
  {
    id: 'rem-1',
    personName: 'Claire & Daniel',
    occasion: 'Anniversary',
    monthDay: formatFutureMonthDay(9),
    yearStarted: 2021,
    leadDays: 7,
    preferredCakeId: 'earl-grey-fig',
    defaultInscription: 'Happy 5th Anniversary',
    note: 'Prefers less-sweet honey mascarpone and fresh figs.',
    active: true,
  },
  {
    id: 'rem-2',
    personName: 'Elena Park',
    occasion: 'Birthday',
    monthDay: formatFutureMonthDay(19),
    yearStarted: 1996,
    leadDays: 10,
    preferredCakeId: 'matcha-yuzu',
    defaultInscription: 'Happy Birthday Elena',
    note: 'Loves bright citrus curd; include gold taper candles.',
    active: true,
  },
  {
    id: 'rem-3',
    personName: 'Marcus & Priya',
    occasion: 'Milestone',
    monthDay: formatFutureMonthDay(44),
    yearStarted: 2024,
    leadDays: 14,
    preferredCakeId: 'dark-ganache',
    defaultInscription: 'Two Years in the Studio',
    note: 'Studio founding celebration for 15 guests.',
    active: true,
  },
];
