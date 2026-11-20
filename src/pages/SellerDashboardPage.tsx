import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  ChevronRight,
  ClipboardList,
  ImagePlus,
  Info,
  LogOut,
  Store,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SellerOrderDetailModal } from '../components/SellerOrderDetailModal';
import { SellerQuoteDetailModal } from '../components/SellerQuoteDetailModal';
import { getMockCakeShops, formatPriceKRW } from '../data/mockShops';
import {
  approveOrderAsSeller,
  filterSellerOrders,
  formatOrderTimestampDate,
  getOrderStatusBadgeClass,
  getSellerOrderCounts,
  loadOrdersForSellerShops,
  rejectOrderAsSeller,
} from '../services/orderStorage';
import { loadQuoteRequestsForSellerShops } from '../services/quoteRequestStorage';
import type {
  AppPage,
  CakeOrder,
  CustomQuoteRequest,
  SellerOrderFilter,
  UserAccount,
  UserRole,
} from '../types';
import { canSwitchModes } from '../utils/auth';
import { cn } from '../utils/cn';
import { formatKoreanShortDate } from '../utils/dateUtils';

interface SellerDashboardPageProps {
  user: UserAccount;
  onNavigate: (page: AppPage) => void;
  onSwitchMode: (targetMode: UserRole) => boolean;
  onLogout: () => void;
}

