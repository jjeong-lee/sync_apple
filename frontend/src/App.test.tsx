import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { api } from './api';
import type { AdminOverview, CartItem, Category, HomeContent, Member, OrderPreview, OrderRecord, ProductSummary } from './types';

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
    addresses: vi.fn(),
    createOrder: vi.fn(),
    adminOrders: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

const home: HomeContent = {
  hero: {
    id: 1,
    title: '프리미엄 전자제품 경험을 하나의 흐름으로 연결합니다.',
    subtitle: '브랜드 경험을 다듬은 홈 화면입니다.',
    eyebrow: '브랜드 경험',
    ctaLabel: 'Catalog 보기',
    targetPath: '/catalog',
    imageUrl: null,
  },
  featured: [],
  bestSellers: [],
  newArrivals: [],
  promotions: [],
};

const categories: Category[] = [
  { id: 1, name: '액세서리', slug: 'accessories', parentId: null, active: true, sortOrder: 1 },
];

const products: ProductSummary[] = [
  {
    id: 104,
    categoryId: 1,
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
    sortOrder: 1,
    availableStock: 10,
  },
];

const member: Member = {
  id: 301,
  email: 'member@syncapple.dev',
  name: '기본 회원',
  role: 'MEMBER',
  status: 'ACTIVE',
};

const initialCart: CartItem[] = [
  {
    cartItemId: 501,
    productId: 104,
    productName: 'SilkCharge Duo',
    productSlug: 'silkcharge-duo',
    optionId: 1006,
    optionLabel: '색상 · 샌드 베이지',
    quantity: 1,
    unitPrice: 169000,
    lineTotal: 169000,
    imageUrl: null,
  },
];

const increasedCart: CartItem[] = [
  {
    ...initialCart[0],
    quantity: 2,
    lineTotal: 338000,
  },
];

const emptyCart: CartItem[] = [];

const initialPreview: OrderPreview = {
  items: [
    {
      productId: 104,
      optionId: 1006,
      productName: 'SilkCharge Duo',
      optionSummary: '색상 · 샌드 베이지',
      quantity: 1,
      unitPrice: 169000,
      lineTotal: 169000,
    },
  ],
  subtotal: 169000,
  shippingFee: 3000,
  totalAmount: 172000,
};

const updatedPreview: OrderPreview = {
  ...initialPreview,
  items: [
    {
      ...initialPreview.items[0],
      quantity: 2,
      lineTotal: 338000,
    },
  ],
  subtotal: 338000,
  totalAmount: 341000,
};

const emptyPreview: OrderPreview = {
  items: [],
  subtotal: 0,
  shippingFee: 0,
  totalAmount: 0,
};

const adminOverview: AdminOverview = {
  activeMembers: 1,
  activeProducts: 1,
  liveBanners: 0,
  openOrders: 0,
  recentOrders: [],
};

function configureApi({
  cart = initialCart,
  preview = initialPreview,
  orders = [],
}: {
  cart?: CartItem[];
  preview?: OrderPreview;
  orders?: OrderRecord[];
} = {}) {
  mockApi.home.mockResolvedValue(home);
  mockApi.categories.mockResolvedValue(categories);
  mockApi.products.mockResolvedValue(products);
  mockApi.cart.mockResolvedValue(cart);
  mockApi.member.mockResolvedValue(member);
  mockApi.orders.mockResolvedValue(orders);
  mockApi.orderPreview.mockReset();
  mockApi.orderPreview.mockResolvedValueOnce(preview).mockResolvedValue(updatedPreview);
  mockApi.adminOverview.mockResolvedValue(adminOverview);
  mockApi.updateCart.mockResolvedValue(increasedCart);
  mockApi.removeCart.mockResolvedValue(emptyCart);
}

function renderAppAt(pathname: string) {
  window.history.pushState({}, '', pathname);
  render(<App />);
}

describe('App cart page UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('navigates to the dedicated /cart page from the header and shows cart item details', async () => {
    configureApi();
    const user = userEvent.setup();

    renderAppAt('/');

    await screen.findByText('SilkCharge Duo');

    await user.click(screen.getByRole('link', { name: '장바구니 페이지로 이동' }));

    expect(window.location.pathname).toBe('/cart');
    expect(await screen.findByRole('heading', { name: '장바구니' })).toBeInTheDocument();
    expect(screen.queryByText('현재 담긴 상품')).not.toBeInTheDocument();
    expect(screen.getByText('상품명')).toBeInTheDocument();
    expect(screen.getByText('이미지')).toBeInTheDocument();
    expect(screen.getByText('단가')).toBeInTheDocument();
    expect(screen.getByText('수량')).toBeInTheDocument();
    expect(screen.getByText('소계')).toBeInTheDocument();

    const cartRow = screen.getByRole('row', { name: /SilkCharge Duo/ });
    expect(within(cartRow).getByText('SilkCharge Duo')).toBeInTheDocument();
    expect(within(cartRow).getAllByText('169,000원').length).toBeGreaterThan(0);
    expect(within(cartRow).getByText('1')).toBeInTheDocument();
    expect(screen.getByText('172,000원')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '주문/결제 진행' })).toBeInTheDocument();
  });

  it('updates quantity and removes items from the cart page while refreshing totals immediately', async () => {
    configureApi();
    const user = userEvent.setup();

    renderAppAt('/cart');

    await screen.findByRole('heading', { name: '장바구니' });

    await user.click(screen.getByRole('button', { name: 'SilkCharge Duo 수량 증가' }));

    await waitFor(() => {
      expect(mockApi.updateCart).toHaveBeenCalledWith(301, 501, 2);
      expect(mockApi.orderPreview).toHaveBeenLastCalledWith(301);
    });

    expect(await screen.findByText('341,000원')).toBeInTheDocument();
    expect(screen.getAllByText('338,000원').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'SilkCharge Duo 삭제' }));

    await waitFor(() => {
      expect(mockApi.removeCart).toHaveBeenCalledWith(301, 501);
    });

    expect(await screen.findByText('장바구니가 비어 있습니다')).toBeInTheDocument();
    expect(screen.getAllByText('0원').length).toBeGreaterThan(0);
  });

  it('shows an empty cart message and a continue shopping link on /cart', async () => {
    configureApi({
      cart: emptyCart,
      preview: emptyPreview,
    });

    renderAppAt('/cart');

    expect(await screen.findByText('장바구니가 비어 있습니다')).toBeInTheDocument();

    const continueShoppingLink = screen.getByRole('link', { name: '쇼핑 계속하기' });

    expect(continueShoppingLink).toHaveAttribute('href', '/');
  });
});