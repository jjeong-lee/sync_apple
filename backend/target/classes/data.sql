INSERT INTO categories (id, name, slug, parent_id, is_active, sort_order)
VALUES
  (1, 'Mac', 'mac', NULL, TRUE, 1),
  (2, '오디오', 'audio', NULL, TRUE, 2),
  (3, '액세서리', 'accessories', NULL, TRUE, 3),
  (4, '노트북', 'laptops', 1, TRUE, 1),
  (5, '헤드폰', 'headphones', 2, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, category_id, name, slug, short_description, description, price, sale_price, hero_image_url, badge, is_visible, sale_status, is_featured, is_best_seller, is_new_arrival, sort_order)
VALUES
  (101, 4, 'AstraBook Pro 14', 'astrabook-pro-14', '크리에이터를 위한 14형 프리미엄 퍼포먼스 노트북', '나노 텍스처 알루미늄 바디, 3K Liquid Glass 디스플레이, 18시간 배터리를 제공하는 플래그십 노트북입니다.', 2890000, 2690000, 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', 'New', TRUE, 'ON_SALE', TRUE, TRUE, TRUE, 1),
  (102, 5, 'AstraPods Studio', 'astrapods-studio', '공간 음향과 노이즈 캔슬링을 갖춘 시그니처 헤드폰', '프리미엄 메쉬 이어컵과 적응형 EQ로 몰입감 있는 사운드를 구현한 오버이어 헤드폰입니다.', 790000, 749000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80', 'Best', TRUE, 'ON_SALE', TRUE, TRUE, FALSE, 2),
  (103, 3, 'Orbit Dock', 'orbit-dock', '데스크를 정리하는 7-in-1 알루미늄 허브', '듀얼 4K 출력과 고속 충전을 지원하는 데스크 허브입니다.', 249000, NULL, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Pro', TRUE, 'ON_SALE', TRUE, FALSE, TRUE, 3),
  (104, 3, 'SilkCharge Duo', 'silkcharge-duo', '가죽 마감의 무선 충전 스탠드', '폰과 이어버드를 동시에 충전하는 프리미엄 데스크 액세서리입니다.', 189000, 169000, NULL, NULL, TRUE, 'ON_SALE', FALSE, FALSE, TRUE, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_options (id, product_id, option_name, option_value, sku, stock_quantity, purchasable, display_order)
VALUES
  (1001, 101, '메모리', '16GB / 512GB', 'ABP14-16-512', 14, TRUE, 1),
  (1002, 101, '메모리', '32GB / 1TB', 'ABP14-32-1T', 8, TRUE, 2),
  (1003, 102, '색상', '미드나이트', 'APS-MID', 21, TRUE, 1),
  (1004, 102, '색상', '실버', 'APS-SLV', 4, TRUE, 2),
  (1005, 103, '색상', '스페이스 그레이', 'ODK-GRY', 17, TRUE, 1),
  (1006, 104, '색상', '샌드 베이지', 'SCD-BGE', 0, FALSE, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO promotion_banners (id, title, subtitle, eyebrow, cta_label, target_path, image_url, is_active, starts_at, ends_at, display_order, banner_type)
VALUES
  (201, 'AstraBook Pro 14', '극도로 얇고, 전문가용으로 설계된 새로운 작업 흐름.', '이번 시즌의 대표 모델', '상품 보기', '/products/astrabook-pro-14', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '90 day', 1, 'HERO'),
  (202, 'Studio Sound Event', 'AstraPods Studio와 함께 프라이빗 리스닝 세션을 경험하세요.', '한정 프로모션', '프로모션 보기', '/products/astrapods-studio', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 day', 2, 'PROMOTION')
ON CONFLICT (id) DO NOTHING;

INSERT INTO members (id, email, name, password_hash, role, status, created_at, last_login_at)
VALUES
  (301, 'member@syncapple.dev', '기본 회원', 'demo-password', 'MEMBER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (302, 'admin@syncapple.dev', '운영 관리자', 'admin-password', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO addresses (id, member_id, label, recipient_name, phone, line1, line2, postal_code, is_default)
VALUES
  (401, 301, '집', '기본 회원', '010-1111-2222', '서울시 강남구 테헤란로 10', '18층', '06123', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cart_items (id, member_id, product_id, option_id, quantity)
VALUES
  (501, 301, 101, 1001, 1),
  (502, 301, 103, 1005, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_logs (id, target_type, target_id, action_type, actor, before_value, after_value)
VALUES
  (601, 'PROMOTION_BANNER', '201', 'CREATE', 'system-seed', NULL, '{"status":"active"}')
ON CONFLICT (id) DO NOTHING;
