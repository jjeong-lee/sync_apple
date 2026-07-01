package com.syncapple.mall.config;

import com.syncapple.mall.api.DomainException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RoleGuardInterceptor implements HandlerInterceptor {
  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    if (!request.getRequestURI().startsWith("/api/admin")) {
      return true;
    }
    String role = request.getHeader("X-Role");
    if (!"ADMIN".equalsIgnoreCase(role)) {
      throw new DomainException(HttpStatus.FORBIDDEN, "ADMIN_ONLY", "관리자 권한이 필요합니다.");
    }
    return true;
  }
}
