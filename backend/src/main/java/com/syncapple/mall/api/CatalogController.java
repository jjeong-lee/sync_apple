package com.syncapple.mall.api;

import com.syncapple.mall.domain.Category;
import com.syncapple.mall.domain.HomeContent;
import com.syncapple.mall.domain.ProductDetail;
import com.syncapple.mall.domain.ProductSummary;
import com.syncapple.mall.service.HomeContentService;
import com.syncapple.mall.service.ProductCatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CatalogController {
  private final HomeContentService homeContentService;
  private final ProductCatalogService productCatalogService;

  public CatalogController(HomeContentService homeContentService, ProductCatalogService productCatalogService) {
    this.homeContentService = homeContentService;
    this.productCatalogService = productCatalogService;
  }

  @GetMapping("/home")
  public ApiResponse<HomeContent> home() {
    return ApiResponse.ok(homeContentService.loadHomeContent());
  }

  @GetMapping("/categories")
  public ApiResponse<List<Category>> categories() {
    return ApiResponse.ok(productCatalogService.categories());
  }

  @GetMapping("/products")
  public ApiResponse<List<ProductSummary>> products(
      @RequestParam(required = false) String query,
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String stockStatus) {
    return ApiResponse.ok(productCatalogService.products(query, category, sort, stockStatus));
  }

  @GetMapping("/products/{slug}")
  public ApiResponse<ProductDetail> product(@PathVariable String slug) {
    return ApiResponse.ok(productCatalogService.productDetail(slug));
  }
}
