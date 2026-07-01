package com.syncapple.mall.service;

import com.syncapple.mall.api.DomainException;
import com.syncapple.mall.domain.Address;
import com.syncapple.mall.domain.MemberAccount;
import com.syncapple.mall.repository.MemberRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {
  private final MemberRepository memberRepository;

  public MemberService(MemberRepository memberRepository) {
    this.memberRepository = memberRepository;
  }

  public MemberAccount member(long memberId) {
    MemberAccount member = memberRepository.findMember(memberId);
    if (member == null) {
      throw new DomainException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "회원 정보를 찾을 수 없습니다.");
    }
    return member;
  }

  public List<Address> addresses(long memberId) {
    return memberRepository.findAddresses(memberId);
  }

  @Transactional
  public MemberAccount register(String email, String name, String password) {
    if (memberRepository.findByEmail(email) != null) {
      throw new DomainException(HttpStatus.BAD_REQUEST, "EMAIL_ALREADY_EXISTS", "이미 가입된 이메일입니다.");
    }
    long memberId = memberRepository.nextMemberId();
    memberRepository.insertMember(memberId, email, name, password, "MEMBER");
    return member(memberId);
  }

  public MemberAccount login(String email) {
    MemberAccount member = memberRepository.findByEmail(email);
    if (member == null || !"ACTIVE".equals(member.status())) {
      throw new DomainException(HttpStatus.UNAUTHORIZED, "LOGIN_FAILED", "로그인 가능한 계정을 찾을 수 없습니다.");
    }
    return member;
  }

  @Transactional
  public List<Address> createAddress(long memberId, Address address) {
    if (address.defaultAddress()) {
      memberRepository.clearDefault(memberId);
    }
    memberRepository.insertAddress(new Address(memberRepository.nextAddressId(), memberId, address.label(), address.recipientName(), address.phone(), address.line1(), address.line2(), address.postalCode(), address.defaultAddress()));
    return addresses(memberId);
  }

  @Transactional
  public List<Address> updateAddress(long memberId, long addressId, Address address) {
    if (address.defaultAddress()) {
      memberRepository.clearDefault(memberId);
    }
    memberRepository.updateAddress(new Address(addressId, memberId, address.label(), address.recipientName(), address.phone(), address.line1(), address.line2(), address.postalCode(), address.defaultAddress()));
    return addresses(memberId);
  }

  @Transactional
  public List<Address> deleteAddress(long memberId, long addressId) {
    memberRepository.deleteAddress(memberId, addressId);
    return addresses(memberId);
  }
}
