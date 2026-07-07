import { useEffect, useMemo, useState, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes } from 'react';
import { api } from './api';
import type {
  AdminOverview,
  CartItem,
  Category,
  HomeContent,
  Member,
  OrderPreview,
  OrderRecord,
  ProductDetail,
  ProductSummary,
} from './types';

const demoMemberId = 301;
const homePath = '/';
const cartPath = '/cart';

const numberFormatter = new Intl.NumberFormat('ko-KR');

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const emptyPreview: OrderPreview = {
  items: [],
  subtotal: 0,
  shippingFee: 0,
  totalAmount: 0,
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatPrice(value: number) {
  return `${numberFormatter.format(value)}원`;
}

function isSoldOut(product: ProductSummary) {
  return product.availableStock <= 0;
}

function estimateDeliveryDate(createdAt: string) {
  const deliveryDate = new Date(createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  return dateFormatter.format(deliveryDate);
}

function normalizePath(pathname: string) {
  return pathname === cartPath ? cartPath : homePath;
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [home, setHome] = useState<HomeContent | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('featured');
  const [stockStatus, setStockStatus] = useState('');
  const [bannerMessage, setBannerMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    setInitialLoading(true);
    setPageError('');

    Promise.all([
      api.home(),
      api.categories(),
      api.products('', '', 'featured', ''),
      api.cart(demoMemberId),
      api.member(demoMemberId),
      api.orders(demoMemberId),
      api.orderPreview(demoMemberId).catch(() => emptyPreview),
      api.adminOverview(),
    ])
      .then(([homeData, categoryData, productData, cartData, memberData, orderData, previewData, adminData]) => {
        if (cancelled) {
          return;
        }

        setHome(homeData);
        setCategories(categoryData);
        setProducts(productData);
        setCart(cartData);
        setMember(memberData);
        setOrders(orderData);
        setPreview(previewData);
        setAdminOverview(adminData);
        setProductsError('');
        setBannerMessage('');
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setPageError('API 연결 전에는 정적 레이아웃만 확인할 수 있습니다. 백엔드 컨테이너 연결 상태를 확인해 주세요.');
      })
      .finally(() => {
        if (!cancelled) {
          setInitialLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    setProductsLoading(true);
    setProductsError('');

    api.products(query, category, sort, stockStatus)
      .then((productData) => {
        if (!cancelled) {
          setProducts(productData);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProductsError('필터 조건에 맞는 상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProductsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query, category, sort, stockStatus]);

  const featuredCards = useMemo(() => home?.featured ?? products.slice(0, 3), [home, products]);
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const heroBadges = useMemo(
    () => [`${categories.length} categories`, `${products.length} products`, `${cart.length} cart items`],
    [cart.length, categories.length, products.length],
  );

  const navigate = (nextPath: string, hash = '') => {
    const normalized = normalizePath(nextPath);
    const nextUrl = `${normalized}${hash}`;

    if (`${window.location.pathname}${window.location.hash}` !== nextUrl) {
      window.history.pushState({}, '', nextUrl);
    }

    setCurrentPath(normalized);

    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else if (!/jsdom/i.test(window.navigator.userAgent)) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const openProduct = async (slug: string) => {
    setDialogOpen(true);
    setDetailLoading(true);
    setDetailError('');
    setSelectedProduct(null);

    try {
      const detail = await api.productDetail(slug);
      setSelectedProduct(detail);
    } catch {
      setDetailError('상품 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeProductDialog = () => {
    setDialogOpen(false);
    setDetailLoading(false);
    setDetailError('');
    setSelectedProduct(null);
  };

  const addToCart = async () => {
    if (!selectedProduct || selectedProduct.options.length === 0) {
      return;
    }

    const firstOption = selectedProduct.options.find((option) => option.purchasable) ?? selectedProduct.options[0];
    const updatedCart = await api.addToCart(demoMemberId, selectedProduct.product.id, firstOption.id, 1);
    setCart(updatedCart);
    setPreview(await api.orderPreview(demoMemberId).catch(() => emptyPreview));
    setBannerMessage('선택한 상품을 장바구니에 담았습니다.');
  };

  const syncPreview = async (nextCart: CartItem[]) => {
    if (nextCart.length === 0) {
      setPreview(emptyPreview);
      return;
    }

    setPreview(await api.orderPreview(demoMemberId).catch(() => emptyPreview));
  };

  const updateCartQuantity = async (item: CartItem, nextQuantity: number) => {
    const nextCart =
      nextQuantity <= 0
        ? await api.removeCart(demoMemberId, item.cartItemId)
        : await api.updateCart(demoMemberId, item.cartItemId, nextQuantity);

    setCart(nextCart);
    await syncPreview(nextCart);
    setBannerMessage(nextCart.length === 0 ? '장바구니가 비어 있습니다.' : '장바구니 수량을 업데이트했습니다.');
  };

  const removeCartItem = async (item: CartItem) => {
    const nextCart = await api.removeCart(demoMemberId, item.cartItemId);
    setCart(nextCart);
    await syncPreview(nextCart);
    setBannerMessage(nextCart.length === 0 ? '장바구니가 비어 있습니다.' : '상품을 장바구니에서 삭제했습니다.');
  };

  const moveToCatalog = () => {
    navigate(homePath, '#catalog');
  };

  const showCheckoutPlaceholder = () => {
    setBannerMessage('주문/결제 기능은 다음 단계에서 연결될 예정입니다.');
  };

  const renderHeaderNav = () => {
    const sectionLinks = [
      { hash: '#catalog', label: '제품 탐색' },
      { hash: '#mypage', label: 'My Page' },
      { hash: '#admin', label: 'Admin' },
    ];

    return (
      <nav className="hidden items-center gap-1 lg:flex">
        {sectionLinks.map((item) => (
          <button
            key={item.hash}
            type="button"
            onClick={() => navigate(homePath, item.hash)}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {item.label}
          </button>
        ))}
        <a
          href={cartPath}
          onClick={(event) => {
            event.preventDefault();
            navigate(cartPath);
          }}
          className={cn(
            'rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            currentPath === cartPath ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          장바구니
        </a>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-glow text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_38%),radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_30%)]" />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <button type="button" onClick={() => navigate(homePath)} className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card shadow-sm">
              <SparkGridIcon className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Sync Apple</p>
              <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">Premium Mall</h1>
            </div>
          </button>

          {renderHeaderNav()}

          <div className="flex items-center gap-2">
            <a
              href={cartPath}
              aria-label="장바구니 페이지로 이동"
              onClick={(event) => {
                event.preventDefault();
                navigate(cartPath);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <CartIcon className="h-4 w-4 text-accent" />
              <span>장바구니</span>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{cart.length}</span>
            </a>
            <div className="hidden rounded-full border border-border/80 bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm md:flex md:items-center md:gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              Live commerce preview
            </div>
            <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-2 text-sm font-medium text-accent shadow-sm">
              {member ? `${member.name} 님` : 'Guest'}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:gap-10 lg:py-10">
        {currentPath === cartPath ? (
          <CartPage
            bannerMessage={bannerMessage}
            cart={cart}
            initialLoading={initialLoading}
            moveToCatalog={moveToCatalog}
            onDecrease={(item) => updateCartQuantity(item, item.quantity - 1)}
            onIncrease={(item) => updateCartQuantity(item, item.quantity + 1)}
            onRemove={removeCartItem}
            onProceed={showCheckoutPlaceholder}
            preview={preview ?? emptyPreview}
            productsById={productsById}
          />
        ) : (
          <>
            <section className="overflow-hidden rounded-[32px] border border-border/70 bg-slate-950 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
              <div className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1.2fr)_22rem] lg:px-10 lg:py-10">
                <div className="flex flex-col gap-8">
                  <div className="space-y-5">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-white/72 backdrop-blur-sm">
                      <span className="inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                      {home?.hero.eyebrow ?? '브랜드 경험'}
                    </div>
                    <div className="space-y-4">
                      <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                        {home?.hero.title ?? '프리미엄 전자제품 경험을 하나의 흐름으로 연결합니다.'}
                      </h2>
                      <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                        {home?.hero.subtitle ?? '미니멀한 UI와 운영 대시보드를 한 화면 흐름으로 묶어, 탐색부터 주문과 운영까지 자연스럽게 이어지도록 설계했습니다.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="lg" onClick={() => navigate(homePath, '#catalog')}>
                      Catalog 보기
                    </Button>
                    <Button size="lg" variant="secondary-dark" onClick={() => navigate(cartPath)}>
                      장바구니 페이지 보기
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {heroBadges.map((badge) => (
                      <div key={badge} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur-sm transition-colors duration-200 hover:bg-white/8">
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/80">
                    {home?.hero.imageUrl ? (
                      <img src={home.hero.imageUrl} alt={home.hero.title} className="h-full min-h-[280px] w-full object-cover" />
                    ) : (
                      <div className="flex min-h-[280px] items-center justify-center bg-[radial-gradient(circle_at_top,#1e293b,transparent_50%),linear-gradient(135deg,#0f172a,#111827_55%,#1e293b)] px-6 text-center text-sm text-slate-300">
                        이미지 없이도 프리미엄 레이아웃과 정보 밀도를 유지하는 히어로 패널
                      </div>
                    )}
                    <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-slate-400">Cart flow</p>
                          <p className="text-sm text-slate-100">헤더에서 장바구니 페이지로 이동해 목록과 합계를 한 화면에서 관리합니다.</p>
                        </div>
                        <div className="space-y-1 text-right text-xs text-slate-400">
                          <p>Dedicated route</p>
                          <p>Live totals</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
                    <div className="flex items-center gap-2 text-slate-400">
                      <PulseIcon className="h-4 w-4" />
                      운영 요약
                    </div>
                    <p className="mt-3 text-lg font-medium text-white">탐색과 장바구니 관리 흐름을 분리해 상품 확인과 결제 준비 단계를 더 분명하게 정리했습니다.</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="grid gap-3 md:grid-cols-3">
                <QuickSummaryCard label="큐레이션" value={featuredCards.length} description="메인에 노출되는 대표 상품" />
                <QuickSummaryCard label="결제 예정" value={preview?.items.length ?? 0} description="장바구니에 담긴 품목 수" />
                <QuickSummaryCard label="운영 알림" value={adminOverview?.recentOrders.length ?? 0} description="최근 주문 트래킹 항목" />
              </div>
              {bannerMessage ? <InlineBanner tone="success">{bannerMessage}</InlineBanner> : null}
            </div>

            {completedOrder ? (
              <Card className="overflow-hidden border-emerald-500/20 bg-[linear-gradient(135deg,rgba(240,253,244,0.98),rgba(236,253,245,0.92))]">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-emerald-700">Order complete</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">주문이 완료되었습니다</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">주문번호와 배송 일정을 바로 확인할 수 있도록 완료 정보를 크게 노출했습니다.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-emerald-500/15 bg-white/85 p-5 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">주문번호</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{completedOrder.orderNumber}</p>
                    </div>
                    <div className="rounded-[24px] border border-emerald-500/15 bg-white/85 p-5 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">예상 배송일</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{estimateDeliveryDate(completedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}

            {pageError ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <EmptyState title="데이터 연결을 완료하지 못했습니다" description={pageError} tone="critical" />
              </Card>
            ) : null}

            <section className="grid gap-4 md:grid-cols-3">
              {(initialLoading ? Array.from({ length: 3 }) : featuredCards).map((product, index) =>
                initialLoading ? (
                  <Card key={`featured-skeleton-${index}`} className="overflow-hidden p-0">
                    <SkeletonBlock className="h-56 rounded-none" />
                    <div className="space-y-3 p-6">
                      <SkeletonBlock className="h-4 w-24" />
                      <SkeletonBlock className="h-8 w-4/5" />
                      <SkeletonBlock className="h-4 w-full" />
                      <SkeletonBlock className="h-4 w-2/3" />
                    </div>
                  </Card>
                ) : (
                  (() => {
                    const featuredProduct = product as ProductSummary;
                    const soldOut = isSoldOut(featuredProduct);

                    return (
                      <button
                        key={featuredProduct.id}
                        onClick={() => openProduct(featuredProduct.slug)}
                        className={cn(
                          'group overflow-hidden rounded-[28px] border border-border bg-card text-left shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          soldOut ? 'opacity-60' : 'hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg',
                        )}
                      >
                        <div className="relative h-56 overflow-hidden bg-muted">
                          {featuredProduct.heroImageUrl ? (
                            <img
                              src={featuredProduct.heroImageUrl}
                              alt={featuredProduct.name}
                              className={cn('h-full w-full object-cover transition-transform duration-500', soldOut ? 'grayscale' : 'group-hover:scale-[1.04]')}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eff6ff,#e2e8f0_40%,#f8fafc)] text-sm text-muted-foreground">
                              이미지 준비 중
                            </div>
                          )}
                          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
                            <Badge>{featuredProduct.badge ?? featuredProduct.categoryName}</Badge>
                            <Badge variant={soldOut ? 'outline' : 'secondary'}>{soldOut ? '품절' : `재고 ${featuredProduct.availableStock}`}</Badge>
                          </div>
                        </div>
                        <div className="space-y-4 p-6">
                          <div className="space-y-2">
                            <h3 className="text-2xl font-semibold tracking-tight text-foreground">{featuredProduct.name}</h3>
                            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{featuredProduct.shortDescription}</p>
                          </div>
                          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                            <p className="text-lg font-semibold text-foreground">{formatPrice(featuredProduct.salePrice ?? featuredProduct.price)}</p>
                            <span className="text-sm font-medium text-accent transition-transform duration-200 group-hover:translate-x-1">자세히 보기 →</span>
                          </div>
                        </div>
                      </button>
                    );
                  })()
                ),
              )}
            </section>

            <section id="catalog" className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_23rem]">
              <Card className="overflow-hidden p-0 xl:col-span-2">
                <div className="border-b border-border px-6 py-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading
                      eyebrow="Catalog"
                      title="브랜드 큐레이션 상품 탐색"
                      description="장바구니 페이지 분리 이후에도 상품 탐색 흐름은 홈에서 이어지고, 담은 뒤에는 전용 페이지에서 수량과 합계를 관리할 수 있습니다."
                    />
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <MetaPill label="카테고리" value={categories.length} />
                      <MetaPill label="검색 결과" value={products.length} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 px-6 py-6">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <FieldGroup label="검색">
                      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="상품명 또는 카테고리 검색" />
                    </FieldGroup>
                    <FieldGroup label="카테고리">
                      <Select value={category} onChange={(event) => setCategory(event.target.value)}>
                        <option value="">전체 카테고리</option>
                        {categories.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                    </FieldGroup>
                    <FieldGroup label="정렬">
                      <Select value={sort} onChange={(event) => setSort(event.target.value)}>
                        <option value="featured">추천순</option>
                        <option value="popular">인기순</option>
                        <option value="newest">최신순</option>
                        <option value="price_asc">낮은 가격순</option>
                        <option value="price_desc">높은 가격순</option>
                      </Select>
                    </FieldGroup>
                    <FieldGroup label="재고 상태">
                      <Select value={stockStatus} onChange={(event) => setStockStatus(event.target.value)}>
                        <option value="">전체 재고 상태</option>
                        <option value="in_stock">재고 있음</option>
                        <option value="low_stock">수량 적음</option>
                        <option value="sold_out">품절</option>
                      </Select>
                    </FieldGroup>
                  </div>

                  {productsError ? <InlineBanner tone="critical">{productsError}</InlineBanner> : null}

                  {productsLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={`product-skeleton-${index}`} className="overflow-hidden p-0">
                          <SkeletonBlock className="h-44 rounded-none" />
                          <div className="space-y-3 p-5">
                            <SkeletonBlock className="h-4 w-20" />
                            <SkeletonBlock className="h-7 w-3/4" />
                            <SkeletonBlock className="h-4 w-full" />
                            <SkeletonBlock className="h-4 w-2/3" />
                            <div className="flex items-center justify-between pt-2">
                              <SkeletonBlock className="h-5 w-24" />
                              <SkeletonBlock className="h-10 w-24 rounded-full" />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <EmptyState
                      title="조건에 맞는 상품이 없습니다"
                      description="검색어 또는 필터를 조정해 다른 카테고리와 재고 상태를 확인해 보세요."
                      actionLabel="필터 초기화"
                      onAction={() => {
                        setQuery('');
                        setCategory('');
                        setSort('featured');
                        setStockStatus('');
                      }}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {products.map((product) => {
                        const soldOut = isSoldOut(product);

                        return (
                          <article
                            key={product.id}
                            className={cn(
                              'overflow-hidden rounded-[26px] border border-border bg-card transition-all duration-300',
                              soldOut ? 'opacity-60' : 'hover:border-accent/30 hover:shadow-md',
                            )}
                          >
                            <div className="relative h-44 overflow-hidden bg-muted">
                              {product.heroImageUrl ? (
                                <img
                                  src={product.heroImageUrl}
                                  alt={product.name}
                                  className={cn('h-full w-full object-cover transition-transform duration-500', soldOut ? 'grayscale' : 'hover:scale-[1.03]')}
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">이미지 없음</div>
                              )}
                              {soldOut ? (
                                <div className="absolute right-4 top-4">
                                  <Badge variant="outline">품절</Badge>
                                </div>
                              ) : null}
                            </div>
                            <div className="space-y-4 p-5">
                              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                <span>{product.categoryName}</span>
                                <span>{soldOut ? '품절' : `재고 ${product.availableStock}`}</span>
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-xl font-semibold tracking-tight text-foreground">{product.name}</h3>
                                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{product.shortDescription}</p>
                              </div>
                              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                                <p className="text-base font-semibold text-foreground">{formatPrice(product.salePrice ?? product.price)}</p>
                                <Button size="sm" onClick={() => openProduct(product.slug)}>
                                  상세 보기
                                </Button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <Card id="mypage">
                <SectionHeading eyebrow="My Page" title="회원 및 주문 이력" description="회원 상태와 최근 주문 정보를 카드 톤으로 나눠, 읽는 순서를 분명하게 정리했습니다." />

                <div className="mt-5 rounded-[24px] border border-border bg-muted/60 p-4">
                  {initialLoading ? (
                    <div className="space-y-3">
                      <SkeletonBlock className="h-5 w-32" />
                      <SkeletonBlock className="h-4 w-48" />
                      <SkeletonBlock className="h-4 w-24" />
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">{member?.name ?? '기본 회원'}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{member?.email ?? 'member@syncapple.dev'}</p>
                      <p className="mt-3 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Active member</p>
                    </>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  {initialLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={`order-skeleton-${index}`} className="bg-card/70 p-4">
                        <SkeletonBlock className="h-4 w-32" />
                        <SkeletonBlock className="mt-3 h-4 w-24" />
                        <SkeletonBlock className="mt-4 h-3 w-full" />
                      </Card>
                    ))
                  ) : orders.length === 0 ? (
                    <EmptyState title="아직 주문 이력이 없습니다" description="장바구니에서 결제 흐름이 연결되면 최근 주문 카드가 이 영역에 표시됩니다." />
                  ) : (
                    orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="rounded-[22px] border border-border bg-card px-4 py-4 transition-colors duration-200 hover:bg-muted/40">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {order.paymentStatus} · {order.orderStatus}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{formatPrice(order.totalAmount)}</p>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">배송지: {order.shippingAddress?.line1 ?? '기본 배송지'}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card id="admin" className="overflow-hidden p-0">
                <div className="border-b border-border px-6 py-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading
                      eyebrow="Admin"
                      title="운영 Dashboard"
                      description="주문 추적 테이블과 요약 카드를 분리해 운영 시선이 숫자에서 상태로 자연스럽게 이동하도록 구성했습니다."
                    />
                    <div className="rounded-2xl border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground">공개 화면과 운영 화면을 한 리듬 안에서 분리해 밀도를 유지합니다.</div>
                  </div>
                </div>

                <div className="space-y-6 px-6 py-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {(initialLoading
                      ? Array.from({ length: 4 }).map((_, index) => ({ id: `metric-${index}` }))
                      : [
                          { id: 'active-products', label: '공개 상품', value: adminOverview?.activeProducts ?? 0 },
                          { id: 'active-members', label: '활성 회원', value: adminOverview?.activeMembers ?? 0 },
                          { id: 'open-orders', label: '진행 주문', value: adminOverview?.openOrders ?? 0 },
                          { id: 'live-banners', label: '라이브 배너', value: adminOverview?.liveBanners ?? 0 },
                        ]).map((metric) =>
                      'label' in metric ? (
                        <MetricCard key={metric.id} label={metric.label} value={metric.value} />
                      ) : (
                        <Card key={metric.id} className="p-5">
                          <SkeletonBlock className="h-4 w-20" />
                          <SkeletonBlock className="mt-4 h-9 w-24" />
                        </Card>
                      ),
                    )}
                  </div>

                  <div className="overflow-hidden rounded-[24px] border border-border bg-card">
                    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">최근 주문</p>
                        <p className="mt-1 text-sm text-muted-foreground">실시간 운영 상태를 빠르게 확인할 수 있는 요약 테이블입니다.</p>
                      </div>
                      <Badge variant="outline">{adminOverview?.recentOrders.length ?? 0} rows</Badge>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-muted/60 text-muted-foreground">
                          <tr>
                            <th className="px-5 py-4 font-medium">주문번호</th>
                            <th className="px-5 py-4 font-medium">상태</th>
                            <th className="px-5 py-4 font-medium">결제</th>
                            <th className="px-5 py-4 font-medium">금액</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {initialLoading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                              <tr key={`admin-row-skeleton-${index}`}>
                                <td className="px-5 py-4" colSpan={4}>
                                  <SkeletonBlock className="h-5 w-full" />
                                </td>
                              </tr>
                            ))
                          ) : adminOverview?.recentOrders.length ? (
                            adminOverview.recentOrders.map((order) => (
                              <tr key={order.id} className="transition-colors duration-200 hover:bg-muted/40">
                                <td className="px-5 py-4 font-medium text-foreground">{order.orderNumber}</td>
                                <td className="px-5 py-4 text-muted-foreground">{order.orderStatus}</td>
                                <td className="px-5 py-4 text-muted-foreground">{order.paymentStatus}</td>
                                <td className="px-5 py-4 font-medium text-foreground">{formatPrice(order.totalAmount)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-5 py-8" colSpan={4}>
                                <EmptyState title="주문 데이터가 아직 없습니다" description="첫 주문이 생성되면 이 표에서 결제 상태와 진행 상황을 확인할 수 있습니다." />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </>
        )}
      </main>

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[32px] border border-border bg-background shadow-[0_32px_96px_rgba(15,23,42,0.28)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">Product detail</p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {selectedProduct?.product.name ?? (detailLoading ? '상품 정보를 불러오는 중' : '상세 정보')}
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={closeProductDialog}>
                닫기
              </Button>
            </div>

            <div className="p-6 md:p-8">
              {detailLoading ? (
                <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
                  <SkeletonBlock className="min-h-[320px] rounded-[26px]" />
                  <div className="space-y-4">
                    <SkeletonBlock className="h-4 w-24" />
                    <SkeletonBlock className="h-10 w-3/4" />
                    <SkeletonBlock className="h-4 w-full" />
                    <SkeletonBlock className="h-4 w-5/6" />
                    <SkeletonBlock className="h-24 w-full rounded-[24px]" />
                    <SkeletonBlock className="h-14 w-full rounded-[20px]" />
                    <SkeletonBlock className="h-14 w-full rounded-[20px]" />
                  </div>
                </div>
              ) : detailError ? (
                <EmptyState title="상세 정보를 불러오지 못했습니다" description={detailError} tone="critical" />
              ) : selectedProduct ? (
                <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="overflow-hidden rounded-[28px] border border-border bg-muted">
                    {selectedProduct.product.heroImageUrl ? (
                      <img src={selectedProduct.product.heroImageUrl} alt={selectedProduct.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">이미지를 준비 중입니다.</div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Badge>{selectedProduct.product.categoryName}</Badge>
                      <div>
                        <h3 className="text-3xl font-semibold tracking-tight text-foreground">{selectedProduct.product.name}</h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{selectedProduct.product.shortDescription}</p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-border bg-muted/60 p-5">
                      <p className="text-sm text-muted-foreground">판매가</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{formatPrice(selectedProduct.product.salePrice ?? selectedProduct.product.price)}</p>
                    </div>

                    <div className="space-y-3">
                      {selectedProduct.options.length === 0 ? (
                        <EmptyState title="선택 가능한 옵션이 없습니다" description="상품 옵션 데이터가 연결되면 재고와 구매 가능 여부가 이 영역에 표시됩니다." />
                      ) : (
                        selectedProduct.options.map((option) => (
                          <div key={option.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-border bg-card px-4 py-4 transition-colors duration-200 hover:bg-muted/40">
                            <div>
                              <p className="font-medium text-foreground">{option.optionName}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{option.optionValue}</p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <p>{option.purchasable ? '구매 가능' : '품절'}</p>
                              <p className="mt-1">재고 {option.stockQuantity}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button size="lg" onClick={addToCart}>
                        장바구니에 담기
                      </Button>
                      <Button size="lg" variant="secondary" onClick={() => navigate(cartPath)}>
                        장바구니로 이동
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CartPage({
  bannerMessage,
  cart,
  initialLoading,
  moveToCatalog,
  onDecrease,
  onIncrease,
  onProceed,
  onRemove,
  preview,
  productsById,
}: {
  bannerMessage: string;
  cart: CartItem[];
  initialLoading: boolean;
  moveToCatalog: () => void;
  onDecrease: (item: CartItem) => void;
  onIncrease: (item: CartItem) => void;
  onProceed: () => void;
  onRemove: (item: CartItem) => void;
  preview: OrderPreview;
  productsById: Map<number, ProductSummary>;
}) {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-6 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Cart"
                title="장바구니"
                description="담은 상품을 전용 페이지에서 수량, 삭제, 총 결제 예정 금액까지 한 번에 관리할 수 있습니다."
              />
              <Badge variant="outline">{cart.length} items</Badge>
            </div>
          </div>

          <div className="px-6 py-6">
            {bannerMessage ? <InlineBanner tone="success">{bannerMessage}</InlineBanner> : null}

            {initialLoading ? (
              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={`cart-page-skeleton-${index}`} className="p-5">
                    <SkeletonBlock className="h-5 w-32" />
                    <SkeletonBlock className="mt-4 h-4 w-full" />
                    <SkeletonBlock className="mt-3 h-10 w-full rounded-2xl" />
                  </Card>
                ))}
              </div>
            ) : cart.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <InboxIcon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-foreground">장바구니가 비어 있습니다</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">원하는 상품을 담으면 이 페이지에서 수량을 조정하고 총 결제 예정 금액을 바로 확인할 수 있습니다.</p>
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    moveToCatalog();
                  }}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  쇼핑 계속하기
                </a>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-[28px] border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed text-left text-sm">
                    <thead className="bg-muted/60 text-muted-foreground">
                      <tr>
                        <th className="w-[30%] px-5 py-4 font-medium">상품명</th>
                        <th className="w-[18%] px-5 py-4 font-medium">이미지</th>
                        <th className="w-[14%] px-5 py-4 font-medium">단가</th>
                        <th className="w-[22%] px-5 py-4 font-medium">수량</th>
                        <th className="w-[16%] px-5 py-4 font-medium">소계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => {
                        const cartProduct = productsById.get(item.productId);
                        const soldOut = cartProduct ? isSoldOut(cartProduct) : false;

                        return (
                          <tr key={item.cartItemId} className="border-t border-border align-top">
                            <td className="px-5 py-5">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-foreground">{item.productName}</p>
                                  {soldOut ? <Badge variant="outline">품절</Badge> : null}
                                </div>
                                <p className="text-sm text-muted-foreground">{item.optionLabel}</p>
                              </div>
                            </td>
                            <td className="px-5 py-5">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.productName} className="h-20 w-20 rounded-2xl object-cover" />
                              ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted text-xs text-muted-foreground">이미지 없음</div>
                              )}
                            </td>
                            <td className="px-5 py-5 font-medium text-foreground">{formatPrice(item.unitPrice)}</td>
                            <td className="px-5 py-5">
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full px-0" onClick={() => onDecrease(item)} ariaLabel={`${item.productName} 수량 감소`}>
                                    −
                                  </Button>
                                  <span className="min-w-6 text-center font-semibold text-foreground">{item.quantity}</span>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full px-0" onClick={() => onIncrease(item)} ariaLabel={`${item.productName} 수량 증가`}>
                                    +
                                  </Button>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => onRemove(item)} ariaLabel={`${item.productName} 삭제`}>
                                  삭제
                                </Button>
                              </div>
                            </td>
                            <td className="px-5 py-5 font-semibold text-foreground">{formatPrice(item.lineTotal)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="border-slate-900/90 bg-slate-950 text-white shadow-[0_25px_80px_rgba(15,23,42,0.2)]">
          <SectionHeading
            eyebrow="Checkout summary"
            title="총 결제 예정 금액"
            description="수량 변경과 삭제 결과가 즉시 반영되는 결제 요약 영역입니다."
            invert
          />

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/8 p-5">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>상품 합계</span>
              <span>{formatPrice(preview.subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
              <span>배송비</span>
              <span>{formatPrice(preview.shippingFee)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-base font-semibold text-white">
              <span>총 결제 예정 금액</span>
              <span>{formatPrice(preview.totalAmount)}</span>
            </div>
            <Button className="mt-5 w-full" size="lg" variant="light" onClick={onProceed}>
              주문/결제 진행
            </Button>
            <p className="mt-3 text-xs leading-5 text-slate-400">실제 결제 연동과 주문 저장은 다음 단계에서 연결됩니다.</p>
          </div>
        </Card>
      </div>
    </>
  );
}

function Button({
  ariaLabel,
  asChild,
  children,
  className,
  onClick,
  size = 'default',
  variant = 'default',
}: {
  ariaLabel?: string;
  asChild?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'secondary-dark' | 'ghost' | 'light';
}) {
  const sizeClass =
    size === 'sm'
      ? 'h-9 px-4 text-xs'
      : size === 'lg'
        ? 'h-12 px-5 text-sm'
        : 'h-10 px-4 text-sm';

  const variantClass =
    variant === 'secondary'
      ? 'border border-border bg-card text-foreground hover:bg-muted'
      : variant === 'secondary-dark'
        ? 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
        : variant === 'ghost'
          ? 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
          : variant === 'light'
            ? 'bg-white text-slate-950 hover:bg-slate-100'
            : 'bg-accent text-white hover:bg-sky-600';

  const classes = cn(
    'inline-flex items-center justify-center rounded-full font-medium shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    sizeClass,
    variantClass,
    className,
  );

  if (asChild && isAnchorChild(children)) {
    return (
      <a href={children.props.href} className={classes}>
        {children.props.children}
      </a>
    );
  }

  return (
    <button type="button" aria-label={ariaLabel} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

function isAnchorChild(children: ReactNode): children is ReactElement<{ href: string; children: ReactNode }> {
  if (!children || typeof children !== 'object' || !('props' in children)) {
    return false;
  }

  return typeof children.props.href === 'string';
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground shadow-sm transition-colors duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        props.className,
      )}
    />
  );
}

function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        props.className,
      )}
    />
  );
}

function FieldGroup({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Card({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={cn('rounded-[30px] border border-border bg-card p-6 shadow-sm', className)}>{children}</section>;
}

function Badge({ children, className, variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'secondary' | 'secondary-dark' | 'outline' }) {
  const variantClass =
    variant === 'secondary'
      ? 'border-transparent bg-emerald-500/10 text-emerald-700'
      : variant === 'secondary-dark'
        ? 'border-white/10 bg-white/8 text-slate-200'
        : variant === 'outline'
          ? 'border-border bg-background/70 text-muted-foreground'
          : 'border-accent/10 bg-accent/10 text-accent';

  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em]', variantClass, className)}>
      {children}
    </span>
  );
}

function SectionHeading({
  description,
  eyebrow,
  invert = false,
  title,
}: {
  description: string;
  eyebrow: string;
  invert?: boolean;
  title: string;
}) {
  const titleTag = invert ? 'h3' : 'h2';
  const Title = titleTag;

  return (
    <div>
      <p className={cn('text-xs font-medium uppercase tracking-[0.28em]', invert ? 'text-slate-400' : 'text-muted-foreground')}>
        {eyebrow}
      </p>
      <Title className={cn('mt-2 text-2xl font-semibold tracking-tight sm:text-3xl', invert ? 'text-white' : 'text-foreground')}>{title}</Title>
      <p className={cn('mt-2 max-w-2xl text-sm leading-6', invert ? 'text-slate-300' : 'text-muted-foreground')}>{description}</p>
    </div>
  );
}

function QuickSummaryCard({ description, label, value }: { description: string; label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function InlineBanner({ children, tone = 'success' }: { children: React.ReactNode; tone?: 'success' | 'critical' }) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm shadow-sm',
        tone === 'critical' ? 'border-destructive/20 bg-destructive/5 text-destructive' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
      )}
    >
      {children}
    </div>
  );
}

function EmptyState({
  actionLabel,
  description,
  onAction,
  title,
  tone = 'default',
}: {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
  tone?: 'default' | 'critical' | 'inverted';
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[24px] border border-dashed px-6 py-10 text-center',
        tone === 'critical'
          ? 'border-destructive/20 bg-destructive/5'
          : tone === 'inverted'
            ? 'border-white/10 bg-white/5'
            : 'border-border bg-muted/30',
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-2xl',
          tone === 'critical' ? 'bg-destructive/10 text-destructive' : tone === 'inverted' ? 'bg-white/10 text-white' : 'bg-accent/10 text-accent',
        )}
      >
        <InboxIcon className="h-5 w-5" />
      </div>
      <h3 className={cn('mt-4 text-lg font-semibold', tone === 'inverted' ? 'text-white' : 'text-foreground')}>{title}</h3>
      <p className={cn('mt-2 max-w-md text-sm leading-6', tone === 'inverted' ? 'text-slate-300' : 'text-muted-foreground')}>{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" variant={tone === 'inverted' ? 'light' : 'default'} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-muted', className)} />;
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function SparkGridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path d="M8 3v6H3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 8h-6V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 21v-6H3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 16h-6v5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </svg>
  );
}

function PulseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path d="M3 12h4l2.5-5 5 10 2.5-5H21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path d="M4 13.5V6.75A1.75 1.75 0 0 1 5.75 5h12.5A1.75 1.75 0 0 1 20 6.75v6.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13.5h4.5l1.5 2h4l1.5-2H20V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path d="M3.5 4.5h2l1.8 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.76l1.48-5.74H7.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  );
}

export default App;
