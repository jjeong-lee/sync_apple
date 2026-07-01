package com.syncapple.mall.domain;

import java.math.BigDecimal;

public record OrderLine(long productId, long optionId, String productName, String optionSummary, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {}
