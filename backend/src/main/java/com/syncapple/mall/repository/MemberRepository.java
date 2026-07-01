package com.syncapple.mall.repository;

import com.syncapple.mall.domain.Address;
import com.syncapple.mall.domain.MemberAccount;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class MemberRepository {
  private final JdbcTemplate jdbcTemplate;

  public MemberRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public MemberAccount findMember(long memberId) {
    List<MemberAccount> results = jdbcTemplate.query(
        "SELECT id, email, name, role, status FROM members WHERE id = ?",
        (rs, rowNum) -> new MemberAccount(rs.getLong("id"), rs.getString("email"), rs.getString("name"), rs.getString("role"), rs.getString("status")),
        memberId);
    return results.isEmpty() ? null : results.get(0);
  }

  public MemberAccount findByEmail(String email) {
    List<MemberAccount> results = jdbcTemplate.query(
        "SELECT id, email, name, role, status FROM members WHERE email = ?",
        (rs, rowNum) -> new MemberAccount(rs.getLong("id"), rs.getString("email"), rs.getString("name"), rs.getString("role"), rs.getString("status")),
        email);
    return results.isEmpty() ? null : results.get(0);
  }

  public List<Address> findAddresses(long memberId) {
    return jdbcTemplate.query(
        "SELECT id, member_id, label, recipient_name, phone, line1, line2, postal_code, is_default FROM addresses WHERE member_id = ? ORDER BY is_default DESC, id ASC",
        (rs, rowNum) -> new Address(
            rs.getLong("id"),
            rs.getLong("member_id"),
            rs.getString("label"),
            rs.getString("recipient_name"),
            rs.getString("phone"),
            rs.getString("line1"),
            rs.getString("line2"),
            rs.getString("postal_code"),
            rs.getBoolean("is_default")),
        memberId);
  }

  public long nextAddressId() {
    Long current = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 400) + 1 FROM addresses", Long.class);
    return current == null ? 401L : current;
  }

  public long nextMemberId() {
    Long current = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 300) + 1 FROM members", Long.class);
    return current == null ? 301L : current;
  }

  public void insertMember(long id, String email, String name, String password, String role) {
    jdbcTemplate.update(
        "INSERT INTO members (id, email, name, password_hash, role, status, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        id, email, name, password, role);
  }

  public void insertAddress(Address address) {
    jdbcTemplate.update(
        "INSERT INTO addresses (id, member_id, label, recipient_name, phone, line1, line2, postal_code, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        address.id(), address.memberId(), address.label(), address.recipientName(), address.phone(), address.line1(), address.line2(), address.postalCode(), address.defaultAddress());
  }

  public void clearDefault(long memberId) {
    jdbcTemplate.update("UPDATE addresses SET is_default = FALSE, updated_at = CURRENT_TIMESTAMP WHERE member_id = ?", memberId);
  }

  public void updateAddress(Address address) {
    jdbcTemplate.update(
        "UPDATE addresses SET label = ?, recipient_name = ?, phone = ?, line1 = ?, line2 = ?, postal_code = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND member_id = ?",
        address.label(), address.recipientName(), address.phone(), address.line1(), address.line2(), address.postalCode(), address.defaultAddress(), address.id(), address.memberId());
  }

  public void deleteAddress(long memberId, long addressId) {
    jdbcTemplate.update("DELETE FROM addresses WHERE member_id = ? AND id = ?", memberId, addressId);
  }
}
