package com.syncapple.mall.domain;

public record ProductOption(long id, String optionName, String optionValue, String sku, int stockQuantity, boolean purchasable) {
  public String label() {
    return optionName + " · " + optionValue;
  }
}
