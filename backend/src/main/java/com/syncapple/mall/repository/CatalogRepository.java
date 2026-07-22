package com.syncapple.mall.repository;

import com.syncapple.mall.domain.Banner;
import com.syncapple.mall.domain.Category;
import com.syncapple.mall.domain.ProductDetail;
import com.syncapple.mall.domain.ProductOption;
import com.syncapple.mall.domain.ProductSummary;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CatalogRepository {
  private final JdbcTemplate jdbcTemplate;
  private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

  public CatalogRepository(
      JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
    this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
  }

  public List<Banner> findBannersByType(String type) {
    return jdbcTemplate.query(
        """
        SELECT id, title, subtitle, eyebrow, cta_label, target_path, image_url, is_active, starts_at, ends_at, display_order, banner_type
        FROM promotion_banners
        WHERE banner_type = ?
        ORDER BY display_order ASC
        """,
        (rs, rowNum) -> new Banner(
            rs.getLong("id"),
            rs.getString("title"),
            rs.getString("subtitle"),
            rs.getString("eyebrow"),
            rs.getString("cta_label"),
            rs.getString("target_path"),
            rs.getString("image_url"),
            rs.getBoolean("is_active"),
            rs.getTimestamp("starts_at").toLocalDateTime(),
            rs.getTimestamp("ends_at").toLocalDateTime(),
            rs.getInt("display_order"),
            rs.getString("banner_type")),
        type);
  }

  public List<Category> findActiveCategories() {
    return jdbcTemplate.query(
        "SELECT id, name, slug, parent_id, is_active, sort_order FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC",
        (rs, rowNum) -> new Category(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("slug"),
            (Long) rs.getObject("parent_id"),
            rs.getBoolean("is_active"),
            rs.getInt("sort_order")));
  }

  public List<ProductSummary> findAllProducts() {
    return jdbcTemplate.query(
        """
        SELECT p.id, p.category_id, c.name AS category_name, p.name, p.slug, p.short_description, p.price, p.sale_price,
               p.hero_image_url, p.badge, p.is_visible, p.sale_status, p.is_featured, p.is_best_seller, p.is_new_arrival,
               p.sort_order, COALESCE(SUM(CASE WHEN po.purchasable THEN po.stock_quantity ELSE 0 END), 0) AS available_stock
        FROM products p
        JOIN categories c ON c.id = p.category_id
        LEFT JOIN product_options po ON po.product_id = p.id
        GROUP BY p.id, c.name
        ORDER BY p.sort_order ASC, p.id ASC
        """,
        (rs, rowNum) -> new ProductSummary(
            rs.getLong("id"),
            rs.getLong("category_id"),
            rs.getString("category_name"),
            rs.getString("name"),
            rs.getString("slug"),
            rs.getString("short_description"),
            rs.getBigDecimal("price"),
            rs.getBigDecimal("sale_price"),
            rs.getString("hero_image_url"),
            rs.getString("badge"),
            rs.getBoolean("is_visible"),
            rs.getString("sale_status"),
            rs.getBoolean("is_featured"),
            rs.getBoolean("is_best_seller"),
            rs.getBoolean("is_new_arrival"),
            rs.getInt("sort_order"),
            rs.getInt("available_stock")));
  }

  public ProductDetail findProductDetailBySlug(String slug) {
    List<ProductSummary> products = findAllProducts();
    ProductSummary product = products.stream().filter(candidate -> candidate.slug().equals(slug)).findFirst().orElse(null);
    if (product == null) {
      return null;
    }
    List<ProductOption> options = jdbcTemplate.query(
        "SELECT id, option_name, option_value, sku, stock_quantity, purchasable FROM product_options WHERE product_id = ? ORDER BY display_order ASC, id ASC",
        (rs, rowNum) -> new ProductOption(
            rs.getLong("id"),
            rs.getString("option_name"),
            rs.getString("option_value"),
            rs.getString("sku"),
            rs.getInt("stock_quantity"),
            rs.getBoolean("purchasable")),
        product.id());
    List<ProductSummary> related = products.stream()
        .filter(candidate -> candidate.categoryId() == product.categoryId() && candidate.id() != product.id())
        .limit(3)
        .toList();
    return new ProductDetail(product, options, related);
  }

  public List<ProductOption> findOptionsForProducts(List<Long> productIds) {
    if (productIds.isEmpty()) {
      return List.of();
    }
    return namedParameterJdbcTemplate.query(
        "SELECT id, option_name, option_value, sku, stock_quantity, purchasable FROM product_options WHERE product_id IN (:productIds)",
        new MapSqlParameterSource("productIds", productIds),
        (rs, rowNum) -> new ProductOption(
            rs.getLong("id"),
            rs.getString("option_name"),
            rs.getString("option_value"),
            rs.getString("sku"),
            rs.getInt("stock_quantity"),
            rs.getBoolean("purchasable")));
  }

  public LocalDateTime now() {
    return jdbcTemplate.queryForObject("SELECT CURRENT_TIMESTAMP", (rs, rowNum) -> rs.getTimestamp(1).toLocalDateTime());
  }
}
