package com.chronosdtn.gateway.controller;

import com.chronosdtn.gateway.dto.JWTResponse;
import com.chronosdtn.gateway.dto.LoginRequest;
import com.chronosdtn.gateway.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            String token = authService.authenticateAndGenerateToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            );
            return ResponseEntity.ok(new JWTResponse(token));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
