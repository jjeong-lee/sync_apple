package com.syncapple.mall.domain;

public record Address(long id, long memberId, String label, String recipientName, String phone, String line1, String line2, String postalCode, boolean defaultAddress) {}
