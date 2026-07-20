package com.syncapple.mall.repository;

import com.syncapple.mall.domain.Address;
import com.syncapple.mall.domain.CartItemView;
import com.syncapple.mall.domain.OrderLine;
import com.syncapple.mall.domain.OrderRecord;
import com.syncapple.mall.domain.ProductOption;
import com.syncapple.mall.domain.ProductSummary;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CommerceRepository {
  private final JdbcTemplate jdbcTemplate;

  public CommerceRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<CartItemView> findCart(long memberId) {
    return jdbcTemplate.query(
        """
        SELECT ci.id AS cart_item_id, p.id AS product_id, p.name AS product_name, p.slug AS product_slug,
               po.id AS option_id, po.option_name, po.option_value, ci.quantity,
               COALESCE(p.sale_price, p.price) AS unit_price, COALESCE(p.sale_price, p.price) * ci.quantity AS line_total,
               p.hero_image_url
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        JOIN product_options po ON po.id = ci.option_id
        WHERE ci.member_id = ?
        ORDER BY ci.created_at DESC, ci.id DESC
        """,
        (rs, rowNum) -> new CartItemView(
            rs.getLong("cart_item_id"),
            rs.getLong("product_id"),
            rs.getString("product_name"),
            rs.getString("product_slug"),
            rs.getLong("option_id"),
            rs.getString("option_name") + " · " + rs.getString("option_value"),
            rs.getInt("quantity"),
            rs.getBigDecimal("unit_price"),
            rs.getBigDecimal("line_total"),
            rs.getString("hero_image_url")),
        memberId);
  }

  public ProductSummary findProduct(long productId) {
    List<ProductSummary> results = jdbcTemplate.query(
        """
        SELECT p.id, p.category_id, c.name AS category_name, p.name, p.slug, p.short_description, p.price, p.sale_price,
               p.hero_image_url, p.badge, p.is_visible, p.sale_status, p.is_featured, p.is_best_seller, p.is_new_arrival,
               p.sort_order, COALESCE(SUM(CASE WHEN po.purchasable THEN po.stock_quantity ELSE 0 END), 0) AS available_stock
        FROM products p
        JOIN categories c ON c.id = p.category_id
        LEFT JOIN product_options po ON po.product_id = p.id
        WHERE p.id = ?
        GROUP BY p.id, c.name
        """,
        (rs, rowNum) -> new ProductSummary(
            rs.getLong("id"), rs.getLong("category_id"), rs.getString("category_name"), rs.getString("name"), rs.getString("slug"),
            rs.getString("short_description"), rs.getBigDecimal("price"), rs.getBigDecimal("sale_price"), rs.getString("hero_image_url"),
            rs.getString("badge"), rs.getBoolean("is_visible"), rs.getString("sale_status"), rs.getBoolean("is_featured"), rs.getBoolean("is_best_seller"),
            rs.getBoolean("is_new_arrival"), rs.getInt("sort_order"), rs.getInt("available_stock")),
        productId);
    return results.isEmpty() ? null : results.get(0);
  }

  public ProductOption findOption(long optionId) {
    List<ProductOption> results = jdbcTemplate.query(
        "SELECT id, option_name, option_value, sku, stock_quantity, purchasable FROM product_options WHERE id = ?",
        (rs, rowNum) -> new ProductOption(rs.getLong("id"), rs.getString("option_name"), rs.getString("option_value"), rs.getString("sku"), rs.getInt("stock_quantity"), rs.getBoolean("purchasable")),
        optionId);
    return results.isEmpty() ? null : results.get(0);
  }

  public long nextCartItemId() {
    Long value = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 500) + 1 FROM cart_items", Long.class);
    return value == null ? 501L : value;
  }

  public void upsertCartItem(long memberId, long productId, long optionId, int quantity) {
    Integer existing = jdbcTemplate.query(
        "SELECT id FROM cart_items WHERE member_id = ? AND product_id = ? AND option_id = ?",
        rs -> rs.next() ? rs.getInt(1) : null,
        memberId, productId, optionId);
    if (existing == null) {
      jdbcTemplate.update(
          "INSERT INTO cart_items (id, member_id, product_id, option_id, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
          nextCartItemId(), memberId, productId, optionId, quantity);
      return;
    }
    jdbcTemplate.update(
        "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        quantity, existing);
  }

  public void updateCartQuantity(long memberId, long cartItemId, int quantity) {
    jdbcTemplate.update("UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE member_id = ? AND id = ?", quantity, memberId, cartItemId);
  }

  public void deleteCartItem(long memberId, long cartItemId) {
    jdbcTemplate.update("DELETE FROM cart_items WHERE member_id = ? AND id = ?", memberId, cartItemId);
  }

  public long nextOrderId() {
    Long value = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 700) + 1 FROM orders", Long.class);
    return value == null ? 701L : value;
  }

  public long nextOrderItemId() {
    Long value = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 800) + 1 FROM order_items", Long.class);
    return value == null ? 801L : value;
  }

  public OrderRecord findOrderByClientRequestId(String clientRequestId) {
    List<OrderRecord> results = jdbcTemplate.query(
        "SELECT id, order_number, payment_method, payment_status, order_status, total_amount, created_at, address_id FROM orders WHERE client_request_id = ?",
        (rs, rowNum) -> new OrderRecord(
            rs.getLong("id"),
            rs.getString("order_number"),
            rs.getString("payment_method"),
            rs.getString("payment_status"),
            rs.getString("order_status"),
            rs.getBigDecimal("total_amount"),
            rs.getTimestamp("created_at").toLocalDateTime(),
            findAddress(rs.getLong("address_id")),
            findOrderLines(rs.getLong("id"))),
        clientRequestId);
    return results.isEmpty() ? null : results.get(0);
  }

  public Address findAddress(long addressId) {
    return jdbcTemplate.query(
        "SELECT id, member_id, label, recipient_name, phone, line1, line2, postal_code, is_default FROM addresses WHERE id = ?",
        rs -> rs.next() ? new Address(rs.getLong("id"), rs.getLong("member_id"), rs.getString("label"), rs.getString("recipient_name"), rs.getString("phone"), rs.getString("line1"), rs.getString("line2"), rs.getString("postal_code"), rs.getBoolean("is_default")) : null,
        addressId);
  }

  public void insertOrder(long orderId, String orderNumber, String clientRequestId, long memberId, long addressId, BigDecimal subtotal, BigDecimal shippingFee, BigDecimal totalAmount, String paymentMethod, String paymentStatus, String orderStatus) {
    jdbcTemplate.update(
        "INSERT INTO orders (id, order_number, client_request_id, member_id, address_id, subtotal, shipping_fee, total_amount, payment_method, payment_status, order_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        orderId, orderNumber, clientRequestId, memberId, addressId, subtotal, shippingFee, totalAmount, paymentMethod, paymentStatus, orderStatus);
  }

  public void insertOrderItem(long orderId, OrderLine line) {
    jdbcTemplate.update(
        "INSERT INTO order_items (id, order_id, product_id, option_id, product_name, option_summary, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        nextOrderItemId(), orderId, line.productId(), line.optionId(), line.productName(), line.optionSummary(), line.quantity(), line.unitPrice(), line.lineTotal());
  }

  public List<OrderLine> findOrderLines(long orderId) {
    return jdbcTemplate.query(
        "SELECT product_id, option_id, product_name, option_summary, quantity, unit_price, line_total FROM order_items WHERE order_id = ? ORDER BY id ASC",
        (rs, rowNum) -> new OrderLine(rs.getLong("product_id"), rs.getLong("option_id"), rs.getString("product_name"), rs.getString("option_summary"), rs.getInt("quantity"), rs.getBigDecimal("unit_price"), rs.getBigDecimal("line_total")),
        orderId);
  }

  public List<OrderRecord> findOrdersByMember(long memberId) {
    return jdbcTemplate.query(
        "SELECT id, order_number, payment_method, payment_status, order_status, total_amount, created_at, address_id FROM orders WHERE member_id = ? ORDER BY created_at DESC",
        (rs, rowNum) -> new OrderRecord(
            rs.getLong("id"),
            rs.getString("order_number"),
            rs.getString("payment_method"),
            rs.getString("payment_status"),
            rs.getString("order_status"),
            rs.getBigDecimal("total_amount"),
            rs.getTimestamp("created_at").toLocalDateTime(),
            findAddress(rs.getLong("address_id")),
            findOrderLines(rs.getLong("id"))),
        memberId);
  }

  public List<OrderRecord> findRecentOrders(int limit) {
    return jdbcTemplate.query(
        "SELECT id, order_number, payment_method, payment_status, order_status, total_amount, created_at, address_id FROM orders ORDER BY created_at DESC LIMIT ?",
        (rs, rowNum) -> new OrderRecord(
            rs.getLong("id"),
            rs.getString("order_number"),
            rs.getString("payment_method"),
            rs.getString("payment_status"),
            rs.getString("order_status"),
            rs.getBigDecimal("total_amount"),
            rs.getTimestamp("created_at").toLocalDateTime(),
            findAddress(rs.getLong("address_id")),
            findOrderLines(rs.getLong("id"))),
        limit);
  }

  public long countOpenOrders() {
    Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM orders WHERE order_status IN ('PAID', 'READY_FOR_SHIPMENT', 'PROCESSING')", Long.class);
    return count == null ? 0L : count;
  }

  public long countActiveProducts() {
    Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM products WHERE is_visible = TRUE", Long.class);
    return count == null ? 0L : count;
  }

  public long countActiveMembers() {
    Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM members WHERE status = 'ACTIVE'", Long.class);
    return count == null ? 0L : count;
  }

  public long countLiveBanners() {
    Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM promotion_banners WHERE is_active = TRUE AND starts_at <= CURRENT_TIMESTAMP AND ends_at >= CURRENT_TIMESTAMP", Long.class);
    return count == null ? 0L : count;
  }

  public void insertAudit(String targetType, String targetId, String actionType, String actor, String beforeValue, String afterValue) {
    Long nextId = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 600) + 1 FROM audit_logs", Long.class);
    jdbcTemplate.update(
        "INSERT INTO audit_logs (id, target_type, target_id, action_type, actor, before_value, after_value, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        nextId, targetType, targetId, actionType, actor, beforeValue, afterValue);
  }
}
