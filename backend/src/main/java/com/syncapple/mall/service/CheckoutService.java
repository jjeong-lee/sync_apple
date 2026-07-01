package com.syncapple.mall.service;

import com.syncapple.mall.api.DomainException;
import com.syncapple.mall.domain.Address;
import com.syncapple.mall.domain.CartItemView;
import com.syncapple.mall.domain.OrderLine;
import com.syncapple.mall.domain.OrderPreview;
import com.syncapple.mall.domain.OrderRecord;
import com.syncapple.mall.repository.CommerceRepository;
import com.syncapple.mall.repository.MemberRepository;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckoutService {
  private final CommerceRepository commerceRepository;
  private final MemberRepository memberRepository;
  private final CartService cartService;
  private final OrderPricingService orderPricingService;

  public CheckoutService(CommerceRepository commerceRepository, MemberRepository memberRepository, CartService cartService, OrderPricingService orderPricingService) {
    this.commerceRepository = commerceRepository;
    this.memberRepository = memberRepository;
    this.cartService = cartService;
    this.orderPricingService = orderPricingService;
  }

  public OrderPreview preview(long memberId) {
    List<OrderLine> lines = cartToOrderLines(memberId);
    if (lines.isEmpty()) {
      throw new DomainException(HttpStatus.BAD_REQUEST, "CART_EMPTY", "주문할 상품이 없습니다.");
    }
    return orderPricingService.price(lines);
  }

  @Transactional
  public OrderRecord createOrder(long memberId, long addressId, String paymentMethod, String clientRequestId) {
    if (clientRequestId == null || clientRequestId.isBlank()) {
      throw new DomainException(HttpStatus.BAD_REQUEST, "CLIENT_REQUEST_ID_REQUIRED", "중복 주문 방지를 위한 요청 식별자가 필요합니다.");
    }
    OrderRecord existing = commerceRepository.findOrderByClientRequestId(clientRequestId);
    if (existing != null) {
      return existing;
    }
    Address address = commerceRepository.findAddress(addressId);
    if (address == null || address.memberId() != memberId) {
      throw new DomainException(HttpStatus.BAD_REQUEST, "ADDRESS_NOT_FOUND", "본인 배송지를 선택해 주세요.");
    }
    OrderPreview preview = preview(memberId);
    long orderId = commerceRepository.nextOrderId();
    String orderNumber = "ORD-" + java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "-" + orderId;
    commerceRepository.insertOrder(orderId, orderNumber, clientRequestId, memberId, addressId, preview.subtotal(), preview.shippingFee(), preview.totalAmount(), paymentMethod, "AUTHORIZED", "PAID");
    preview.items().forEach(line -> commerceRepository.insertOrderItem(orderId, line));
    commerceRepository.insertAudit("ORDER", Long.toString(orderId), "CREATE", "member:" + memberId, null, "{\"paymentStatus\":\"AUTHORIZED\",\"orderStatus\":\"PAID\"}");
    return new OrderRecord(orderId, orderNumber, paymentMethod, "AUTHORIZED", "PAID", preview.totalAmount(), java.time.LocalDateTime.now(), address, preview.items());
  }

  public List<OrderRecord> orderHistory(long memberId) {
    return commerceRepository.findOrdersByMember(memberId);
  }

  private List<OrderLine> cartToOrderLines(long memberId) {
    List<CartItemView> items = commerceRepository.findCart(memberId);
    items.forEach(item -> cartService.validatePurchasable(item.productId(), item.optionId(), item.quantity()));
    return items.stream()
        .map(item -> new OrderLine(item.productId(), item.optionId(), item.productName(), item.optionLabel(), item.quantity(), item.unitPrice(), item.lineTotal()))
        .toList();
  }
}
