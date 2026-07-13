import type { HomeContent, ProductSummary } from '../../types';
import { cn, formatPrice, isSoldOut } from '../../lib/utils';
import { Badge, Button, Card, PulseIcon, SkeletonBlock } from '../ui';

export function HeroSection({ home, badges }: { home: HomeContent | null; badges: string[] }) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-border/70 bg-slate-950 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
      <div className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1.2fr)_22rem] lg:px-10 lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-white/72 backdrop-blur-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-cyan-300" />
              {home?.hero.eyebrow ?? '브랜드 경험'}
            </div>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">{home?.hero.title ?? '프리미엄 전자제품 경험을 하나의 흐름으로 연결합니다.'}</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{home?.hero.subtitle ?? '미니멀한 UI와 운영 대시보드를 한 화면 흐름으로 묶어, 탐색부터 주문과 운영까지 자연스럽게 이어지도록 설계했습니다.'}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg"><a href="#catalog">{home?.hero.ctaLabel ?? 'Catalog 보기'}</a></Button>
            <Button asChild size="lg" variant="secondary-dark"><a href="#admin">운영 Dashboard 확인</a></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {badges.map((badge) => <div key={badge} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur-sm transition-colors duration-200 hover:bg-white/8">{badge}</div>)}
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
          <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/80">
            {home?.hero.imageUrl ? <img src={home.hero.imageUrl} alt={home.hero.title} className="h-full min-h-[280px] w-full object-cover" /> : <div className="flex min-h-[280px] items-center justify-center bg-[radial-gradient(circle_at_top,#1e293b,transparent_50%),linear-gradient(135deg,#0f172a,#111827_55%,#1e293b)] px-6 text-center text-sm text-slate-300">이미지 없이도 프리미엄 레이아웃과 정보 밀도를 유지하는 히어로 패널</div>}
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-md">
              <div className="flex items-start justify-between gap-4"><div className="space-y-1"><p className="text-[11px] font-medium uppercase tracking-[0.26em] text-slate-400">3-Click Journey</p><p className="text-sm text-slate-100">메인 → 카탈로그 → 상품 상세로 이어지는 탐색 흐름</p></div><div className="space-y-1 text-right text-xs text-slate-400"><p>Responsive</p><p>Soft transition</p></div></div>
            </div>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-slate-200"><div className="flex items-center gap-2 text-slate-400"><PulseIcon className="h-4 w-4" />운영 요약</div><p className="mt-3 text-lg font-medium text-white">탐색, 결제 예상 금액, 최근 주문 흐름을 하나의 화면 리듬으로 묶었습니다.</p></div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedProducts({ products, loading, onOpenProduct }: { products: ProductSummary[]; loading: boolean; onOpenProduct: (slug: string) => void }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {(loading ? Array.from({ length: 3 }) : products).map((product, index) => loading ? (
        <Card key={`featured-skeleton-${index}`} className="overflow-hidden p-0"><SkeletonBlock className="h-56 rounded-none" /><div className="space-y-3 p-6"><SkeletonBlock className="h-4 w-24" /><SkeletonBlock className="h-8 w-4/5" /><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-2/3" /></div></Card>
      ) : (() => {
        const featuredProduct = product as ProductSummary;
        const soldOut = isSoldOut(featuredProduct);
        return <button key={featuredProduct.id} onClick={() => onOpenProduct(featuredProduct.slug)} className={cn('group overflow-hidden rounded-[28px] border border-border bg-card text-left shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', soldOut ? 'opacity-60' : 'hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg')}><div className="relative h-56 overflow-hidden bg-muted">{featuredProduct.heroImageUrl ? <img src={featuredProduct.heroImageUrl} alt={featuredProduct.name} className={cn('h-full w-full object-cover transition-transform duration-500', soldOut ? 'grayscale' : 'group-hover:scale-[1.04]')} /> : <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eff6ff,#e2e8f0_40%,#f8fafc)] text-sm text-muted-foreground">이미지 준비 중</div>}<div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2"><Badge>{featuredProduct.badge ?? featuredProduct.categoryName}</Badge><Badge variant={soldOut ? 'outline' : 'secondary'}>{soldOut ? '품절' : `재고 ${featuredProduct.availableStock}`}</Badge></div></div><div className="space-y-4 p-6"><div className="space-y-2"><h3 className="text-2xl font-semibold tracking-tight text-foreground">{featuredProduct.name}</h3><p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{featuredProduct.shortDescription}</p></div><div className="flex items-center justify-between gap-3 border-t border-border pt-4"><p className="text-lg font-semibold text-foreground">{formatPrice(featuredProduct.salePrice ?? featuredProduct.price)}</p><span className="text-sm font-medium text-accent transition-transform duration-200 group-hover:translate-x-1">자세히 보기 →</span></div></div></button>;
      })())}
    </section>
  );
}
