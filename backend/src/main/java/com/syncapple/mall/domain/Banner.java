package com.syncapple.mall.domain;

import java.time.LocalDateTime;

public record Banner(
    long id,
    String title,
    String subtitle,
    String eyebrow,
    String ctaLabel,
    String targetPath,
    String imageUrl,
    boolean active,
    LocalDateTime startsAt,
    LocalDateTime endsAt,
    int displayOrder,
    String bannerType) {}
