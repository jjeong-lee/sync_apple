package com.syncapple.mall.service;

import com.syncapple.mall.domain.OrderLine;
import com.syncapple.mall.domain.OrderPreview;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderPricingService {
  public OrderPreview price(List<OrderLine> lines) {
    BigDecimal subtotal = lines.stream().map(OrderLine::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal shipping = subtotal.compareTo(new BigDecimal("1000000")) >= 0 ? BigDecimal.ZERO : new BigDecimal("3000");
    return new OrderPreview(lines, subtotal, shipping, subtotal.add(shipping));
  }
}
