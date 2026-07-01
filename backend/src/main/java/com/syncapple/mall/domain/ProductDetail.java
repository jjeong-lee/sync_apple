package com.syncapple.mall.domain;

import java.util.List;

public record ProductDetail(ProductSummary product, List<ProductOption> options, List<ProductSummary> relatedProducts) {}
