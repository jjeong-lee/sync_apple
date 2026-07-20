package com.syncapple.mall.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class CommerceRepositoryTest {
  @Test
  void readsCartItemsByCreationTimeRatherThanLastQuantityUpdate() {
    JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
    CommerceRepository repository = new CommerceRepository(jdbcTemplate);

    repository.findCart(301L);

    ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
    verify(jdbcTemplate).query(sql.capture(), any(RowMapper.class), eq(301L));
    assertThat(sql.getValue()).contains("ORDER BY ci.created_at DESC, ci.id DESC");
  }
}
