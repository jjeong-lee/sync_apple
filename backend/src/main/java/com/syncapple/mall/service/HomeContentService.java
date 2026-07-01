package com.syncapple.mall.service;

import com.syncapple.mall.domain.Banner;
import com.syncapple.mall.domain.HomeContent;
import com.syncapple.mall.domain.ProductSummary;
import com.syncapple.mall.repository.CatalogRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class HomeContentService {
  private final CatalogRepository catalogRepository;

  public HomeContentService(CatalogRepository catalogRepository) {
    this.catalogRepository = catalogRepository;
  }

  public HomeContent loadHomeContent() {
    List<ProductSummary> visibleProducts = ProductCatalogService.visibleProducts(catalogRepository.findAllProducts());
    LocalDateTime now = catalogRepository.now();
    Banner hero = selectHero(catalogRepository.findBannersByType("HERO"), now);
    List<Banner> promotions = activeBanners(catalogRepository.findBannersByType("PROMOTION"), now);
    return new HomeContent(
        hero,
        visibleProducts.stream().filter(ProductSummary::featured).limit(3).toList(),
        visibleProducts.stream().filter(ProductSummary::bestSeller).limit(4).toList(),
        visibleProducts.stream().filter(ProductSummary::newArrival).limit(4).toList(),
        promotions);
  }

  public Banner selectHero(List<Banner> banners, LocalDateTime now) {
    return activeBanners(banners, now).stream().findFirst().orElse(defaultHero());
  }

  private List<Banner> activeBanners(List<Banner> banners, LocalDateTime now) {
    return banners.stream()
        .filter(Banner::active)
        .filter(banner -> !banner.startsAt().isAfter(now) && !banner.endsAt().isBefore(now))
        .sorted(Comparator.comparingInt(Banner::displayOrder))
        .toList();
  }

  private Banner defaultHero() {
    return new Banner(
        0L,
        "기술이 머무는 공간, 경험이 달라지는 선택",
        "정교하게 큐레이션된 프리미엄 전자제품과 운영자 추천 구성을 만나보세요.",
        "브랜드 소개",
        "카탈로그 보기",
        "/products",
        null,
        true,
        LocalDateTime.now().minusDays(1),
        LocalDateTime.now().plusDays(1),
        0,
        "HERO");
  }
}
