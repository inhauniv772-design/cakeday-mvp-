import React, { useEffect, useState } from 'react';
import { CalendarDays, Home, User } from 'lucide-react';
import { AnniversaryModal } from '../components/AnniversaryModal';
import {
  createUserAnniversary,
  deleteUserAnniversary,
  loadUserAnniversaries,
  toggleAnniversaryAcknowledgement,
  updateUserAnniversary,
} from '../services/anniversaryStorage';
import type {
  Anniversary,
  AnniversaryFormInput,
  AppPage,
  ConsumerTab,
  UserAccount,
  UserRole,
} from '../types';
import { cn } from '../utils/cn';
import { getTodayString } from '../utils/dateUtils';
import { ConsumerCalendarView } from './ConsumerCalendarView';
import { ConsumerHomeView } from './ConsumerHomeView';
import { ConsumerMyPageView } from './ConsumerMyPageView';

interface ConsumerDashboardPageProps {
  user: UserAccount;
  onNavigate: (page: AppPage) => void;
  onSwitchMode: (targetMode: UserRole) => boolean;
  onLogout: () => void;
}

const CONSUMER_TABS: Array<{
  id: ConsumerTab;
  label: string;
  Icon: React.FC<{ className?: string }>;
}> = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'calendar', label: '캘린더', Icon: CalendarDays },
  { id: 'mypage', label: '마이페이지', Icon: User },
];

export const ConsumerDashboardPage: React.FC<ConsumerDashboardPageProps> = ({
  user,
  onNavigate,
  onSwitchMode,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<ConsumerTab>('home');
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>(() =>
    loadUserAnniversaries(user.userId)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnniversary, setEditingAnniversary] =
    useState<Anniversary | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>(
    getTodayString()
  );

  useEffect(() => {
    setAnniversaries(loadUserAnniversaries(user.userId));
    setIsModalOpen(false);
    setEditingAnniversary(null);
  }, [user.userId]);

  const handleOpenCreate = (date?: string) => {
    setEditingAnniversary(null);
    setModalDefaultDate(date || getTodayString());
    setIsModalOpen(true);
  };

  const handleOpenDetail = (anniversary: Anniversary) => {
    setEditingAnniversary(anniversary);
    setModalDefaultDate(anniversary.date);
    setIsModalOpen(true);
  };

  const handleSaveAnniversary = (
    input: AnniversaryFormInput,
    existingId?: string
  ) => {
    if (existingId) {
      setAnniversaries(updateUserAnniversary(user.userId, existingId, input));
    } else {
      setAnniversaries(createUserAnniversary(user.userId, input));
    }
    setIsModalOpen(false);
    setEditingAnniversary(null);
  };

  const handleDeleteAnniversary = (anniversaryId: string) => {
    setAnniversaries(deleteUserAnniversary(user.userId, anniversaryId));
    setIsModalOpen(false);
    setEditingAnniversary(null);
  };

  const handleToggleAcknowledge = (
    anniversaryId: string,
    occurrenceDate: string
  ) => {
    setAnniversaries(
      toggleAnniversaryAcknowledgement(
        user.userId,
        anniversaryId,
        occurrenceDate
      )
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-10">
      {/* Desktop & Tablet Sub-Navigation */}
      <div className="hidden md:flex items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E9DFD0]">
        <div
          role="tablist"
          aria-label="소비자 모드 메뉴"
          className="inline-flex items-center gap-1 rounded-2xl bg-[#E9DFD0]/70 p-1"
        >
          {CONSUMER_TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'min-h-[44px] px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-2 transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-[#FFFFFF] text-[#493B32] shadow-sm shadow-[#493B32]/5'
                    : 'text-[#6E5C50] hover:text-[#493B32]'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-sm text-[#6E5C50]">
          소비자 모드 이용 중 · 등록 기념일{' '}
          <strong className="font-semibold text-[#493B32] tabular-nums">
            {anniversaries.length}
          </strong>
          건
        </span>
      </div>

      {/* Tab Content */}
      {activeTab === 'home' && (
        <ConsumerHomeView
          userName={user.name}
          anniversaries={anniversaries}
          onOpenCreate={() => handleOpenCreate()}
          onOpenDetail={handleOpenDetail}
          onOpenCalendar={() => setActiveTab('calendar')}
          onToggleAcknowledge={handleToggleAcknowledge}
        />
      )}

      {activeTab === 'calendar' && (
        <ConsumerCalendarView
          anniversaries={anniversaries}
          onOpenCreateForDate={(date) => handleOpenCreate(date)}
          onOpenDetail={handleOpenDetail}
        />
      )}

      {activeTab === 'mypage' && (
        <ConsumerMyPageView
          user={user}
          anniversaryCount={anniversaries.length}
          onNavigate={onNavigate}
          onSwitchMode={onSwitchMode}
          onLogout={onLogout}
        />
      )}

      {/* Mobile Fixed Bottom Navigation (홈 / 캘린더 / 마이페이지) */}
      <nav
        aria-label="소비자 하단 메뉴"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E9DFD0]"
      >
        <div className="grid grid-cols-3 h-full max-w-md mx-auto">
          {CONSUMER_TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer',
                  isActive ? 'text-[#8F6849]' : 'text-[#6E5C50]'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span
                  className={cn(
                    'text-[11px] tracking-tight',
                    isActive ? 'font-bold' : 'font-medium'
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Anniversary Create / Detail / Edit / Delete Modal */}
      <AnniversaryModal
        isOpen={isModalOpen}
        editingAnniversary={editingAnniversary}
        defaultDate={modalDefaultDate}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnniversary(null);
        }}
        onSave={handleSaveAnniversary}
        onDelete={handleDeleteAnniversary}
      />
    </div>
  );
};
