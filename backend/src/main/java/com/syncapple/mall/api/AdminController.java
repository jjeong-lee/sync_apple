package com.syncapple.mall.api;

import com.syncapple.mall.domain.AdminOverview;
import com.syncapple.mall.domain.Banner;
import com.syncapple.mall.domain.OrderRecord;
import com.syncapple.mall.domain.ProductSummary;
import com.syncapple.mall.service.AdminService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping("/overview")
  public ApiResponse<AdminOverview> overview() {
    return ApiResponse.ok(adminService.overview());
  }

  @GetMapping("/products")
  public ApiResponse<List<ProductSummary>> products() {
    return ApiResponse.ok(adminService.products());
  }

  @GetMapping("/banners")
  public ApiResponse<List<Banner>> banners() {
    return ApiResponse.ok(adminService.banners());
  }

  @GetMapping("/orders")
  public ApiResponse<List<OrderRecord>> orders() {
    return ApiResponse.ok(adminService.orders());
  }
}
