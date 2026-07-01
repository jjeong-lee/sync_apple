package com.syncapple.mall.service;

import com.syncapple.mall.api.DomainException;
import com.syncapple.mall.domain.CartItemView;
import com.syncapple.mall.domain.ProductOption;
import com.syncapple.mall.domain.ProductSummary;
import com.syncapple.mall.repository.CommerceRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class CartService {
  private final CommerceRepository commerceRepository;

  public CartService(CommerceRepository commerceRepository) {
    this.commerceRepository = commerceRepository;
  }

  public List<CartItemView> cart(long memberId) {
    return commerceRepository.findCart(memberId);
  }

  public List<CartItemView> addItem(long memberId, long productId, long optionId, int quantity) {
    validatePurchasable(productId, optionId, quantity);
    commerceRepository.upsertCartItem(memberId, productId, optionId, quantity);
    return cart(memberId);
  }

  public List<CartItemView> updateQuantity(long memberId, long cartItemId, int quantity) {
    if (quantity <= 0) {
      throw new DomainException(HttpStatus.BAD_REQUEST, "INVALID_QUANTITY", "수량은 1개 이상이어야 합니다.");
    }
    commerceRepository.updateCartQuantity(memberId, cartItemId, quantity);
    return cart(memberId);
  }

  public List<CartItemView> remove(long memberId, long cartItemId) {
    commerceRepository.deleteCartItem(memberId, cartItemId);
    return cart(memberId);
  }

  public void validatePurchasable(long productId, long optionId, int quantity) {
    ProductSummary product = commerceRepository.findProduct(productId);
    ProductOption option = commerceRepository.findOption(optionId);
    if (product == null || option == null || !product.visible() || !"ON_SALE".equals(product.saleStatus())) {
      throw new DomainException(HttpStatus.BAD_REQUEST, "PRODUCT_NOT_AVAILABLE", "판매 가능한 상품만 장바구니에 담을 수 있습니다.");
    }
    if (!option.purchasable() || option.stockQuantity() < quantity) {
      throw new DomainException(HttpStatus.BAD_REQUEST, "OPTION_NOT_AVAILABLE", "현재 선택한 옵션의 재고를 확인해 주세요.");
    }
  }
}
