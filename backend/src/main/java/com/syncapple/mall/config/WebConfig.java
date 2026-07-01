package com.syncapple.mall.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  private final RoleGuardInterceptor roleGuardInterceptor;

  public WebConfig(RoleGuardInterceptor roleGuardInterceptor) {
    this.roleGuardInterceptor = roleGuardInterceptor;
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(roleGuardInterceptor);
  }
}
