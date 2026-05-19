package com.ptit.studentportal.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    // Find by token hash and check if still valid
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    // Find latest OTP token for a user
    @Query("SELECT t FROM PasswordResetToken t WHERE t.userId = :userId AND t.tokenHash LIKE 'OTP:%' ORDER BY t.createdAt DESC")
    java.util.List<PasswordResetToken> findOtpTokensByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    // Find all unused tokens for a user
    @Query("SELECT t FROM PasswordResetToken t WHERE t.userId = :userId AND t.usedAt IS NULL")
    java.util.List<PasswordResetToken> findUnusedTokensByUserId(@Param("userId") Long userId);

    // Mark token as used
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.usedAt = :usedAt WHERE t.resetId = :resetId")
    void markAsUsed(@Param("resetId") Long resetId, @Param("usedAt") LocalDateTime usedAt);

    // Delete expired tokens (cleanup)
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now AND t.usedAt IS NULL")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
}
