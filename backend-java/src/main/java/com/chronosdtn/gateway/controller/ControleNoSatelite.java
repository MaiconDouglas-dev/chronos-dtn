package com.chronosdtn.gateway.controller;

import com.chronosdtn.gateway.dto.RequisicaoNo;
import com.chronosdtn.gateway.model.NoSatelite;
import com.chronosdtn.gateway.repository.NoSateliteRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nos")
public class ControleNoSatelite {

    private final NoSateliteRepository noSateliteRepository;

    public ControleNoSatelite(NoSateliteRepository noSateliteRepository) {
        this.noSateliteRepository = noSateliteRepository;
    }

    @GetMapping
    public ResponseEntity<List<NoSatelite>> obterTodosNos() {
        return ResponseEntity.ok(noSateliteRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoSatelite> obterNoPorId(@PathVariable Long id) {
        return noSateliteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NoSatelite> criarNo(@Valid @RequestBody RequisicaoNo request) {
        NoSatelite no = new NoSatelite();
        no.setNome(request.getNome());
        no.setLatenciaTerraMs(request.getLatenciaTerraMs());
        no.setLatenciaLuaMs(request.getLatenciaLuaMs());
        no.setStatus(request.getStatus());
        no.setVazaoKbps(request.getVazaoKbps());

        NoSatelite salvo = noSateliteRepository.save(no);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoSatelite> atualizarNo(@PathVariable Long id, @Valid @RequestBody RequisicaoNo request) {
        return noSateliteRepository.findById(id)
                .map(no -> {
                    no.setNome(request.getNome());
                    no.setLatenciaTerraMs(request.getLatenciaTerraMs());
                    no.setLatenciaLuaMs(request.getLatenciaLuaMs());
                    no.setStatus(request.getStatus());
                    no.setVazaoKbps(request.getVazaoKbps());
                    NoSatelite atualizado = noSateliteRepository.save(no);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarNo(@PathVariable Long id) {
        if (noSateliteRepository.existsById(id)) {
            noSateliteRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
