import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { AdminOverview, CartItem, Category, HomeContent, Member, OrderPreview, OrderRecord, ProductDetail, ProductSummary } from './types';
import { ScreenHeader } from './components/ui';
import {
  AdminOverviewSection,
  CartSection,
  CatalogSection,
  FeaturedProducts,
  HeroSection,
  MyPageSection,
  OrderCompletion,
  PageError,
  SummarySection,
} from './components/sections';

const demoMemberId = 301;
const emptyPreview: OrderPreview = { items: [], subtotal: 0, shippingFee: 0, totalAmount: 0 };

function App() {
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
    let cancelled = false;
    setInitialLoading(true);
    setPageError('');
    Promise.all([
      api.home(), api.categories(), api.products('', '', 'featured', ''), api.cart(demoMemberId),
      api.member(demoMemberId), api.orders(demoMemberId), api.orderPreview(demoMemberId).catch(() => emptyPreview),
      api.adminOverview(),
    ]).then(([homeData, categoryData, productData, cartData, memberData, orderData, previewData, adminData]) => {
      if (cancelled) return;
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
    }).catch(() => {
      if (!cancelled) setPageError('API 연결 전에는 정적 레이아웃만 확인할 수 있습니다. 백엔드 컨테이너 연결 상태를 확인해 주세요.');
    }).finally(() => {
      if (!cancelled) setInitialLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);
    setProductsError('');
    api.products(query, category, sort, stockStatus).then((data) => {
      if (!cancelled) setProducts(data);
    }).catch(() => {
      if (!cancelled) setProductsError('필터 조건에 맞는 상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }).finally(() => {
      if (!cancelled) setProductsLoading(false);
    });
    return () => { cancelled = true; };
  }, [query, category, sort, stockStatus]);

  const featuredCards = useMemo(() => home?.featured ?? products.slice(0, 3), [home, products]);
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const heroBadges = useMemo(() => [
    `${categories.length} categories`, `${products.length} products`, `${cart.length} cart items`,
  ], [cart.length, categories.length, products.length]);

  const openProduct = async (slug: string) => {
    setDialogOpen(true);
    setDetailLoading(true);
    setDetailError('');
    setSelectedProduct(null);
    try {
      setSelectedProduct(await api.productDetail(slug));
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
    if (!selectedProduct || selectedProduct.options.length === 0) return;
    const firstOption = selectedProduct.options.find((option) => option.purchasable) ?? selectedProduct.options[0];
    setCart(await api.addToCart(demoMemberId, selectedProduct.product.id, firstOption.id, 1));
    setPreview(await api.orderPreview(demoMemberId));
    setBannerMessage('선택한 상품을 Cart에 담았습니다.');
  };

  const syncPreview = async (nextCart: CartItem[]) => {
    setPreview(nextCart.length === 0 ? emptyPreview : await api.orderPreview(demoMemberId).catch(() => emptyPreview));
  };

  const updateCartQuantity = async (item: CartItem, nextQuantity: number) => {
    const nextCart = nextQuantity <= 0
      ? await api.removeCart(demoMemberId, item.cartItemId)
      : await api.updateCart(demoMemberId, item.cartItemId, nextQuantity);
    setCart(nextCart);
    await syncPreview(nextCart);
    setBannerMessage(nextCart.length === 0 ? '장바구니를 비웠습니다.' : '장바구니 수량을 업데이트했습니다.');
  };

  const submitOrder = async () => {
    const order = await api.createOrder(demoMemberId, 401, `web-${Date.now()}`);
    setOrders((currentOrders) => [order, ...currentOrders]);
    setCompletedOrder(order);
    setPreview(await api.orderPreview(demoMemberId).catch(() => emptyPreview));
    setBannerMessage(`주문이 완료되었습니다. 주문번호 ${order.orderNumber}`);
  };

  const resetFilters = () => {
    setQuery('');
    setCategory('');
    setSort('featured');
    setStockStatus('');
  };

  return (
    <div className="min-h-screen bg-glow text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_38%),radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_30%)]" />
      <ScreenHeader member={member} />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:gap-10 lg:py-10">
        <HeroSection home={home} badges={heroBadges} />
        <SummarySection featuredCount={featuredCards.length} previewItemCount={preview?.items.length ?? 0} recentOrderCount={adminOverview?.recentOrders.length ?? 0} bannerMessage={bannerMessage} />
        <OrderCompletion order={completedOrder} />
        <PageError message={pageError} />
        <FeaturedProducts products={featuredCards} loading={initialLoading} onOpenProduct={openProduct} />
        <section id="catalog" className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_23rem]">
          <CatalogSection categories={categories} products={products} query={query} category={category} sort={sort} stockStatus={stockStatus} loading={productsLoading} error={productsError} dialogOpen={dialogOpen} selectedProduct={selectedProduct} detailLoading={detailLoading} detailError={detailError} onQueryChange={setQuery} onCategoryChange={setCategory} onSortChange={setSort} onStockStatusChange={setStockStatus} onResetFilters={resetFilters} onOpenProduct={openProduct} onCloseProduct={closeProductDialog} onAddToCart={addToCart} onSubmitOrder={submitOrder} />
          <div className="flex flex-col gap-6">
            <CartSection cart={cart} productsById={productsById} preview={preview} loading={initialLoading} onMoveToCatalog={() => { window.location.hash = 'catalog'; }} onUpdateQuantity={updateCartQuantity} onSubmitOrder={submitOrder} />
            <MyPageSection member={member} orders={orders} loading={initialLoading} />
          </div>
        </section>
        <AdminOverviewSection overview={adminOverview} loading={initialLoading} />
      </main>
    </div>
  );
}

export default App;
