package com.syncapple.mall.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.syncapple.mall.domain.OrderLine;
import com.syncapple.mall.domain.OrderPreview;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class OrderPricingServiceTest {
  private final OrderPricingService service = new OrderPricingService();

  @Test
  void addsShippingBelowFreeShippingThreshold() {
    OrderPreview preview = service.price(List.of(
        new OrderLine(1L, 10L, "상품A", "옵션A", 1, new BigDecimal("30000"), new BigDecimal("30000")),
        new OrderLine(2L, 20L, "상품B", "옵션B", 1, new BigDecimal("19000"), new BigDecimal("19000"))
    ));

    assertThat(preview.subtotal()).isEqualByComparingTo("49000");
    assertThat(preview.shippingFee()).isEqualByComparingTo("2500");
    assertThat(preview.totalAmount()).isEqualByComparingTo("51500");
  }

  @Test
  void waivesShippingAtFiftyThousandWonOrMore() {
    OrderPreview preview = service.price(List.of(
        new OrderLine(1L, 10L, "상품A", "옵션A", 1, new BigDecimal("50000"), new BigDecimal("50000"))
    ));

    assertThat(preview.shippingFee()).isEqualByComparingTo("0");
    assertThat(preview.totalAmount()).isEqualByComparingTo("50000");
  }
}
