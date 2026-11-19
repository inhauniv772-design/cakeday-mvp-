import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Home, Search, User } from 'lucide-react';
import { AnniversaryModal } from '../components/AnniversaryModal';
import { getMockCakeShops } from '../data/mockShops';
import {
  createUserAnniversary,
  deleteUserAnniversary,
  loadUserAnniversaries,
  toggleAnniversaryAcknowledgement,
  updateUserAnniversary,
} from '../services/anniversaryStorage';
import {
  completeDemoPaymentForOrder,
  createUserOrder,
  loadUserOrders,
} from '../services/orderStorage';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import type {
  Anniversary,
  AnniversaryFormInput,
  AppPage,
  CakeOrder,
  CakeOrderFormInput,
  CakeOrderOptions,
  CakeShop,
  ConsumerTab,
  PaymentMethod,
  ShopOrderFilter,
  UserAccount,
  UserRole,
} from '../types';
import { cn } from '../utils/cn';
import { getTodayString } from '../utils/dateUtils';
import { CakeOrderFormView } from './CakeOrderFormView';
import { ConsumerCakeSearchView } from './ConsumerCakeSearchView';
import { ConsumerCalendarView } from './ConsumerCalendarView';
import { ConsumerHomeView } from './ConsumerHomeView';
import { ConsumerMyPageView } from './ConsumerMyPageView';
import { ShopDetailView } from './ShopDetailView';

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
  { id: 'search', label: '케이크 찾기', Icon: Search },
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
  const [orders, setOrders] = useState<CakeOrder[]>(() =>
    loadUserOrders(user.userId)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnniversary, setEditingAnniversary] =
    useState<Anniversary | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>(
    getTodayString()
  );

  // Shop search, detail & ordering state
  const mockShops = useMemo(() => getMockCakeShops(), []);
  const [pickupDate, setPickupDate] = useState<string>(() => getTodayString());
  const [selectedSido, setSelectedSido] = useState<string>('all');
  const [selectedSigungu, setSelectedSigungu] = useState<string>('all');
  const [orderFilter, setOrderFilter] = useState<ShopOrderFilter>('all');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderDraft, setOrderDraft] = useState<{
    shopId: string;
    step: 1 | 2 | 3;
    form: CakeOrderFormInput;
  } | null>(null);

  const selectedShop = useMemo(
    () => mockShops.find((shop) => shop.shopId === selectedShopId) ?? null,
    [mockShops, selectedShopId]
  );

  useEffect(() => {
    setAnniversaries(loadUserAnniversaries(user.userId));
    setOrders(loadUserOrders(user.userId));
    setIsModalOpen(false);
    setEditingAnniversary(null);
    setSelectedShopId(null);
    setIsOrdering(false);
    setOrderDraft(null);
  }, [user.userId]);

  const handleTabSelect = (tab: ConsumerTab) => {
    if (tab === 'search' && activeTab === 'search') {
      setSelectedShopId(null);
      setIsOrdering(false);
    }
    if (tab === 'mypage') {
      setOrders(loadUserOrders(user.userId));
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleChangeSido = (nextSido: string) => {
    setSelectedSido(nextSido);
    setSelectedSigungu('all');
  };

  const handleResetSearchFilters = () => {
    setPickupDate(getTodayString());
    setSelectedSido('all');
    setSelectedSigungu('all');
    setOrderFilter('all');
  };

  const handleSubmitOrder = (payload: {
    shop: CakeShop;
    pickupDate: string;
    pickupTime: string;
    options: CakeOrderOptions;
  }): CakeOrder => {
    const { createdOrder, orders: updatedOrders } = createUserOrder({
      userId: user.userId,
      customerName: user.name,
      customerEmail: user.email,
      shop: payload.shop,
      pickupDate: payload.pickupDate,
      pickupTime: payload.pickupTime,
      options: payload.options,
    });
    setOrders(updatedOrders);
    setOrderDraft(null);
    return createdOrder;
  };

  const handleCompletePayment = (
    orderId: string,
    paymentMethod: PaymentMethod
  ) => {
    const result = completeDemoPaymentForOrder(
      orderId,
      user.userId,
      paymentMethod
    );
    setOrders(result.orders);
    return {
      ok: result.ok,
      error: result.error,
      updatedOrder: result.updatedOrder,
    };
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
                onClick={() => handleTabSelect(id)}
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
          소비자 모드 이용 중 · 기념일{' '}
          <strong className="font-semibold text-[#493B32] tabular-nums">
            {anniversaries.length}
          </strong>
          건 · 주문{' '}
          <strong className="font-semibold text-[#493B32] tabular-nums">
            {orders.length}
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
          onOpenCalendar={() => handleTabSelect('calendar')}
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

      {activeTab === 'search' &&
        (selectedShop ? (
          isOrdering ? (
            <CakeOrderFormView
              shop={selectedShop}
              initialPickupDate={pickupDate}
              draftStep={
                orderDraft?.shopId === selectedShop.shopId
                  ? orderDraft.step
                  : undefined
              }
              draftForm={
                orderDraft?.shopId === selectedShop.shopId
                  ? orderDraft.form
                  : undefined
              }
              onDraftChange={(nextStep, nextForm) =>
                setOrderDraft({
                  shopId: selectedShop.shopId,
                  step: nextStep,
                  form: nextForm,
                })
              }
              onBackToDetail={() => {
                setIsOrdering(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToSearch={() => {
                setIsOrdering(false);
                setSelectedShopId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onGoToMyPage={() => {
                setIsOrdering(false);
                setSelectedShopId(null);
                handleTabSelect('mypage');
              }}
              onSubmitOrder={handleSubmitOrder}
            />
          ) : (
            <ShopDetailView
              shop={selectedShop}
              pickupDate={pickupDate}
              onBackToSearch={() => {
                setSelectedShopId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStartOrder={() => {
                setIsOrdering(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        ) : selectedShopId !== null ? (
          <Card className="mx-auto max-w-lg py-10 text-center space-y-4">
            <h2 className="text-lg font-bold text-[#493B32]">
              요청하신 케이크 매장 정보를 찾을 수 없습니다.
            </h2>
            <p className="text-sm text-[#6E5C50] leading-relaxed">
              매장 정보가 변경되었거나 유효하지 않은 매장 선택입니다. 매장 검색 화면에서 다시 선택해 주세요.
            </p>
            <div className="pt-1">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedShopId(null);
                  setIsOrdering(false);
                }}
              >
                매장 검색으로 돌아가기
              </Button>
            </div>
          </Card>
        ) : (
          <ConsumerCakeSearchView
            shops={mockShops}
            pickupDate={pickupDate}
            selectedSido={selectedSido}
            selectedSigungu={selectedSigungu}
            orderFilter={orderFilter}
            onChangePickupDate={setPickupDate}
            onChangeSido={handleChangeSido}
            onChangeSigungu={setSelectedSigungu}
            onChangeOrderFilter={setOrderFilter}
            onResetFilters={handleResetSearchFilters}
            onSelectShop={(shopId) => {
              if (orderDraft && orderDraft.shopId !== shopId) {
                setOrderDraft(null);
              }
              setSelectedShopId(shopId);
              setIsOrdering(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ))}

      {activeTab === 'mypage' && (
        <ConsumerMyPageView
          user={user}
          anniversaryCount={anniversaries.length}
          orders={orders}
          onNavigate={onNavigate}
          onGoToSearch={() => handleTabSelect('search')}
          onSwitchMode={onSwitchMode}
          onCompletePayment={handleCompletePayment}
          onLogout={onLogout}
        />
      )}

      {/* Mobile Fixed Bottom Navigation (홈 / 캘린더 / 케이크 찾기 / 마이페이지) */}
      <nav
        aria-label="소비자 하단 메뉴"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E9DFD0]"
      >
        <div className="grid grid-cols-4 h-full max-w-md mx-auto">
          {CONSUMER_TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabSelect(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer px-1',
                  isActive ? 'text-[#8F6849]' : 'text-[#6E5C50]'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span
                  className={cn(
                    'text-[11px] tracking-tight whitespace-nowrap',
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
