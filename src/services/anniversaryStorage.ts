import type {
  Anniversary,
  AnniversaryCategory,
  AnniversaryFormInput,
} from '../types';
import { addDaysToDateParts, formatDateParts, getTodayDateParts } from '../utils/dateUtils';

const ANNIVERSARIES_STORAGE_KEY = 'cakeday_anniversaries_v1';
const INITIALIZED_USERS_STORAGE_KEY = 'cakeday_anniversaries_seeded_users_v1';

export const CATEGORY_LABELS: Record<AnniversaryCategory, string> = {
  birthday: '생일',
  couple: '연인 기념일',
  family: '가족 기념일',
  friend: '친구 기념일',
  other: '기타',
};

export const CATEGORY_OPTIONS: Array<{
  id: AnniversaryCategory;
  label: string;
}> = [
  { id: 'birthday', label: '생일' },
  { id: 'couple', label: '연인 기념일' },
  { id: 'family', label: '가족 기념일' },
  { id: 'friend', label: '친구 기념일' },
  { id: 'other', label: '기타' },
];

function readAllAnniversaries(): Anniversary[] {
  try {
    const raw = window.localStorage.getItem(ANNIVERSARIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Anniversary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllAnniversaries(items: Anniversary[]): void {
  try {
    window.localStorage.setItem(ANNIVERSARIES_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors in restricted environments
  }
}

function readInitializedUsers(): string[] {
  try {
    const raw = window.localStorage.getItem(INITIALIZED_USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function markUserInitialized(userId: string): void {
  const existing = readInitializedUsers();
  if (existing.includes(userId)) return;
  try {
    window.localStorage.setItem(
      INITIALIZED_USERS_STORAGE_KEY,
      JSON.stringify([...existing, userId])
    );
  } catch {
    // Ignore storage errors
  }
}

function buildInitialDemoSeed(userId: string): Anniversary[] {
  const today = getTodayDateParts();
  const nowIso = new Date().toISOString();

  if (userId === 'demo-dual-001') {
    return [
      {
        id: `anniv-seed-${userId}-1`,
        userId,
        title: '친구 생일',
        category: 'friend',
        date: formatDateParts(addDaysToDateParts(today, 3)),
        memo: '레터링 케이크 문구 미리 정하기',
        repeatAnnually: true,
        isDemoSeed: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: `anniv-seed-${userId}-2`,
        userId,
        title: '부모님 결혼기념일',
        category: 'family',
        date: formatDateParts(addDaysToDateParts(today, 12)),
        memo: '생화 장식 커스텀 케이크 알아보기',
        repeatAnnually: true,
        isDemoSeed: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: `anniv-seed-${userId}-3`,
        userId,
        title: '나의 생일',
        category: 'birthday',
        date: formatDateParts(addDaysToDateParts(today, 25)),
        memo: '작은 1호 사이즈 케이크 예약 예정',
        repeatAnnually: true,
        isDemoSeed: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];
  }

  if (userId === 'demo-consumer-002') {
    return [
      {
        id: `anniv-seed-${userId}-1`,
        userId,
        title: '어머니 생신',
        category: 'family',
        date: formatDateParts(addDaysToDateParts(today, 5)),
        memo: '얼그레이 시폰 케이크 예약 예정',
        repeatAnnually: true,
        isDemoSeed: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: `anniv-seed-${userId}-2`,
        userId,
        title: '1주년 기념일',
        category: 'couple',
        date: formatDateParts(addDaysToDateParts(today, 19)),
        memo: '하트형 미니 레터링 케이크 알아보기',
        repeatAnnually: true,
        isDemoSeed: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];
  }

  return [];
}

export function resetDemoPresetAnniversaries(presetUserIds: string[]): number {
  const presetSet = new Set(presetUserIds);
  const preservedUserItems = readAllAnniversaries().filter(
    (item) => !presetSet.has(item.userId)
  );
  const freshSeeds = presetUserIds.flatMap((id) => buildInitialDemoSeed(id));
  writeAllAnniversaries([...preservedUserItems, ...freshSeeds]);

  const existingInitialized = readInitializedUsers().filter(
    (id) => !presetSet.has(id)
  );
  try {
    window.localStorage.setItem(
      INITIALIZED_USERS_STORAGE_KEY,
      JSON.stringify([...existingInitialized, ...presetUserIds])
    );
  } catch {
    // Ignore storage errors
  }

  return freshSeeds.length;
}

export function loadUserAnniversaries(userId: string): Anniversary[] {
  const all = readAllAnniversaries();
  const initialized = readInitializedUsers();

  if (!initialized.includes(userId)) {
    const existingForUser = all.filter((item) => item.userId === userId);
    if (existingForUser.length === 0) {
      const seed = buildInitialDemoSeed(userId);
      if (seed.length > 0) {
        writeAllAnniversaries([...all, ...seed]);
      }
      markUserInitialized(userId);
      return seed;
    }
    markUserInitialized(userId);
    return existingForUser;
  }

  return all.filter((item) => item.userId === userId);
}

export function createUserAnniversary(
  userId: string,
  input: AnniversaryFormInput
): Anniversary[] {
  const nowIso = new Date().toISOString();
  const newItem: Anniversary = {
    id: `anniv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    title: input.title.trim(),
    category: input.category,
    date: input.date,
    memo: input.memo.trim(),
    repeatAnnually: input.repeatAnnually,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const all = readAllAnniversaries();
  const updatedAll = [...all, newItem];
  writeAllAnniversaries(updatedAll);
  markUserInitialized(userId);
  return updatedAll.filter((item) => item.userId === userId);
}

export function updateUserAnniversary(
  userId: string,
  anniversaryId: string,
  input: AnniversaryFormInput
): Anniversary[] {
  const nowIso = new Date().toISOString();
  const all = readAllAnniversaries();
  const updatedAll = all.map((item) => {
    if (item.id !== anniversaryId || item.userId !== userId) {
      return item;
    }
    const dateChanged = item.date !== input.date;
    return {
      ...item,
      title: input.title.trim(),
      category: input.category,
      date: input.date,
      memo: input.memo.trim(),
      repeatAnnually: input.repeatAnnually,
      acknowledgedOccurrenceKey: dateChanged
        ? undefined
        : item.acknowledgedOccurrenceKey,
      updatedAt: nowIso,
    };
  });

  writeAllAnniversaries(updatedAll);
  return updatedAll.filter((item) => item.userId === userId);
}

export function deleteUserAnniversary(
  userId: string,
  anniversaryId: string
): Anniversary[] {
  const all = readAllAnniversaries();
  const updatedAll = all.filter(
    (item) => !(item.id === anniversaryId && item.userId === userId)
  );
  writeAllAnniversaries(updatedAll);
  markUserInitialized(userId);
  return updatedAll.filter((item) => item.userId === userId);
}

export function toggleAnniversaryAcknowledgement(
  userId: string,
  anniversaryId: string,
  occurrenceDate: string
): Anniversary[] {
  const all = readAllAnniversaries();
  const updatedAll = all.map((item) => {
    if (item.id !== anniversaryId || item.userId !== userId) {
      return item;
    }
    const isAlreadyAcknowledged =
      item.acknowledgedOccurrenceKey === occurrenceDate;
    return {
      ...item,
      acknowledgedOccurrenceKey: isAlreadyAcknowledged
        ? undefined
        : occurrenceDate,
      updatedAt: new Date().toISOString(),
    };
  });

  writeAllAnniversaries(updatedAll);
  return updatedAll.filter((item) => item.userId === userId);
}
