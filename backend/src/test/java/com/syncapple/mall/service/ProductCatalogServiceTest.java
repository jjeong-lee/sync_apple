package com.syncapple.mall.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.syncapple.mall.domain.ProductSummary;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class ProductCatalogServiceTest {
  private final ProductCatalogService service = new ProductCatalogService(null);

  @Test
  void excludesHiddenOrUnavailableProductsFromVisibleCatalog() {
    ProductSummary visible = product(1L, true, "ON_SALE", new BigDecimal("1000"), null, false, false, true, 10);
    ProductSummary hidden = product(2L, false, "ON_SALE", new BigDecimal("900"), null, false, false, true, 10);
    ProductSummary paused = product(3L, true, "PAUSED", new BigDecimal("800"), null, false, false, true, 10);

    List<ProductSummary> results = service.applyVisibilityAndSort(List.of(visible, hidden, paused), "featured");

    assertThat(results).extracting(ProductSummary::id).containsExactly(1L);
  }

  @Test
  void sortsByEffectivePriceAscending() {
    ProductSummary premium = product(1L, true, "ON_SALE", new BigDecimal("3000"), new BigDecimal("2800"), false, false, false, 10);
    ProductSummary entry = product(2L, true, "ON_SALE", new BigDecimal("1000"), null, false, false, false, 10);

    List<ProductSummary> results = service.applyVisibilityAndSort(List.of(premium, entry), "price_asc");

    assertThat(results).extracting(ProductSummary::id).containsExactly(2L, 1L);
  }

  private ProductSummary product(long id, boolean visible, String saleStatus, BigDecimal price, BigDecimal salePrice, boolean featured, boolean bestSeller, boolean newArrival, int stock) {
    return new ProductSummary(id, 1L, "노트북", "상품" + id, "product-" + id, "설명", price, salePrice, null, null, visible, saleStatus, featured, bestSeller, newArrival, 1, stock);
  }
}
