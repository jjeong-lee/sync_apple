import type { ProductSummary } from '../types';

const numberFormatter = new Intl.NumberFormat('ko-KR');

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(value: number) {
  return `${numberFormatter.format(value)}원`;
}

export function isSoldOut(product: ProductSummary) {
  return product.availableStock <= 0;
}

export function estimateDeliveryDate(createdAt: string) {
  const deliveryDate = new Date(createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  return dateFormatter.format(deliveryDate);
}
