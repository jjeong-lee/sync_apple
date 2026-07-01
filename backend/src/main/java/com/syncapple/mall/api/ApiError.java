package com.syncapple.mall.api;

import java.time.Instant;
import java.util.Map;

public record ApiError(String status, String code, String message, Instant timestamp, Map<String, String> details) {
  public static ApiError of(String code, String message, Map<String, String> details) {
    return new ApiError("error", code, message, Instant.now(), details);
  }
}
