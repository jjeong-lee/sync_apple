CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  parent_id BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  category_id BIGINT NOT NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  short_description VARCHAR(320) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  sale_price NUMERIC(12, 2),
  hero_image_url VARCHAR(500),
  badge VARCHAR(80),
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  sale_status VARCHAR(40) NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS product_options (
  id BIGINT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  option_name VARCHAR(100) NOT NULL,
  option_value VARCHAR(100) NOT NULL,
  sku VARCHAR(120) NOT NULL UNIQUE,
  stock_quantity INT NOT NULL,
  purchasable BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_product_options_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS promotion_banners (
  id BIGINT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  subtitle VARCHAR(280) NOT NULL,
  eyebrow VARCHAR(120) NOT NULL,
  cta_label VARCHAR(80) NOT NULL,
  target_path VARCHAR(240) NOT NULL,
  image_url VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  banner_type VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id BIGINT PRIMARY KEY,
  email VARCHAR(180) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(180) NOT NULL,
  role VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
  id BIGINT PRIMARY KEY,
  member_id BIGINT NOT NULL,
  label VARCHAR(100) NOT NULL,
  recipient_name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  line1 VARCHAR(240) NOT NULL,
  line2 VARCHAR(240),
  postal_code VARCHAR(40) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_member FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT PRIMARY KEY,
  member_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  option_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_member FOREIGN KEY (member_id) REFERENCES members(id),
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_cart_items_option FOREIGN KEY (option_id) REFERENCES product_options(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY,
  order_number VARCHAR(80) NOT NULL UNIQUE,
  client_request_id VARCHAR(120) NOT NULL UNIQUE,
  member_id BIGINT NOT NULL,
  address_id BIGINT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_fee NUMERIC(12, 2) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(40) NOT NULL,
  payment_status VARCHAR(40) NOT NULL,
  order_status VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_member FOREIGN KEY (member_id) REFERENCES members(id),
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  option_id BIGINT NOT NULL,
  product_name VARCHAR(180) NOT NULL,
  option_summary VARCHAR(180) NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  line_total NUMERIC(12, 2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_order_items_option FOREIGN KEY (option_id) REFERENCES product_options(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT PRIMARY KEY,
  target_type VARCHAR(80) NOT NULL,
  target_id VARCHAR(80) NOT NULL,
  action_type VARCHAR(80) NOT NULL,
  actor VARCHAR(120) NOT NULL,
  before_value TEXT,
  after_value TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(is_visible, sale_status);
CREATE INDEX IF NOT EXISTS idx_product_options_product ON product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_banners_active_window ON promotion_banners(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_addresses_member ON addresses(member_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_member ON cart_items(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_member ON orders(member_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
