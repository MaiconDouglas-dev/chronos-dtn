package com.chronosdtn.gateway.controller;

import com.chronosdtn.gateway.dto.TransactionRequest;
import com.chronosdtn.gateway.model.AuditedTransaction;
import com.chronosdtn.gateway.model.Operator;
import com.chronosdtn.gateway.repository.AuditedTransactionRepository;
import com.chronosdtn.gateway.repository.OperatorRepository;
import com.chronosdtn.gateway.service.TimeAuditingService;
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
@RequestMapping("/api/transactions")
public class AuditedTransactionController {

    private final AuditedTransactionRepository auditedTransactionRepository;
    private final OperatorRepository operatorRepository;
    private final TimeAuditingService timeAuditingService;

    public AuditedTransactionController(
            AuditedTransactionRepository auditedTransactionRepository,
            OperatorRepository operatorRepository,
            TimeAuditingService timeAuditingService) {
        this.auditedTransactionRepository = auditedTransactionRepository;
        this.operatorRepository = operatorRepository;
        this.timeAuditingService = timeAuditingService;
    }

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<AuditedTransaction>>> getAllTransactions() {
        List<EntityModel<AuditedTransaction>> transactions = auditedTransactionRepository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());

        CollectionModel<EntityModel<AuditedTransaction>> collectionModel = CollectionModel.of(transactions,
                linkTo(methodOn(AuditedTransactionController.class).getAllTransactions()).withSelfRel());

        return ResponseEntity.ok(collectionModel);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<AuditedTransaction>> getTransactionById(@PathVariable Long id) {
        return auditedTransactionRepository.findById(id)
                .map(this::toModel)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@Valid @RequestBody TransactionRequest request) {
        try {
            Operator operator = operatorRepository.findById(request.getOperadoraId())
                    .orElseThrow(() -> new IllegalArgumentException("Operator not found with ID: " + request.getOperadoraId()));

            if (auditedTransactionRepository.findByHashTransacao(request.getHashTransacao()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Transaction hash already exists");
            }

            long tmTerra = timeAuditingService.calculateEarthTimeCorrection(request.getTmLunarBruto());
            long desvio = timeAuditingService.calculateDrift(request.getTmLunarBruto(), tmTerra);

            AuditedTransaction transaction = new AuditedTransaction();
            transaction.setOperator(operator);
            transaction.setVlCreditos(request.getVlCreditos());
            transaction.setTmLunarBruto(request.getTmLunarBruto());
            transaction.setTmTerraCorrigido(tmTerra);
            transaction.setDesvioMicrossegundos(desvio);
            transaction.setStatus("AUDITED");
            transaction.setHashTransacao(request.getHashTransacao());

            AuditedTransaction saved = auditedTransactionRepository.save(transaction);
            return ResponseEntity.status(HttpStatus.CREATED).body(toModel(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private EntityModel<AuditedTransaction> toModel(AuditedTransaction transaction) {
        return EntityModel.of(transaction,
                linkTo(methodOn(AuditedTransactionController.class).getTransactionById(transaction.getId())).withSelfRel(),
                linkTo(methodOn(AuditedTransactionController.class).getAllTransactions()).withRel("transactions"),
                linkTo(methodOn(SatelliteNodeController.class).getAllNodes()).withRel("nodes")
        );
    }
}
