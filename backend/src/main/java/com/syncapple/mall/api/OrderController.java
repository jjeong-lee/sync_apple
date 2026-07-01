package com.syncapple.mall.api;

import com.syncapple.mall.domain.OrderPreview;
import com.syncapple.mall.domain.OrderRecord;
import com.syncapple.mall.service.CheckoutService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final CheckoutService checkoutService;

  public OrderController(CheckoutService checkoutService) {
    this.checkoutService = checkoutService;
  }

  @PostMapping("/preview")
  public ApiResponse<OrderPreview> preview(@Valid @RequestBody OrderPreviewRequest request) {
    return ApiResponse.ok(checkoutService.preview(request.memberId()));
  }

  @PostMapping
  public ApiResponse<OrderRecord> create(@Valid @RequestBody CreateOrderRequest request) {
    return ApiResponse.ok(checkoutService.createOrder(request.memberId(), request.addressId(), request.paymentMethod(), request.clientRequestId()));
  }

  @GetMapping("/member/{memberId}")
  public ApiResponse<List<OrderRecord>> orders(@PathVariable long memberId) {
    return ApiResponse.ok(checkoutService.orderHistory(memberId));
  }

  public record OrderPreviewRequest(@NotNull Long memberId) {}
  public record CreateOrderRequest(@NotNull Long memberId, @NotNull Long addressId, @NotBlank String paymentMethod, @NotBlank String clientRequestId) {}
}
