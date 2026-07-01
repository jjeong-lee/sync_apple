package com.syncapple.mall.domain;

import java.math.BigDecimal;
import java.util.List;

public record OrderPreview(List<OrderLine> items, BigDecimal subtotal, BigDecimal shippingFee, BigDecimal totalAmount) {}
