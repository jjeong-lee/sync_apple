package com.syncapple.mall.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.syncapple.mall.domain.ProductSummary;
import com.syncapple.mall.repository.CatalogRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class ProductCatalogServiceTest {
  private final CatalogRepository catalogRepository = mock(CatalogRepository.class);
  private final ProductCatalogService service = new ProductCatalogService(catalogRepository);

  @Test
  void matchesQueryWithLeadingAndTrailingWhitespace() {
    ProductSummary macbookPro = product(1L, "노트북", "맥북 프로", "고성능 노트북");
    when(catalogRepository.findAllProducts()).thenReturn(List.of(macbookPro));

    List<ProductSummary> results = service.products("  맥북 프로  ", null, null, null);

    assertThat(results).extracting(ProductSummary::id).containsExactly(1L);
  }

  @Test
  void matchesQueryWithConsecutiveSpacesAndTabs() {
    ProductSummary macbookPro = product(1L, "노트북", "맥북 프로", "고성능 노트북");
    when(catalogRepository.findAllProducts()).thenReturn(List.of(macbookPro));

    List<ProductSummary> results = service.products("맥북  \t프로", null, null, null);

    assertThat(results).extracting(ProductSummary::id).containsExactly(1L);
  }

  @Test
  void matchesQueryIgnoringCase() {
    ProductSummary macbookPro = product(1L, "Laptop", "MacBook Pro", "Apple Silicon notebook");
    when(catalogRepository.findAllProducts()).thenReturn(List.of(macbookPro));

    List<ProductSummary> results = service.products("MACBOOK PRO", null, null, null);

    assertThat(results).extracting(ProductSummary::id).containsExactly(1L);
  }

  @Test
  void returnsAllProductsForWhitespaceOnlyQuery() {
    ProductSummary first = product(1L, "노트북", "맥북 프로", "고성능 노트북");
    ProductSummary second = product(2L, "태블릿", "아이패드 프로", "휴대용 태블릿");
    when(catalogRepository.findAllProducts()).thenReturn(List.of(first, second));

    List<ProductSummary> results = service.products("  \t  ", null, null, null);

    assertThat(results).extracting(ProductSummary::id).containsExactly(1L, 2L);
  }

  @Test
  void normalizesWhitespaceInEverySearchableProductField() {
    ProductSummary nameMatch = product(1L, "기타", "맥북\t 프로", "설명");
    ProductSummary descriptionMatch = product(2L, "기타", "상품 2", "맥북  프로 전용");
    ProductSummary categoryMatch = product(3L, "맥북\t\t프로 액세서리", "상품 3", "설명");
    when(catalogRepository.findAllProducts()).thenReturn(List.of(nameMatch, descriptionMatch, categoryMatch));

    List<ProductSummary> results = service.products("맥북 프로", null, null, null);

    assertThat(results).extracting(ProductSummary::id).containsExactly(1L, 2L, 3L);
  }

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

  @Test
  void sortsBestSellersBeforeRegularProductsWhenSortingByPopularity() {
    ProductSummary regular = product(1L, true, "ON_SALE", new BigDecimal("1000"), null, false, false, false, 10);
    ProductSummary bestSeller = product(2L, true, "ON_SALE", new BigDecimal("1000"), null, false, true, false, 10);

    List<ProductSummary> results = service.applyVisibilityAndSort(List.of(regular, bestSeller), "popular");

    assertThat(results).extracting(ProductSummary::id).containsExactly(2L, 1L);
  }

  private ProductSummary product(long id, boolean visible, String saleStatus, BigDecimal price, BigDecimal salePrice, boolean featured, boolean bestSeller, boolean newArrival, int stock) {
    return new ProductSummary(id, 1L, "노트북", "상품" + id, "product-" + id, "설명", price, salePrice, null, null, visible, saleStatus, featured, bestSeller, newArrival, 1, stock);
  }

  private ProductSummary product(long id, String categoryName, String name, String shortDescription) {
    return new ProductSummary(id, 1L, categoryName, name, "product-" + id, shortDescription, new BigDecimal("1000"), null, null, null, true, "ON_SALE", false, false, false, (int) id, 10);
  }
}
