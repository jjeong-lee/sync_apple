package com.syncapple.mall.api;

import com.syncapple.mall.domain.Address;
import com.syncapple.mall.domain.MemberAccount;
import com.syncapple.mall.service.MemberService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
public class MemberController {
  private final MemberService memberService;

  public MemberController(MemberService memberService) {
    this.memberService = memberService;
  }

  @PostMapping("/register")
  public ApiResponse<MemberAccount> register(@Valid @RequestBody RegisterRequest request) {
    return ApiResponse.ok(memberService.register(request.email(), request.name(), request.password()));
  }

  @PostMapping("/login")
  public ApiResponse<MemberAccount> login(@Valid @RequestBody LoginRequest request) {
    return ApiResponse.ok(memberService.login(request.email()));
  }

  @GetMapping("/{memberId}")
  public ApiResponse<MemberAccount> member(@PathVariable long memberId) {
    return ApiResponse.ok(memberService.member(memberId));
  }

  @GetMapping("/{memberId}/addresses")
  public ApiResponse<List<Address>> addresses(@PathVariable long memberId) {
    return ApiResponse.ok(memberService.addresses(memberId));
  }

  @PostMapping("/{memberId}/addresses")
  public ApiResponse<List<Address>> createAddress(@PathVariable long memberId, @Valid @RequestBody AddressRequest request) {
    return ApiResponse.ok(memberService.createAddress(memberId, request.toAddress(memberId, 0L)));
  }

  @PatchMapping("/{memberId}/addresses/{addressId}")
  public ApiResponse<List<Address>> updateAddress(@PathVariable long memberId, @PathVariable long addressId, @Valid @RequestBody AddressRequest request) {
    return ApiResponse.ok(memberService.updateAddress(memberId, addressId, request.toAddress(memberId, addressId)));
  }

  @DeleteMapping("/{memberId}/addresses/{addressId}")
  public ApiResponse<List<Address>> deleteAddress(@PathVariable long memberId, @PathVariable long addressId) {
    return ApiResponse.ok(memberService.deleteAddress(memberId, addressId));
  }

  public record RegisterRequest(@Email String email, @NotBlank String name, @NotBlank String password) {}
  public record LoginRequest(@Email String email, @NotBlank String password) {}
  public record AddressRequest(@NotBlank String label, @NotBlank String recipientName, @NotBlank String phone, @NotBlank String line1, String line2, @NotBlank String postalCode, boolean defaultAddress) {
    Address toAddress(long memberId, long addressId) {
      return new Address(addressId, memberId, label, recipientName, phone, line1, line2, postalCode, defaultAddress);
    }
  }
}
