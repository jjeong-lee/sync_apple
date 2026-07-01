package com.syncapple.mall.service;

import com.syncapple.mall.domain.AdminOverview;
import com.syncapple.mall.domain.Banner;
import com.syncapple.mall.domain.OrderRecord;
import com.syncapple.mall.domain.ProductSummary;
import com.syncapple.mall.repository.CatalogRepository;
import com.syncapple.mall.repository.CommerceRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AdminService {
  private final CommerceRepository commerceRepository;
  private final CatalogRepository catalogRepository;

  public AdminService(CommerceRepository commerceRepository, CatalogRepository catalogRepository) {
    this.commerceRepository = commerceRepository;
    this.catalogRepository = catalogRepository;
  }

  public AdminOverview overview() {
    return new AdminOverview(
        commerceRepository.countActiveProducts(),
        commerceRepository.countActiveMembers(),
        commerceRepository.countOpenOrders(),
        commerceRepository.countLiveBanners(),
        commerceRepository.findRecentOrders(5));
  }

  public List<ProductSummary> products() {
    return catalogRepository.findAllProducts();
  }

  public List<Banner> banners() {
    return catalogRepository.findBannersByType("HERO");
  }

  public List<OrderRecord> orders() {
    return commerceRepository.findRecentOrders(20);
  }
}
