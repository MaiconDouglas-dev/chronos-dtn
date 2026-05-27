package com.chronosdtn.gateway.controller;

import com.chronosdtn.gateway.dto.RespostaJwt;
import com.chronosdtn.gateway.dto.RequisicaoLogin;
import com.chronosdtn.gateway.service.ServicoAutenticacao;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/autenticacao")
public class ControleAutenticacao {

    private final ServicoAutenticacao servicoAutenticacao;

    public ControleAutenticacao(ServicoAutenticacao servicoAutenticacao) {
        this.servicoAutenticacao = servicoAutenticacao;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody RequisicaoLogin requisicaoLogin) {
        try {
            String token = servicoAutenticacao.autenticarEGerarToken(
                    requisicaoLogin.getUsername(),
                    requisicaoLogin.getPassword()
            );
            return ResponseEntity.ok(new RespostaJwt(token));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
