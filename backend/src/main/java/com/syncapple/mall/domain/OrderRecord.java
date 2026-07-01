package com.syncapple.mall.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderRecord(long id, String orderNumber, String paymentMethod, String paymentStatus, String orderStatus, BigDecimal totalAmount, LocalDateTime createdAt, Address shippingAddress, List<OrderLine> items) {}
