package com.syncapple.mall.domain;

import java.util.List;

public record HomeContent(Banner hero, List<ProductSummary> featured, List<ProductSummary> bestSellers, List<ProductSummary> newArrivals, List<Banner> promotions) {}
