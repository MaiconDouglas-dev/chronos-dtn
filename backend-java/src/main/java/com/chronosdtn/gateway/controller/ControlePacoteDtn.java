package com.chronosdtn.gateway.controller;

import com.chronosdtn.gateway.dto.RequisicaoPacoteDtn;
import com.chronosdtn.gateway.model.PacoteDtn;
import com.chronosdtn.gateway.service.ServicoFilaDtn;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacotes")
public class ControlePacoteDtn {

    private final ServicoFilaDtn servicoFilaDtn;

    public ControlePacoteDtn(ServicoFilaDtn servicoFilaDtn) {
        this.servicoFilaDtn = servicoFilaDtn;
    }

    @GetMapping
    public ResponseEntity<List<PacoteDtn>> obterTodosPacotes() {
        return ResponseEntity.ok(servicoFilaDtn.obterTodosPacotes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacoteDtn> obterPacotePorId(@PathVariable Long id) {
        return servicoFilaDtn.obterPacotePorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criarPacote(@Valid @RequestBody RequisicaoPacoteDtn request) {
        try {
            PacoteDtn criado = servicoFilaDtn.criarPacote(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(criado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Integer tentativas) {
        try {
            PacoteDtn atualizado = servicoFilaDtn.atualizarStatus(id, status, tentativas);
            return ResponseEntity.ok(atualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
