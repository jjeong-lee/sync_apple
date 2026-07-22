package com.syncapple.mall.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.syncapple.mall.domain.ProductOption;
import java.util.List;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;

@ExtendWith(MockitoExtension.class)
class CatalogRepositoryTest {

  @Test
  void bindsProductIdsAsNamedParameterInsteadOfFormattingThemIntoSql() {
    JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
    NamedParameterJdbcTemplate namedParameterJdbcTemplate = mock(NamedParameterJdbcTemplate.class);
    CatalogRepository repository = new CatalogRepository(jdbcTemplate, namedParameterJdbcTemplate);
    List<ProductOption> expected = List.of();
    when(namedParameterJdbcTemplate.query(any(String.class), any(SqlParameterSource.class), any(RowMapper.class)))
        .thenReturn(expected);

    List<ProductOption> result = repository.findOptionsForProducts(List.of(10L, 20L));

    assertThat(result).isSameAs(expected);
    ArgumentCaptor<SqlParameterSource> parameters = ArgumentCaptor.forClass(SqlParameterSource.class);
    verify(namedParameterJdbcTemplate).query(
        eq("SELECT id, option_name, option_value, sku, stock_quantity, purchasable FROM product_options WHERE product_id IN (:productIds)"),
        parameters.capture(),
        any(RowMapper.class));
    assertThat(parameters.getValue().getValue("productIds")).isEqualTo(List.of(10L, 20L));
    verifyNoInteractions(jdbcTemplate);
  }
}
