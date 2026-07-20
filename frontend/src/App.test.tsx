import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { api } from "./api";
import type {
  AdminOverview,
  CartItem,
  Category,
  HomeContent,
  Member,
  OrderPreview,
  OrderRecord,
  ProductSummary,
} from "./types";

vi.mock("./api", () => ({
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
    title: "프리미엄 전자제품 경험을 하나의 흐름으로 연결합니다.",
    subtitle: "브랜드 경험을 다듬은 홈 화면입니다.",
    eyebrow: "브랜드 경험",
    ctaLabel: "Catalog 보기",
    targetPath: "/catalog",
    imageUrl: null,
  },
  featured: [],
  bestSellers: [],
  newArrivals: [],
  promotions: [],
};

const categories: Category[] = [
  {
    id: 1,
    name: "액세서리",
    slug: "accessories",
    parentId: null,
    active: true,
    sortOrder: 1,
  },
];

const products: ProductSummary[] = [
  {
    id: 104,
    categoryId: 1,
    categoryName: "액세서리",
    name: "SilkCharge Duo",
    slug: "silkcharge-duo",
    shortDescription: "가죽 마감의 무선 충전 스탠드",
    price: 189000,
    salePrice: 169000,
    heroImageUrl: null,
    badge: null,
    visible: true,
    saleStatus: "ON_SALE",
    featured: false,
    bestSeller: false,
    newArrival: true,
    sortOrder: 1,
    availableStock: 0,
  },
  {
    id: 103,
    categoryId: 1,
    categoryName: "액세서리",
    name: "Orbit Dock",
    slug: "orbit-dock",
    shortDescription: "데스크를 정리하는 7-in-1 알루미늄 허브",
    price: 249000,
    salePrice: null,
    heroImageUrl: null,
    badge: "Pro",
    visible: true,
    saleStatus: "ON_SALE",
    featured: true,
    bestSeller: false,
    newArrival: true,
    sortOrder: 2,
    availableStock: 17,
  },
];

const member: Member = {
  id: 301,
  email: "member@syncapple.dev",
  name: "기본 회원",
  role: "MEMBER",
  status: "ACTIVE",
};

const initialCart: CartItem[] = [
  {
    cartItemId: 501,
    productId: 104,
    productName: "SilkCharge Duo",
    productSlug: "silkcharge-duo",
    optionId: 1006,
    optionLabel: "색상 · 샌드 베이지",
    quantity: 1,
    unitPrice: 169000,
    lineTotal: 169000,
    imageUrl: "/images/silkcharge-duo.jpg",
  },
];

const increasedCart: CartItem[] = [
  {
    ...initialCart[0],
    quantity: 2,
    lineTotal: 338000,
  },
];

const initialPreview: OrderPreview = {
  items: [
    {
      productId: 104,
      optionId: 1006,
      productName: "SilkCharge Duo",
      optionSummary: "색상 · 샌드 베이지",
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

const createdOrder: OrderRecord = {
  id: 701,
  orderNumber: "ORD-20260702103000-701",
  paymentMethod: "CARD",
  paymentStatus: "AUTHORIZED",
  orderStatus: "PAID",
  totalAmount: 341000,
  createdAt: "2026-07-02T10:30:00",
  shippingAddress: {
    id: 401,
    memberId: 301,
    label: "집",
    recipientName: "기본 회원",
    phone: "010-1111-2222",
    line1: "서울시 강남구 테헤란로 10",
    line2: "18층",
    postalCode: "06123",
    defaultAddress: true,
  },
  items: updatedPreview.items,
};

const adminOverview: AdminOverview = {
  activeMembers: 1,
  activeProducts: 2,
  liveBanners: 0,
  openOrders: 1,
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
  mockApi.orderPreview
    .mockResolvedValueOnce(preview)
    .mockResolvedValue(updatedPreview);
  mockApi.adminOverview.mockResolvedValue(adminOverview);
  mockApi.updateCart.mockResolvedValue(increasedCart);
  mockApi.removeCart.mockResolvedValue([]);
  mockApi.createOrder.mockResolvedValue(createdOrder);
}

describe("App cart and order UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/cart");
  });

  it("renders the dedicated cart route with item details and updates the payment total after a quantity change", async () => {
    configureApi();
    const user = userEvent.setup();

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "장바구니" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "SilkCharge Duo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("상품명")).toBeInTheDocument();
    expect(screen.getAllByText("단가").length).toBeGreaterThan(0);
    expect(screen.getByText("수량")).toBeInTheDocument();
    expect(screen.getAllByText("소계").length).toBeGreaterThan(0);
    expect(screen.getByText("172,000원")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "SilkCharge Duo 수량 증가" }),
    );

    await waitFor(() => {
      expect(mockApi.updateCart).toHaveBeenCalledWith(301, 501, 2);
      expect(mockApi.orderPreview).toHaveBeenLastCalledWith(301);
    });

    expect(await screen.findByText("341,000원")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "주문/결제 진행" }),
    ).toBeInTheDocument();
  });

  it("shows the required empty-cart guidance and a continue shopping link", async () => {
    configureApi({
      cart: [],
      preview: {
        items: [],
        subtotal: 0,
        shippingFee: 0,
        totalAmount: 0,
      },
    });

    render(<App />);

    expect(
      await screen.findByText("장바구니가 비어 있습니다"),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "쇼핑 계속하기" })
        .every((link) => link.getAttribute("href") === "/"),
    ).toBe(true);
  });
});
