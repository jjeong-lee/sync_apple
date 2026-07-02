import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { api } from './api';
import type { AdminOverview, CartItem, Category, HomeContent, Member, OrderPreview, OrderRecord, ProductDetail, ProductSummary } from './types';

vi.mock('./api', () => ({
  api: {
    home: vi.fn(),
    categories: vi.fn(),
    products: vi.fn(),
    cart: vi.fn(),
    member: vi.fn(),
    orders: vi.fn(),
    orderPreview: vi.fn(),
    adminOverview: vi.fn(),
    productDetail: vi.fn(),
    addToCart: vi.fn(),
    updateCart: vi.fn(),
    removeCart: vi.fn(),
    createOrder: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const categories: Category[] = [
  { id: 4, name: '노트북', slug: 'laptops', parentId: 1, active: true, sortOrder: 1 },
];

const inStockProduct: ProductSummary = {
  id: 101,
  categoryId: 4,
  categoryName: '노트북',
  name: 'AstraBook Pro 14',
  slug: 'astrabook-pro-14',
  shortDescription: '크리에이터를 위한 14형 프리미엄 퍼포먼스 노트북',
  price: 2890000,
  salePrice: 2690000,
  heroImageUrl: null,
  badge: 'New',
  visible: true,
  saleStatus: 'ON_SALE',
  featured: true,
  bestSeller: true,
  newArrival: true,
  sortOrder: 1,
  availableStock: 14,
};

const soldOutProduct: ProductSummary = {
  id: 104,
  categoryId: 3,
  categoryName: '액세서리',
  name: 'SilkCharge Duo',
  slug: 'silkcharge-duo',
  shortDescription: '가죽 마감의 무선 충전 스탠드',
  price: 189000,
  salePrice: 169000,
  heroImageUrl: null,
  badge: null,
  visible: true,
  saleStatus: 'ON_SALE',
  featured: false,
  bestSeller: false,
  newArrival: true,
  sortOrder: 4,
  availableStock: 0,
};

const home: HomeContent = {
  hero: {
    id: 201,
    title: 'Premium Mall',
    subtitle: '프리미엄 전자제품 경험을 연결합니다.',
    eyebrow: '브랜드 경험',
    ctaLabel: 'Catalog 보기',
    targetPath: '/products/astrabook-pro-14',
    imageUrl: null,
  },
  featured: [inStockProduct, soldOutProduct],
  bestSellers: [inStockProduct],
  newArrivals: [soldOutProduct],
  promotions: [],
};

const member: Member = {
  id: 301,
  email: 'member@syncapple.dev',
  name: '기본 회원',
  role: 'MEMBER',
  status: 'ACTIVE',
};

const cartItems: CartItem[] = [
  {
    cartItemId: 501,
    productId: 101,
    productName: 'AstraBook Pro 14',
    productSlug: 'astrabook-pro-14',
    optionId: 1001,
    optionLabel: '16GB / 512GB',
    quantity: 1,
    unitPrice: 2690000,
    lineTotal: 2690000,
    imageUrl: null,
  },
];

const updatedCartItems: CartItem[] = [
  {
    ...cartItems[0],
    quantity: 2,
    lineTotal: 5380000,
  },
];

const preview: OrderPreview = {
  items: [
    {
      productId: 101,
      optionId: 1001,
      productName: 'AstraBook Pro 14',
      optionSummary: '16GB / 512GB',
      quantity: 1,
      unitPrice: 2690000,
      lineTotal: 2690000,
    },
  ],
  subtotal: 2690000,
  shippingFee: 3000,
  totalAmount: 2693000,
};

const updatedPreview: OrderPreview = {
  ...preview,
  items: [
    {
      ...preview.items[0],
      quantity: 2,
      lineTotal: 5380000,
    },
  ],
  subtotal: 5380000,
  totalAmount: 5383000,
};

const createdOrder: OrderRecord = {
  id: 9001,
  orderNumber: 'ORD-20260702-9001',
  paymentMethod: 'CARD',
  paymentStatus: 'PAID',
  orderStatus: 'PLACED',
  totalAmount: 5383000,
  createdAt: '2026-07-02T10:30:00',
  shippingAddress: {
    id: 401,
    memberId: 301,
    label: '집',
    recipientName: '기본 회원',
    phone: '010-1111-2222',
    line1: '서울시 강남구 테헤란로 10',
    line2: '18층',
    postalCode: '06123',
    defaultAddress: true,
  },
  items: updatedPreview.items,
};

const adminOverview: AdminOverview = {
  activeProducts: 4,
  activeMembers: 2,
  openOrders: 1,
  liveBanners: 2,
  recentOrders: [],
};

const productDetail: ProductDetail = {
  product: inStockProduct,
  options: [
    {
      id: 1001,
      optionName: '메모리',
      optionValue: '16GB / 512GB',
      sku: 'ABP14-16-512',
      stockQuantity: 14,
      purchasable: true,
    },
  ],
  relatedProducts: [soldOutProduct],
};

function mockInitialLoad(overrides?: {
  cart?: CartItem[];
  preview?: OrderPreview;
  orders?: OrderRecord[];
  products?: ProductSummary[];
}) {
  mockedApi.home.mockResolvedValue(home);
  mockedApi.categories.mockResolvedValue(categories);
  mockedApi.products.mockResolvedValue(overrides?.products ?? [inStockProduct, soldOutProduct]);
  mockedApi.cart.mockResolvedValue(overrides?.cart ?? cartItems);
  mockedApi.member.mockResolvedValue(member);
  mockedApi.orders.mockResolvedValue(overrides?.orders ?? []);
  mockedApi.orderPreview.mockResolvedValue(overrides?.preview ?? preview);
  mockedApi.adminOverview.mockResolvedValue(adminOverview);
  mockedApi.productDetail.mockResolvedValue(productDetail);
}

async function findCartSection() {
  const cartHeading = await screen.findByText('현재 담긴 상품');
  const cartSection = cartHeading.closest('section');

  if (!cartSection) {
    throw new Error('Cart section not found');
  }

  return cartSection;
}

describe('App UX updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows sold out products dimmed with a badge and formats prices with thousands separators', async () => {
    mockInitialLoad();

    render(<App />);

    const soldOutTitle = (await screen.findAllByText('SilkCharge Duo'))[1];
    const soldOutCard = soldOutTitle.closest('article');

    expect(soldOutCard).toHaveClass('opacity-60');
    expect(within(soldOutCard as HTMLElement).getAllByText('품절').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2,690,000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('169,000').length).toBeGreaterThan(0);
    expect(screen.queryByText('₩2,690,000')).not.toBeInTheDocument();
  });

  it('lets shoppers change quantity from the cart and updates totals immediately', async () => {
    mockInitialLoad();
    mockedApi.updateCart.mockResolvedValue(updatedCartItems);
    mockedApi.orderPreview.mockResolvedValueOnce(preview).mockResolvedValueOnce(updatedPreview);

    render(<App />);

    const cartSection = await findCartSection();
    await userEvent.click(within(cartSection).getByRole('button', { name: '+' }));

    await waitFor(() => {
      expect(mockedApi.updateCart).toHaveBeenCalledWith(301, 501, 2);
    });

    expect(within(cartSection).getByText('수량 2')).toBeInTheDocument();
    expect(within(cartSection).getAllByText('5,380,000').length).toBeGreaterThan(0);
    expect(within(cartSection).getByText('5,383,000')).toBeInTheDocument();
  });

  it('shows an empty cart message with a continue shopping action when the cart is empty', async () => {
    mockInitialLoad({ cart: [], preview: { items: [], subtotal: 0, shippingFee: 0, totalAmount: 0 } });

    render(<App />);

    expect(await screen.findByText('장바구니가 비었습니다')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '쇼핑 계속하기' })).toHaveAttribute('href', '#catalog');
  });

  it('shows a prominent order completion summary with order number and expected delivery date', async () => {
    mockInitialLoad({ cart: updatedCartItems, preview: updatedPreview });
    mockedApi.createOrder.mockResolvedValue(createdOrder);
    mockedApi.orderPreview.mockResolvedValueOnce(updatedPreview).mockResolvedValueOnce({
      items: [],
      subtotal: 0,
      shippingFee: 0,
      totalAmount: 0,
    });

    render(<App />);

    const cartSection = await findCartSection();
    await userEvent.click(within(cartSection).getByRole('button', { name: '주문 완료 시뮬레이션' }));

    const summary = await screen.findByLabelText('주문 완료 요약');
    expect(within(summary).getByText('ORD-20260702-9001')).toBeInTheDocument();
    expect(within(summary).getByText('예상 배송일')).toBeInTheDocument();
    expect(within(summary).getByText('2026. 7. 5.')).toBeInTheDocument();
  });
});
