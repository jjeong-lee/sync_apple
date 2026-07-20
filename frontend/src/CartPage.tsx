import type { CartItem, Member, OrderPreview } from "./types";

type CartPageProps = {
  bannerMessage: string;
  cart: CartItem[];
  initialLoading: boolean;
  member: Member | null;
  onCheckout: () => void;
  onUpdateQuantity: (item: CartItem, quantity: number) => Promise<void>;
  preview: OrderPreview | null;
};

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatPrice(value: number) {
  return `${numberFormatter.format(value)}원`;
}

function CartPage({
  bannerMessage,
  cart,
  initialLoading,
  member,
  onCheckout,
  onUpdateQuantity,
  preview,
}: CartPageProps) {
  return (
    <div className="min-h-screen bg-glow text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="/"
            className="flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card shadow-sm">
              <span className="text-sm font-semibold text-accent">SA</span>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Sync Apple
              </p>
              <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                Premium Mall
              </p>
            </div>
          </a>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-2 text-sm font-medium text-accent shadow-sm">
            <span aria-hidden="true">🛒</span>
            <span>{cart.length}</span>
            <span className="sr-only">개 상품이 장바구니에 있습니다</span>
            <span className="hidden sm:inline">
              {member ? `${member.name} 님` : "Guest"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">
              Cart
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
              장바구니
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              담긴 상품을 확인하고 수량을 조정하세요.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            상품 둘러보기
          </a>
        </div>

        {bannerMessage ? (
          <p
            role="status"
            className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700"
          >
            {bannerMessage}
          </p>
        ) : null}

        {initialLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-[24px] border border-border bg-muted"
              />
            ))}
          </div>
        ) : cart.length === 0 ? (
          <section className="rounded-[30px] border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              장바구니가 비어 있습니다
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              원하는 상품을 둘러보고 장바구니에 담아 보세요.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              쇼핑 계속하기
            </a>
          </section>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="overflow-hidden rounded-[30px] border border-border bg-card shadow-sm">
              <div className="hidden grid-cols-[minmax(15rem,1fr)_8rem_10rem_8rem] gap-4 border-b border-border bg-muted/50 px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground md:grid">
                <span>상품명</span>
                <span>단가</span>
                <span>수량</span>
                <span className="text-right">소계</span>
              </div>
              <ul className="divide-y divide-border">
                {cart.map((item) => (
                  <li
                    key={item.cartItemId}
                    className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(15rem,1fr)_8rem_10rem_8rem] md:items-center md:gap-4 md:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-20 w-20 shrink-0 rounded-2xl border border-border bg-muted object-cover"
                        />
                      ) : (
                        <div
                          role="img"
                          aria-label={item.productName}
                          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-xs text-muted-foreground"
                        >
                          이미지 없음
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.optionLabel}
                        </p>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item, 0)}
                          className="mt-3 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      <span className="mr-2 text-xs text-muted-foreground md:hidden">
                        상품 단가
                      </span>
                      {formatPrice(item.unitPrice)}
                    </p>
                    <div className="inline-flex w-fit items-center rounded-full border border-border bg-background p-1 shadow-sm">
                      <button
                        type="button"
                        aria-label={`${item.productName} 수량 감소`}
                        onClick={() =>
                          onUpdateQuantity(item, item.quantity - 1)
                        }
                        className="h-8 w-8 rounded-full text-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        −
                      </button>
                      <span className="min-w-9 text-center text-sm font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`${item.productName} 수량 증가`}
                        onClick={() =>
                          onUpdateQuantity(item, item.quantity + 1)
                        }
                        className="h-8 w-8 rounded-full text-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-left text-base font-semibold text-foreground md:text-right">
                      <span className="mr-2 text-xs font-medium text-muted-foreground md:hidden">
                        상품 소계
                      </span>
                      {formatPrice(item.lineTotal)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="h-fit rounded-[30px] border border-slate-900 bg-slate-950 p-6 text-white shadow-[0_25px_80px_rgba(15,23,42,0.2)] xl:sticky xl:top-6">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                Payment summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                결제 예정 금액
              </h2>
              <dl className="mt-6 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-4">
                  <dt>상품 합계</dt>
                  <dd>{formatPrice(preview?.subtotal ?? 0)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>배송비</dt>
                  <dd>{formatPrice(preview?.shippingFee ?? 0)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-base font-semibold text-white">
                  <dt>총 결제 예정 금액</dt>
                  <dd>{formatPrice(preview?.totalAmount ?? 0)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={onCheckout}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                주문/결제 진행
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                주문과 결제는 다음 단계에서 제공됩니다.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default CartPage;
