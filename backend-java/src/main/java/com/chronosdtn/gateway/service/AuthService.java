package com.chronosdtn.gateway.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuthService {

    @Value("${chronos.security.jwt.secret}")
    private String jwtSecret;

    @Value("${chronos.security.jwt.issuer}")
    private String jwtIssuer;

    private static final long EXPIRATION_TIME = 86400000; // 24 hours in milliseconds

    public String authenticateAndGenerateToken(String username, String password) {
        if ("operator".equals(username) && "password".equals(password)) {
            return generateToken(username);
        } else {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    public String generateToken(String username) {
        Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
        return JWT.create()
                .withIssuer(jwtIssuer)
                .withSubject(username)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(algorithm);
    }

    public String validateTokenAndGetSubject(String token) {
        Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
        return JWT.require(algorithm)
                .withIssuer(jwtIssuer)
                .build()
                .verify(token)
                .getSubject();
    }
}
