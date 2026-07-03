package com.syncapple.mall.service;

import com.syncapple.mall.domain.OrderLine;
import com.syncapple.mall.domain.OrderPreview;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderPricingService {
  private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("50000");
  private static final BigDecimal BASE_SHIPPING_FEE = new BigDecimal("2500");

  public OrderPreview price(List<OrderLine> lines) {
    BigDecimal subtotal = lines.stream().map(OrderLine::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : BASE_SHIPPING_FEE;
    return new OrderPreview(lines, subtotal, shipping, subtotal.add(shipping));
  }
}
