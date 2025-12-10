package com.example.demo.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String TEST_SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";
    private static final String TEST_EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(TEST_SECRET);
    }

    @Test
    void testGenerateToken_ReturnsValidToken() {
        String token = jwtUtil.generateToken(TEST_EMAIL);
        
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
    }

    @Test
    void testExtractEmail_ReturnsCorrectEmail() {
        String token = jwtUtil.generateToken(TEST_EMAIL);
        String extractedEmail = jwtUtil.extractEmail(token);
        
        assertThat(extractedEmail).isEqualTo(TEST_EMAIL);
    }

    @Test
    void testExtractExpiration_ReturnsValidDate() {
        String token = jwtUtil.generateToken(TEST_EMAIL);
        Date expiration = jwtUtil.extractExpiration(token);
        
        assertThat(expiration).isNotNull();
        assertThat(expiration).isAfter(new Date()); // Should expire in the future
    }

    @Test
    void testValidateToken_WithValidToken_ReturnsTrue() {
        String token = jwtUtil.generateToken(TEST_EMAIL);
        Boolean isValid = jwtUtil.validateToken(token, TEST_EMAIL);
        
        assertThat(isValid).isTrue();
    }

    @Test
    void testValidateToken_WithWrongEmail_ReturnsFalse() {
        String token = jwtUtil.generateToken(TEST_EMAIL);
        Boolean isValid = jwtUtil.validateToken(token, "wrong@example.com");
        
        assertThat(isValid).isFalse();
    }

    @Test
    void testGenerateToken_ForDifferentUsers_GeneratesDifferentTokens() {
        String token1 = jwtUtil.generateToken("user1@example.com");
        String token2 = jwtUtil.generateToken("user2@example.com");
        
        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    void testExtractClaim_CanExtractSubject() {
        String token = jwtUtil.generateToken(TEST_EMAIL);
        String subject = jwtUtil.extractClaim(token, Claims::getSubject);
        
        assertThat(subject).isEqualTo(TEST_EMAIL);
    }
}
