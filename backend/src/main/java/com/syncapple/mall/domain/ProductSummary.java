package com.syncapple.mall.domain;

import java.math.BigDecimal;

public record ProductSummary(
    long id,
    long categoryId,
    String categoryName,
    String name,
    String slug,
    String shortDescription,
    BigDecimal price,
    BigDecimal salePrice,
    String heroImageUrl,
    String badge,
    boolean visible,
    String saleStatus,
    boolean featured,
    boolean bestSeller,
    boolean newArrival,
    int sortOrder,
    int availableStock) {

  public BigDecimal effectivePrice() {
    return salePrice != null ? salePrice : price;
  }
}
