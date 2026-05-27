package com.chronosdtn.gateway.controller;

import com.chronosdtn.gateway.dto.RequisicaoTransacao;
import com.chronosdtn.gateway.model.TransacaoAuditada;
import com.chronosdtn.gateway.model.Operador;
import com.chronosdtn.gateway.repository.TransacaoAuditadaRepository;
import com.chronosdtn.gateway.repository.OperadorRepository;
import com.chronosdtn.gateway.service.ServicoAuditoriaTempo;
import jakarta.validation.Valid;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/transacoes")
public class ControleTransacaoAuditada {

    private final TransacaoAuditadaRepository transacaoAuditadaRepository;
    private final OperadorRepository operadorRepository;
    private final ServicoAuditoriaTempo servicoAuditoriaTempo;

    public ControleTransacaoAuditada(
            TransacaoAuditadaRepository transacaoAuditadaRepository,
            OperadorRepository operadorRepository,
            ServicoAuditoriaTempo servicoAuditoriaTempo) {
        this.transacaoAuditadaRepository = transacaoAuditadaRepository;
        this.operadorRepository = operadorRepository;
        this.servicoAuditoriaTempo = servicoAuditoriaTempo;
    }

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<TransacaoAuditada>>> obterTodasTransacoes() {
        List<EntityModel<TransacaoAuditada>> transacoes = transacaoAuditadaRepository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());

        CollectionModel<EntityModel<TransacaoAuditada>> collectionModel = CollectionModel.of(transacoes,
                linkTo(methodOn(ControleTransacaoAuditada.class).obterTodasTransacoes()).withSelfRel());

        return ResponseEntity.ok(collectionModel);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<TransacaoAuditada>> obterTransacaoPorId(@PathVariable Long id) {
        return transacaoAuditadaRepository.findById(id)
                .map(this::toModel)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criarTransacao(@Valid @RequestBody RequisicaoTransacao request) {
        try {
            Operador operador = operadorRepository.findById(request.getOperadoraId())
                    .orElseThrow(() -> new IllegalArgumentException("Operadora não encontrada com o ID: " + request.getOperadoraId()));

            if (transacaoAuditadaRepository.findByHashTransacao(request.getHashTransacao()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Hash de transação já existe");
            }

            long tmTerra = servicoAuditoriaTempo.calcularCorrecaoTempoTerra(request.getTempoLunarBrutoUs());
            long desvio = servicoAuditoriaTempo.calcularDesvio(request.getTempoLunarBrutoUs(), tmTerra);

            TransacaoAuditada transacao = new TransacaoAuditada();
            transacao.setOperador(operador);
            transacao.setValorCreditos(request.getValorCreditos());
            transacao.setTempoLunarBrutoUs(request.getTempoLunarBrutoUs());
            transacao.setTempoTerraCorrigidoUs(tmTerra);
            transacao.setDesvioMicrossegundos(desvio);
            transacao.setStatus("AUDITED");
            transacao.setHashTransacao(request.getHashTransacao());

            TransacaoAuditada salva = transacaoAuditadaRepository.save(transacao);
            return ResponseEntity.status(HttpStatus.CREATED).body(toModel(salva));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private EntityModel<TransacaoAuditada> toModel(TransacaoAuditada transacao) {
        return EntityModel.of(transacao,
                linkTo(methodOn(ControleTransacaoAuditada.class).obterTransacaoPorId(transacao.getId())).withSelfRel(),
                linkTo(methodOn(ControleTransacaoAuditada.class).obterTodasTransacoes()).withRel("transacoes"),
                linkTo(methodOn(ControleNoSatelite.class).obterTodosNos()).withRel("nos")
        );
    }
}
