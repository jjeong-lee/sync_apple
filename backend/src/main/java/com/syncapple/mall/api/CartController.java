package com.syncapple.mall.api;

import com.syncapple.mall.domain.CartItemView;
import com.syncapple.mall.service.CartService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart/{memberId}")
public class CartController {
  private final CartService cartService;

  public CartController(CartService cartService) {
    this.cartService = cartService;
  }

  @GetMapping
  public ApiResponse<List<CartItemView>> cart(@PathVariable long memberId) {
    return ApiResponse.ok(cartService.cart(memberId));
  }

  @PostMapping("/items")
  public ApiResponse<List<CartItemView>> addItem(@PathVariable long memberId, @Valid @RequestBody CartItemRequest request) {
    return ApiResponse.ok(cartService.addItem(memberId, request.productId(), request.optionId(), request.quantity()));
  }

  @PatchMapping("/items/{cartItemId}")
  public ApiResponse<List<CartItemView>> updateQuantity(@PathVariable long memberId, @PathVariable long cartItemId, @Valid @RequestBody UpdateCartItemRequest request) {
    return ApiResponse.ok(cartService.updateQuantity(memberId, cartItemId, request.quantity()));
  }

  @DeleteMapping("/items/{cartItemId}")
  public ApiResponse<List<CartItemView>> remove(@PathVariable long memberId, @PathVariable long cartItemId) {
    return ApiResponse.ok(cartService.remove(memberId, cartItemId));
  }

  public record CartItemRequest(@NotNull Long productId, @NotNull Long optionId, @Min(1) int quantity) {}
  public record UpdateCartItemRequest(@Min(1) int quantity) {}
}
