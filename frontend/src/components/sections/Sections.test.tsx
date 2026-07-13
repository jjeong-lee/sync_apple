import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  AdminOverviewSection,
  CartSection,
  CatalogSection,
  HeroSection,
  MyPageSection,
  SummarySection,
} from './index';

describe('screen sections', () => {
  it('renders each section from its own component', () => {
    const { rerender } = render(<HeroSection home={null} badges={['0 categories']} />);
    expect(screen.getByRole('heading', { name: '프리미엄 전자제품 경험을 하나의 흐름으로 연결합니다.' })).toBeInTheDocument();

    rerender(<SummarySection featuredCount={0} previewItemCount={0} recentOrderCount={0} bannerMessage="" />);
    expect(screen.getByText('큐레이션')).toBeInTheDocument();

    rerender(
      <CatalogSection
        categories={[]}
        products={[]}
        query=""
        category=""
        sort="featured"
        stockStatus=""
        loading={false}
        error=""
        dialogOpen={false}
        selectedProduct={null}
        detailLoading={false}
        detailError=""
        onQueryChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onSortChange={vi.fn()}
        onStockStatusChange={vi.fn()}
        onResetFilters={vi.fn()}
        onOpenProduct={vi.fn()}
        onCloseProduct={vi.fn()}
        onAddToCart={vi.fn()}
        onSubmitOrder={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: '브랜드 큐레이션 상품 탐색' })).toBeInTheDocument();

    rerender(<CartSection cart={[]} productsById={new Map()} preview={null} loading={false} onMoveToCatalog={vi.fn()} onUpdateQuantity={vi.fn()} onSubmitOrder={vi.fn()} />);
    expect(screen.getByRole('heading', { name: '현재 담긴 상품' })).toBeInTheDocument();

    rerender(<MyPageSection member={null} orders={[]} loading={false} />);
    expect(screen.getByRole('heading', { name: '회원 및 주문 이력' })).toBeInTheDocument();

    rerender(<AdminOverviewSection overview={null} loading={false} />);
    expect(screen.getByRole('heading', { name: '운영 Dashboard' })).toBeInTheDocument();
  });
});
