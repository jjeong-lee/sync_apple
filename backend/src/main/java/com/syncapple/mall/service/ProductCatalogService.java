package com.syncapple.mall.service;

import com.syncapple.mall.api.DomainException;
import com.syncapple.mall.domain.Category;
import com.syncapple.mall.domain.ProductDetail;
import com.syncapple.mall.domain.ProductSummary;
import com.syncapple.mall.repository.CatalogRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ProductCatalogService {
  private final CatalogRepository catalogRepository;

  public ProductCatalogService(CatalogRepository catalogRepository) {
    this.catalogRepository = catalogRepository;
  }

  public List<Category> categories() {
    return catalogRepository.findActiveCategories();
  }

  public List<ProductSummary> products(String query, String categorySlug, String sort, String stockStatus) {
    List<ProductSummary> candidates = visibleProducts(catalogRepository.findAllProducts());
    String normalizedQuery = normalizeSearchText(query);
    return candidates.stream()
        .filter(product -> normalizedQuery.isBlank() || normalizeSearchText(product.name()).contains(normalizedQuery) || normalizeSearchText(product.shortDescription()).contains(normalizedQuery) || normalizeSearchText(product.categoryName()).contains(normalizedQuery))
        .filter(product -> categorySlug == null || categorySlug.isBlank() || matchesCategorySlug(product, categorySlug))
        .filter(product -> stockStatus == null || stockStatus.isBlank() || matchesStockStatus(product, stockStatus))
        .sorted(resolveComparator(sort))
        .toList();
  }

  private String normalizeSearchText(String value) {
    return value == null ? "" : value.trim().replaceAll("[ \\t]+", " ").toLowerCase(Locale.ROOT);
  }

  public ProductDetail productDetail(String slug) {
    ProductDetail detail = catalogRepository.findProductDetailBySlug(slug);
    if (detail == null || !detail.product().visible() || !"ON_SALE".equals(detail.product().saleStatus())) {
      throw new DomainException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "공개 가능한 상품을 찾을 수 없습니다.");
    }
    return detail;
  }

  static List<ProductSummary> visibleProducts(List<ProductSummary> products) {
    return products.stream()
        .filter(ProductSummary::visible)
        .filter(product -> "ON_SALE".equals(product.saleStatus()))
        .toList();
  }

  public List<ProductSummary> applyVisibilityAndSort(List<ProductSummary> products, String sort) {
    return visibleProducts(products).stream().sorted(resolveComparator(sort)).toList();
  }

  private boolean matchesCategorySlug(ProductSummary product, String categorySlug) {
    return categorySlug.equalsIgnoreCase(product.categoryName()) || categorySlug.equalsIgnoreCase(product.categoryName().toLowerCase(Locale.ROOT)) || categorySlug.equalsIgnoreCase(product.slug()) || categorySlug.equalsIgnoreCase(product.categoryName().replace(" ", "-"));
  }

  private boolean matchesStockStatus(ProductSummary product, String stockStatus) {
    return switch (stockStatus.toLowerCase(Locale.ROOT)) {
      case "in_stock" -> product.availableStock() > 0;
      case "low_stock" -> product.availableStock() > 0 && product.availableStock() < 5;
      case "sold_out" -> product.availableStock() == 0;
      default -> true;
    };
  }

  private Comparator<ProductSummary> resolveComparator(String sort) {
    if (sort == null || sort.isBlank() || sort.equals("featured")) {
      return Comparator.comparing(ProductSummary::featured).reversed()
          .thenComparing(ProductSummary::sortOrder)
          .thenComparing(ProductSummary::id);
    }
    return switch (sort) {
      case "popular" -> Comparator.comparing(ProductSummary::bestSeller).reversed().thenComparing(ProductSummary::featured).reversed().thenComparing(ProductSummary::sortOrder);
      case "newest" -> Comparator.comparing(ProductSummary::newArrival).reversed().thenComparing(ProductSummary::sortOrder);
      case "price_asc" -> Comparator.comparing(ProductSummary::effectivePrice).thenComparing(ProductSummary::sortOrder);
      case "price_desc" -> Comparator.comparing(ProductSummary::effectivePrice).reversed().thenComparing(ProductSummary::sortOrder);
      default -> Comparator.comparing(ProductSummary::sortOrder).thenComparing(ProductSummary::id);
    };
  }
}
