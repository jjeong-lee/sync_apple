package com.syncapple.mall.domain;

import java.util.List;

public record AdminOverview(long activeProducts, long activeMembers, long openOrders, long liveBanners, List<OrderRecord> recentOrders) {}
