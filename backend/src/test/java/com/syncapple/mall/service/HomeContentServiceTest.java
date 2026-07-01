package com.syncapple.mall.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.syncapple.mall.domain.Banner;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class HomeContentServiceTest {
  private final HomeContentService service = new HomeContentService(null);

  @Test
  void fallsBackToBrandHeroWhenNoActiveBannerExists() {
    Banner inactive = new Banner(1L, "inactive", "", "", "", "/", null, false, LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(1), 1, "HERO");

    Banner selected = service.selectHero(List.of(inactive), LocalDateTime.now());

    assertThat(selected.eyebrow()).isEqualTo("브랜드 소개");
    assertThat(selected.title()).contains("기술이 머무는 공간");
  }

  @Test
  void picksLowestDisplayOrderAmongEligibleHeroes() {
    LocalDateTime now = LocalDateTime.now();
    Banner second = new Banner(2L, "second", "", "", "", "/b", null, true, now.minusDays(1), now.plusDays(1), 2, "HERO");
    Banner first = new Banner(1L, "first", "", "", "", "/a", null, true, now.minusDays(1), now.plusDays(1), 1, "HERO");

    Banner selected = service.selectHero(List.of(second, first), now);

    assertThat(selected.id()).isEqualTo(1L);
  }
}
