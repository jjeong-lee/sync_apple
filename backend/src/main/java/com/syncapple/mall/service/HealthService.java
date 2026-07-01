package com.syncapple.mall.service;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class HealthService {
  private final JdbcTemplate jdbcTemplate;

  public HealthService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public Map<String, Object> health() {
    Map<String, Object> components = new LinkedHashMap<>();
    try {
      jdbcTemplate.queryForObject("SELECT 1", Integer.class);
      components.put("database", Map.of("status", "UP"));
    } catch (Exception exception) {
      components.put("database", Map.of("status", "DOWN"));
    }
    components.put("application", Map.of("status", "UP"));
    components.put("storage", Map.of("status", "NOT_CONFIGURED", "detail", "초기 버전에서는 DB 메타데이터 중심으로 자산을 관리합니다."));
    components.put("payment", Map.of("status", "SIMULATED", "detail", "결제 상태 전이는 시뮬레이션 모드입니다."));
    return Map.of("status", "UP", "components", components);
  }
}
