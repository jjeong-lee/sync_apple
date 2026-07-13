import type { OrderRecord } from '../../types';
import { estimateDeliveryDate } from '../../lib/utils';
import { Card, EmptyState, InlineBanner, QuickSummaryCard } from '../ui';

export function SummarySection({ featuredCount, previewItemCount, recentOrderCount, bannerMessage }: { featuredCount: number; previewItemCount: number; recentOrderCount: number; bannerMessage: string }) {
  return <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center"><div className="grid gap-3 md:grid-cols-3"><QuickSummaryCard label="큐레이션" value={featuredCount} description="메인에 노출되는 대표 상품" /><QuickSummaryCard label="주문 예상" value={previewItemCount} description="결제 예정 품목 수" /><QuickSummaryCard label="운영 알림" value={recentOrderCount} description="최근 주문 트래킹 항목" /></div>{bannerMessage ? <InlineBanner tone="success">{bannerMessage}</InlineBanner> : null}</div>;
}

export function OrderCompletion({ order }: { order: OrderRecord | null }) {
  if (!order) return null;
  return <Card className="overflow-hidden border-emerald-500/20 bg-[linear-gradient(135deg,rgba(240,253,244,0.98),rgba(236,253,245,0.92))]"><div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.28em] text-emerald-700">Order complete</p><h3 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">주문이 완료되었습니다</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">주문번호와 배송 일정을 바로 확인할 수 있도록 완료 정보를 크게 노출했습니다.</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[24px] border border-emerald-500/15 bg-white/85 p-5 shadow-sm"><p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">주문번호</p><p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{order.orderNumber}</p></div><div className="rounded-[24px] border border-emerald-500/15 bg-white/85 p-5 shadow-sm"><p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">예상 배송일</p><p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{estimateDeliveryDate(order.createdAt)}</p></div></div></div></Card>;
}

export function PageError({ message }: { message: string }) {
  return message ? <Card className="border-destructive/20 bg-destructive/5"><EmptyState title="데이터 연결을 완료하지 못했습니다" description={message} tone="critical" /></Card> : null;
}
