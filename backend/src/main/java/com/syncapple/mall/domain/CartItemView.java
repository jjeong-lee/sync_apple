package com.syncapple.mall.domain;

import java.math.BigDecimal;

public record CartItemView(long cartItemId, long productId, String productName, String productSlug, long optionId, String optionLabel, int quantity, BigDecimal unitPrice, BigDecimal lineTotal, String imageUrl) {}
