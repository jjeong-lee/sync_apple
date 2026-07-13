import type { Category, ProductDetail, ProductSummary } from '../../types';
import { cn, formatPrice, isSoldOut } from '../../lib/utils';
import { Badge, Button, Card, EmptyState, FieldGroup, InlineBanner, Input, MetaPill, SectionHeading, Select, SkeletonBlock } from '../ui';

type CatalogSectionProps = {
  categories: Category[];
  products: ProductSummary[];
  query: string;
  category: string;
  sort: string;
  stockStatus: string;
  loading: boolean;
  error: string;
  dialogOpen: boolean;
  selectedProduct: ProductDetail | null;
  detailLoading: boolean;
  detailError: string;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onResetFilters: () => void;
  onOpenProduct: (slug: string) => void;
  onCloseProduct: () => void;
  onAddToCart: () => void;
  onSubmitOrder: () => void;
};

export function CatalogSection(props: CatalogSectionProps) {
  const { categories, products, query, category, sort, stockStatus, loading, error } = props;
  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Catalog" title="브랜드 큐레이션 상품 탐색" description="shadcn-admin의 정돈된 필터 밀도와 카드 리듬을 바탕으로, 탐색 패널과 리스트 계층을 더 명확하게 다듬었습니다." />
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground"><MetaPill label="카테고리" value={categories.length} /><MetaPill label="검색 결과" value={products.length} /></div>
          </div>
        </div>
        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FieldGroup label="검색"><Input value={query} onChange={(event) => props.onQueryChange(event.target.value)} placeholder="상품명 또는 카테고리 검색" /></FieldGroup>
            <FieldGroup label="카테고리"><Select value={category} onChange={(event) => props.onCategoryChange(event.target.value)}><option value="">전체 카테고리</option>{categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</Select></FieldGroup>
            <FieldGroup label="정렬"><Select value={sort} onChange={(event) => props.onSortChange(event.target.value)}><option value="featured">추천순</option><option value="popular">인기순</option><option value="newest">최신순</option><option value="price_asc">낮은 가격순</option><option value="price_desc">높은 가격순</option></Select></FieldGroup>
            <FieldGroup label="재고 상태"><Select value={stockStatus} onChange={(event) => props.onStockStatusChange(event.target.value)}><option value="">전체 재고 상태</option><option value="in_stock">재고 있음</option><option value="low_stock">수량 적음</option><option value="sold_out">품절</option></Select></FieldGroup>
          </div>
          {error ? <InlineBanner tone="critical">{error}</InlineBanner> : null}
          {loading ? <CatalogSkeleton /> : products.length === 0 ? <EmptyState title="조건에 맞는 상품이 없습니다" description="검색어 또는 필터를 조정해 다른 카테고리와 재고 상태를 확인해 보세요." actionLabel="필터 초기화" onAction={props.onResetFilters} /> : <ProductGrid products={products} onOpenProduct={props.onOpenProduct} />}
        </div>
      </Card>
      <CatalogDialog open={props.dialogOpen} product={props.selectedProduct} loading={props.detailLoading} error={props.detailError} onClose={props.onCloseProduct} onAddToCart={props.onAddToCart} onSubmitOrder={props.onSubmitOrder} />
    </>
  );
}

function CatalogSkeleton() {
  return <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Card key={`product-skeleton-${index}`} className="overflow-hidden p-0"><SkeletonBlock className="h-44 rounded-none" /><div className="space-y-3 p-5"><SkeletonBlock className="h-4 w-20" /><SkeletonBlock className="h-7 w-3/4" /><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-2/3" /><div className="flex items-center justify-between pt-2"><SkeletonBlock className="h-5 w-24" /><SkeletonBlock className="h-10 w-24 rounded-full" /></div></div></Card>)}</div>;
}

