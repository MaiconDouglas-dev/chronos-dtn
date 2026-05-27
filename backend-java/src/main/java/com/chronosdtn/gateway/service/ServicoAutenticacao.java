package com.chronosdtn.gateway.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class ServicoAutenticacao {

    @Value("${chronos.security.jwt.secret}")
    private String jwtSecret;

    @Value("${chronos.security.jwt.issuer}")
    private String jwtIssuer;

    private static final long TEMPO_EXPIRACAO = 86400000; // 24 horas em milissegundos

    public String autenticarEGerarToken(String username, String password) {
        boolean eValido = "operator".equals(username) || 
                          "AETHER-LUN-01".equals(username) || 
                          "SELENE-FIN-02".equals(username) || 
                          "ARTEMIS-REL-03".equals(username);
        
        if (eValido && "password".equals(password)) {
            return gerarToken(username);
        } else {
            throw new BadCredentialsException("Username ou password inválidos");
        }
    }

    public String gerarToken(String username) {
        Algorithm algoritmo = Algorithm.HMAC256(jwtSecret);
        return JWT.create()
                .withIssuer(jwtIssuer)
                .withSubject(username)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + TEMPO_EXPIRACAO))
                .sign(algoritmo);
    }

    public String validarTokenEObterSubject(String token) {
        Algorithm algoritmo = Algorithm.HMAC256(jwtSecret);
        return JWT.require(algoritmo)
                .withIssuer(jwtIssuer)
                .build()
                .verify(token)
                .getSubject();
    }
}
