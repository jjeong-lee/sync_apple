import type { ApiResponse, Address, AdminOverview, CartItem, Category, HomeContent, Member, OrderPreview, OrderRecord, ProductDetail, ProductSummary } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error('요청을 처리하지 못했습니다.');
  }

  const payload: ApiResponse<T> = await response.json();
  return payload.data;
}

export const api = {
  home: () => request<HomeContent>('/api/home'),
  categories: () => request<Category[]>('/api/categories'),
  products: (query: string, category: string, sort: string, stockStatus: string) => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (stockStatus) params.set('stockStatus', stockStatus);
    return request<ProductSummary[]>(`/api/products?${params.toString()}`);
  },
  productDetail: (slug: string) => request<ProductDetail>(`/api/products/${slug}`),
  cart: (memberId: number) => request<CartItem[]>(`/api/cart/${memberId}`),
  addToCart: (memberId: number, productId: number, optionId: number, quantity: number) =>
    request<CartItem[]>(`/api/cart/${memberId}/items`, {
      method: 'POST',
      body: JSON.stringify({ productId, optionId, quantity }),
    }),
  updateCart: (memberId: number, cartItemId: number, quantity: number) =>
    request<CartItem[]>(`/api/cart/${memberId}/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeCart: (memberId: number, cartItemId: number) =>
    request<CartItem[]>(`/api/cart/${memberId}/items/${cartItemId}`, { method: 'DELETE' }),
  member: (memberId: number) => request<Member>(`/api/members/${memberId}`),
  addresses: (memberId: number) => request<Address[]>(`/api/members/${memberId}/addresses`),
  orderPreview: (memberId: number) =>
    request<OrderPreview>('/api/orders/preview', {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    }),
  createOrder: (memberId: number, addressId: number, clientRequestId: string) =>
    request<OrderRecord>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ memberId, addressId, paymentMethod: 'CARD', clientRequestId }),
    }),
  orders: (memberId: number) => request<OrderRecord[]>(`/api/orders/member/${memberId}`),
  adminOverview: () => request<AdminOverview>('/api/admin/overview', { headers: { 'X-Role': 'ADMIN' } }),
  adminOrders: () => request<OrderRecord[]>('/api/admin/orders', { headers: { 'X-Role': 'ADMIN' } }),
};
