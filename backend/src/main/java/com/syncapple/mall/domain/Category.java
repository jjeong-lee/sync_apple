package com.syncapple.mall.domain;

public record Category(long id, String name, String slug, Long parentId, boolean active, int sortOrder) {}
