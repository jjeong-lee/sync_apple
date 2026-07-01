export type ApiResponse<T> = {
  status: string;
  data: T;
};

export type Banner = {
  id: number;
  title: string;
  subtitle: string;
  eyebrow: string;
  ctaLabel: string;
  targetPath: string;
  imageUrl: string | null;
};

export type ProductSummary = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  shortDescription: string;
  price: number;
  salePrice: number | null;
  heroImageUrl: string | null;
  badge: string | null;
  visible: boolean;
  saleStatus: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  sortOrder: number;
  availableStock: number;
};

export type ProductOption = {
  id: number;
  optionName: string;
  optionValue: string;
  sku: string;
  stockQuantity: number;
  purchasable: boolean;
};

export type ProductDetail = {
  product: ProductSummary;
  options: ProductOption[];
  relatedProducts: ProductSummary[];
};

export type HomeContent = {
  hero: Banner;
  featured: ProductSummary[];
  bestSellers: ProductSummary[];
  newArrivals: ProductSummary[];
  promotions: Banner[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  active: boolean;
  sortOrder: number;
};

export type CartItem = {
  cartItemId: number;
  productId: number;
  productName: string;
  productSlug: string;
  optionId: number;
  optionLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type Member = {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
};

export type Address = {
  id: number;
  memberId: number;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  defaultAddress: boolean;
};

export type OrderLine = {
  productId: number;
  optionId: number;
  productName: string;
  optionSummary: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderPreview = {
  items: OrderLine[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
};

export type OrderRecord = {
  id: number;
  orderNumber: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress: Address;
  items: OrderLine[];
};

export type AdminOverview = {
  activeProducts: number;
  activeMembers: number;
  openOrders: number;
  liveBanners: number;
  recentOrders: OrderRecord[];
};