const FILTER_OPTIONS: Array<{ id: SellerOrderFilter; label: string }> = [
  { id: 'all', label: '전체 주문' },
  { id: 'pending', label: '확인 대기' },
  { id: 'approved', label: '승인 완료(미결제)' },
  { id: 'paid', label: '결제 완료' },
  { id: 'rejected', label: '거절' },
];

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({
  user,
  onNavigate,
  onSwitchMode,
  onLogout,
}) => {
  const ownedShopIds = useMemo(() => user.ownedShopIds ?? [], [user.ownedShopIds]);
  const ownedShops = useMemo(() => {
    const ownedSet = new Set(ownedShopIds);
    return getMockCakeShops().filter((shop) => ownedSet.has(shop.shopId));
  }, [ownedShopIds]);

  const [sellerTab, setSellerTab] = useState<'orders' | 'quotes'>('orders');
  const [orders, setOrders] = useState<CakeOrder[]>(() =>
    loadOrdersForSellerShops(ownedShopIds)
  );
  const [quoteRequests, setQuoteRequests] = useState<CustomQuoteRequest[]>(() =>
    loadQuoteRequestsForSellerShops(ownedShopIds)
  );
  const [statusFilter, setStatusFilter] = useState<SellerOrderFilter>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [decisionNotice, setDecisionNotice] = useState<string | null>(null);

  useEffect(() => {
    setOrders(loadOrdersForSellerShops(ownedShopIds));
    setQuoteRequests(loadQuoteRequestsForSellerShops(ownedShopIds));
    setSelectedOrderId(null);
    setSelectedQuoteId(null);
    setDecisionNotice(null);
  }, [user.userId, ownedShopIds]);

  const counts = useMemo(() => getSellerOrderCounts(orders), [orders]);
  const filteredOrders = useMemo(
    () => filterSellerOrders(orders, statusFilter),
    [orders, statusFilter]
  );

  const selectedOrder =
    orders.find((order) => order.orderId === selectedOrderId) ?? null;
  const selectedQuote =
    quoteRequests.find((quote) => quote.quoteId === selectedQuoteId) ?? null;

  const isDualRole = canSwitchModes(user);

  const handleApproveOrder = (orderId: string) => {
    const result = approveOrderAsSeller(orderId, ownedShopIds);
    setOrders(result.orders);
    if (result.ok) {
      setDecisionNotice(
        `주문(${orderId})을 승인 완료 처리했습니다. 소비자가 결제를 진행할 수 있습니다.`
      );
    }
    return { ok: result.ok, error: result.error };
  };

  const handleRejectOrder = (orderId: string, rejectionReason: string) => {
    const result = rejectOrderAsSeller(orderId, ownedShopIds, rejectionReason);
    setOrders(result.orders);
    if (result.ok) {
      setDecisionNotice(
        `주문(${orderId})을 거절 처리하고 거절 사유를 저장했습니다.`
      );
    }
    return { ok: result.ok, error: result.error };
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-10 space-y-6">
      {/* Seller Top Header & Owned Shops Overview */}
      <Card tone="beige" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs sm:text-sm font-medium text-[#8F6849]">
              판매자 모드 · 주문 관리
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#493B32]">
              {user.name}님의 매장 주문 관리
            </h1>
            <p className="text-sm text-[#6E5C50]">
              운영 중인 매장에 접수된 커스텀 케이크 주문을 확인하고 승인·거절 및 결제 완료 여부를 관리할 수 있습니다.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {isDualRole && (
              <Button
                variant="primary"
                size="md"
                onClick={() => onSwitchMode('consumer')}
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                <span>소비자 모드로 전환</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('mode-select')}
            >
              모드 선택 화면
            </Button>
          </div>
        </div>

        {/* Owned Shops Badge List */}
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFD0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <Store
              className="h-4 w-4 text-[#8F6849] mt-0.5 sm:mt-0 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#6E5C50]">
                현재 계정으로 관리 중인 매장 ({ownedShops.length}곳)
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#493B32] break-words">
                {ownedShops.length > 0
                  ? ownedShops.map((shop) => shop.shopName).join(' · ')
                  : '연결된 매장이 없습니다'}
              </p>
            </div>
          </div>
          <span className="text-xs text-[#6E5C50] tabular-nums shrink-0">
            일반 주문 {counts.all}건 · 맞춤 견적 {quoteRequests.length}건
          </span>
        </div>
      </Card>

      {/* Seller Sub-Section Switcher: 일반 주문 관리 / 맞춤 디자인 견적 요청 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="판매자 메뉴"
          className="inline-flex items-center gap-1 rounded-2xl bg-[#E9DFD0]/70 p-1 self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={sellerTab === 'orders'}
            onClick={() => setSellerTab('orders')}
            className={cn(
              'min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-2 transition-all duration-150 cursor-pointer',
              sellerTab === 'orders'
                ? 'bg-[#FFFFFF] text-[#493B32] shadow-sm shadow-[#493B32]/5 font-semibold'
                : 'text-[#6E5C50] hover:text-[#493B32]'
            )}
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            <span>일반 주문 관리</span>
            <span className="text-xs text-[#8F6849] tabular-nums">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={sellerTab === 'quotes'}
            onClick={() => {
              setQuoteRequests(loadQuoteRequestsForSellerShops(ownedShopIds));
              setSellerTab('quotes');
            }}
            className={cn(
              'min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-2 transition-all duration-150 cursor-pointer',
              sellerTab === 'quotes'
                ? 'bg-[#FFFFFF] text-[#493B32] shadow-sm shadow-[#493B32]/5 font-semibold'
                : 'text-[#6E5C50] hover:text-[#493B32]'
            )}
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            <span>맞춤 디자인 견적 요청</span>
            <span className="text-xs text-[#8F6849] tabular-nums">
              {quoteRequests.length}
            </span>
          </button>
        </div>
      </div>

      {/* Decision Feedback Toast / Banner */}
      {sellerTab === 'orders' && decisionNotice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#B58C6A]/50 bg-[#FFFFFF] px-4 py-3 text-xs sm:text-sm text-[#493B32]"
        >
          <span>{decisionNotice}</span>
          <button
            type="button"
            onClick={() => setDecisionNotice(null)}
            className="text-xs font-semibold text-[#8F6849] hover:text-[#493B32] whitespace-nowrap shrink-0 cursor-pointer"
          >
            닫기
          </button>
        </div>
      )}

      {sellerTab === 'orders' && (
        <>

      {/* Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="주문 상태별 필터"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
        >
          {FILTER_OPTIONS.map(({ id, label }) => {
            const isActive = statusFilter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setStatusFilter(id)}
                className={cn(
                  'min-h-[44px] px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 border transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                    : 'bg-[#FFFFFF] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                )}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    'text-xs tabular-nums font-semibold',
                    isActive ? 'text-[#FAF8F3]' : 'text-[#8F6849]'
                  )}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-[#6E5C50] tabular-nums">
          표시 중 {filteredOrders.length}건
        </p>
      </div>

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <Card className="py-12 text-center space-y-3">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9DFD0] text-[#8F6849]">
            <ClipboardList className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-[#493B32]">
            {orders.length === 0
              ? '아직 매장에 접수된 주문이 없어요.'
              : '선택한 상태에 해당하는 주문이 없습니다.'}
          </h2>
          <p className="text-sm text-[#6E5C50] max-w-md mx-auto leading-relaxed">
            {orders.length === 0
              ? '소비자 모드에서 운영 중인 매장으로 주문을 신청하면 이곳에서 바로 확인하고 승인·거절할 수 있습니다.'
              : '다른 상태 탭을 선택해 접수된 주문을 확인해 보세요.'}
          </p>
          {orders.length === 0 && isDualRole && (
            <div className="pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => onSwitchMode('consumer')}
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                <span>소비자 모드에서 주문해 보기</span>
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-0 sm:p-0 divide-y divide-[#E9DFD0] overflow-hidden">
          {filteredOrders.map((order) => {
            const isPaid =
              order.status === '결제 완료 및 예약 확정' ||
              Boolean(order.payment?.isPaid);
            const paymentStateLabel = isPaid
              ? `결제 완료 (${order.payment?.paymentMethod ?? '시연용'} · ${formatPriceKRW(order.payment?.paidAmount ?? order.cakePrice)})`
              : order.status === '판매자 승인 완료'
                ? '미결제 (소비자 결제 대기 중)'
                : order.status === '판매자 거절'
                  ? '결제 불가 (거절된 주문)'
                  : '미결제 (승인 확인 대기)';

            return (
              <button
                key={order.orderId}
                type="button"
                onClick={() => setSelectedOrderId(order.orderId)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FAF8F3] transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'inline-block rounded-lg px-2.5 py-0.5 text-xs font-semibold',
                        getOrderStatusBadgeClass(order.status)
                      )}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs font-medium text-[#6E5C50] tabular-nums">
                      주문번호 {order.orderId}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <h2 className="text-base sm:text-lg font-bold text-[#493B32] truncate">
                      {order.cakeName}
                    </h2>
                    <span className="text-xs font-medium text-[#8F6849] shrink-0">
                      {order.shopName}
                    </span>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-4 text-xs sm:text-sm text-[#6E5C50]">
                    <div className="truncate">
                      <dt className="inline text-[#8F6849] font-medium">주문자: </dt>
                      <dd className="inline text-[#493B32] font-medium">
                        {order.customerName || '이전 데모 주문'}
                        {order.customerEmail ? ` (${order.customerEmail})` : ''}
                      </dd>
                    </div>
                    <div className="tabular-nums">
                      <dt className="inline text-[#8F6849] font-medium">픽업: </dt>
                      <dd className="inline text-[#493B32] font-semibold">
                        {formatKoreanShortDate(order.pickupDate)} ·{' '}
                        {order.pickupTime}
                      </dd>
                    </div>
                    <div className="tabular-nums">
                      <dt className="inline text-[#8F6849] font-medium">신청일: </dt>
                      <dd className="inline">
                        {formatOrderTimestampDate(order.orderedAt)}
                      </dd>
                    </div>
                  </dl>

                  <p
                    className={cn(
                      'text-xs font-medium tabular-nums',
                      isPaid ? 'text-[#355E3B]' : 'text-[#6E5C50]'
                    )}
                  >
                    결제 상태: {paymentStateLabel}
                  </p>

                  {order.status === '판매자 거절' && order.rejectionReason && (
                    <p className="text-xs text-[#9F4A3B] bg-[#FBF0ED] border border-[#E4B8AF] rounded-xl px-3 py-1.5 leading-relaxed">
                      거절 사유: {order.rejectionReason}
                    </p>
                  )}
                </div>

                <ChevronRight
                  className="h-5 w-5 text-[#B58C6A] shrink-0"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </Card>
      )}

        </>
      )}

      {sellerTab === 'quotes' && (
        <div className="space-y-4">
          {quoteRequests.length === 0 ? (
            <Card className="py-12 text-center space-y-3">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9DFD0] text-[#8F6849]">
                <ImagePlus className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-[#493B32]">
                아직 매장에 접수된 맞춤 디자인 견적 요청이 없습니다.
              </h2>
              <p className="text-sm text-[#6E5C50] max-w-md mx-auto leading-relaxed">
                소비자가 운영 중인 매장에 디자인 참고 사진과 제작 사양을 담아 견적을 요청하면 이곳에 표시됩니다.
              </p>
            </Card>
          ) : (
            <Card className="p-0 sm:p-0 divide-y divide-[#E9DFD0] overflow-hidden">
              {quoteRequests.map((quote) => (
                <button
                  key={quote.quoteId}
                  type="button"
                  onClick={() => setSelectedQuoteId(quote.quoteId)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FAF8F3] transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block rounded-lg bg-[#E9DFD0] border border-[#D8C9B5] px-2.5 py-0.5 text-xs font-semibold text-[#493B32]">
                        {quote.status}
                      </span>
                      <span className="text-xs font-medium text-[#6E5C50] tabular-nums">
                        요청번호 {quote.quoteId}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h2 className="text-base sm:text-lg font-bold text-[#493B32] truncate">
                        {quote.cakeSize} · {quote.cakeShape} · {quote.cakeFlavor}
                      </h2>
                      <span className="text-xs font-medium text-[#8F6849] shrink-0">
                        {quote.shopName}
                      </span>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-4 text-xs sm:text-sm text-[#6E5C50]">
                      <div className="truncate">
                        <dt className="inline text-[#8F6849] font-medium">
                          요청자:{' '}
                        </dt>
                        <dd className="inline text-[#493B32] font-medium">
                          {quote.customerName} ({quote.customerEmail})
                        </dd>
                      </div>
                      <div className="tabular-nums">
                        <dt className="inline text-[#8F6849] font-medium">
                          희망 수령:{' '}
                        </dt>
                        <dd className="inline text-[#493B32] font-semibold">
                          {formatKoreanShortDate(quote.desiredPickupDate)} ·{' '}
                          {quote.desiredPickupTime}
                        </dd>
                      </div>
                      <div className="tabular-nums">
                        <dt className="inline text-[#8F6849] font-medium">
                          접수일:{' '}
                        </dt>
                        <dd className="inline">
                          {formatOrderTimestampDate(quote.createdAt)}
                        </dd>
                      </div>
                    </dl>

                    <p className="text-xs font-medium text-[#8F6849] tabular-nums">
                      첨부 참고 사진 {quote.images.length}장 · 레터링 &ldquo;
                      {quote.letteringText}&rdquo;
                    </p>
                  </div>

                  <ChevronRight
                    className="h-5 w-5 text-[#B58C6A] shrink-0"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Demo Isolation Notice */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-[#E9DFD0]/45 p-4 text-xs text-[#6E5C50]">
        <Info
          className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p className="leading-relaxed">
          판매자 모드에서는 현재 계정이 운영하는 매장({ownedShops.map((s) => s.shopName).join(', ') || '없음'})에 접수된 일반 주문과 맞춤 디자인 견적 요청만 조회할 수 있습니다. 견적 금액 작성 및 답변 전송 기능은 다음 단계에서 추가될 예정입니다.
        </p>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <nav
        aria-label="판매자 하단 메뉴"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E9DFD0]"
      >
        <div
          className={cn(
            'grid h-full max-w-md mx-auto',
            isDualRole ? 'grid-cols-4' : 'grid-cols-3'
          )}
        >
          <button
            type="button"
            aria-current={sellerTab === 'orders' ? 'page' : undefined}
            onClick={() => {
              setSellerTab('orders');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={cn(
              'min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer px-1',
              sellerTab === 'orders' ? 'text-[#8F6849]' : 'text-[#6E5C50]'
            )}
          >
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
            <span
              className={cn(
                'text-[11px] tracking-tight whitespace-nowrap',
                sellerTab === 'orders' ? 'font-bold' : 'font-medium'
              )}
            >
              주문 관리
            </span>
          </button>

          <button
            type="button"
            aria-current={sellerTab === 'quotes' ? 'page' : undefined}
            onClick={() => {
              setQuoteRequests(loadQuoteRequestsForSellerShops(ownedShopIds));
              setSellerTab('quotes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={cn(
              'min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer px-1',
              sellerTab === 'quotes' ? 'text-[#8F6849]' : 'text-[#6E5C50]'
            )}
          >
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            <span
              className={cn(
                'text-[11px] tracking-tight whitespace-nowrap',
                sellerTab === 'quotes' ? 'font-bold' : 'font-medium'
              )}
            >
              견적 요청
            </span>
          </button>

          {isDualRole && (
            <button
              type="button"
              onClick={() => onSwitchMode('consumer')}
              className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[#6E5C50] cursor-pointer px-1"
            >
              <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                소비자 모드
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[#6E5C50] cursor-pointer px-1"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
              로그아웃
            </span>
          </button>
        </div>
      </nav>

      {/* Seller Order Detail & Decision Modal */}
      <SellerOrderDetailModal
        order={selectedOrder}
        isMissingOrder={selectedOrderId !== null && !selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        onApprove={handleApproveOrder}
        onReject={handleRejectOrder}
      />

      {/* Seller Custom Quote Request Detail Modal (Read-only in Stage 9) */}
      <SellerQuoteDetailModal
        quote={selectedQuote}
        isMissingQuote={selectedQuoteId !== null && !selectedQuote}
        onClose={() => setSelectedQuoteId(null)}
      />
    </div>
  );
};