function ProductGrid({ products, onOpenProduct }: { products: ProductSummary[]; onOpenProduct: (slug: string) => void }) {
  return <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{products.map((product) => {
    const soldOut = isSoldOut(product);
    return <article key={product.id} className={cn('overflow-hidden rounded-[26px] border border-border bg-card transition-all duration-300', soldOut ? 'opacity-60' : 'hover:border-accent/30 hover:shadow-md')}><div className="relative h-44 overflow-hidden bg-muted">{product.heroImageUrl ? <img src={product.heroImageUrl} alt={product.name} className={cn('h-full w-full object-cover transition-transform duration-500', soldOut ? 'grayscale' : 'hover:scale-[1.03]')} /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">이미지 없음</div>}{soldOut ? <div className="absolute right-4 top-4"><Badge variant="outline">품절</Badge></div> : null}</div><div className="space-y-4 p-5"><div className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{product.categoryName}</span><span>{soldOut ? '품절' : `재고 ${product.availableStock}`}</span></div><div className="space-y-2"><h3 className="text-xl font-semibold tracking-tight text-foreground">{product.name}</h3><p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{product.shortDescription}</p></div><div className="flex items-center justify-between gap-3 border-t border-border pt-4"><p className="text-base font-semibold text-foreground">{formatPrice(product.salePrice ?? product.price)}</p><Button size="sm" onClick={() => onOpenProduct(product.slug)}>상세 보기</Button></div></div></article>;
  })}</div>;
}

function CatalogDialog({ open, product, loading, error, onClose, onAddToCart, onSubmitOrder }: { open: boolean; product: ProductDetail | null; loading: boolean; error: string; onClose: () => void; onAddToCart: () => void; onSubmitOrder: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[32px] border border-border bg-background shadow-[0_32px_96px_rgba(15,23,42,0.28)]"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur-sm"><div><p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">Product detail</p><h3 className="mt-1 text-lg font-semibold text-foreground">{product?.product.name ?? (loading ? '상품 정보를 불러오는 중' : '상세 정보')}</h3></div><Button variant="ghost" size="sm" onClick={onClose}>닫기</Button></div><div className="p-6 md:p-8">{loading ? <DialogSkeleton /> : error ? <EmptyState title="상세 정보를 불러오지 못했습니다" description={error} tone="critical" /> : product ? <ProductDetailContent detail={product} onAddToCart={onAddToCart} onSubmitOrder={onSubmitOrder} /> : null}</div></div></div>;
}

function DialogSkeleton() {
  return <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]"><SkeletonBlock className="min-h-[320px] rounded-[26px]" /><div className="space-y-4"><SkeletonBlock className="h-4 w-24" /><SkeletonBlock className="h-10 w-3/4" /><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-5/6" /><SkeletonBlock className="h-24 w-full rounded-[24px]" /><SkeletonBlock className="h-14 w-full rounded-[20px]" /><SkeletonBlock className="h-14 w-full rounded-[20px]" /></div></div>;
}

function ProductDetailContent({ detail, onAddToCart, onSubmitOrder }: { detail: ProductDetail; onAddToCart: () => void; onSubmitOrder: () => void }) {
  return <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]"><div className="overflow-hidden rounded-[28px] border border-border bg-muted">{detail.product.heroImageUrl ? <img src={detail.product.heroImageUrl} alt={detail.product.name} className="h-full w-full object-cover" /> : <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">이미지를 준비 중입니다.</div>}</div><div className="space-y-5"><div className="space-y-3"><Badge>{detail.product.categoryName}</Badge><div><h3 className="text-3xl font-semibold tracking-tight text-foreground">{detail.product.name}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{detail.product.shortDescription}</p></div></div><div className="rounded-[24px] border border-border bg-muted/60 p-5"><p className="text-sm text-muted-foreground">판매가</p><p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{formatPrice(detail.product.salePrice ?? detail.product.price)}</p></div><div className="space-y-3">{detail.options.length === 0 ? <EmptyState title="선택 가능한 옵션이 없습니다" description="상품 옵션 데이터가 연결되면 재고와 구매 가능 여부가 이 영역에 표시됩니다." /> : detail.options.map((option) => <div key={option.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-border bg-card px-4 py-4 transition-colors duration-200 hover:bg-muted/40"><div><p className="font-medium text-foreground">{option.optionName}</p><p className="mt-1 text-sm text-muted-foreground">{option.optionValue}</p></div><div className="text-right text-xs text-muted-foreground"><p>{option.purchasable ? '구매 가능' : '품절'}</p><p className="mt-1">재고 {option.stockQuantity}</p></div></div>)}</div><div className="grid gap-3 sm:grid-cols-2"><Button size="lg" onClick={onAddToCart}>Cart에 담기</Button><Button size="lg" variant="secondary" onClick={onSubmitOrder}>바로 주문</Button></div></div></div>;
}
