package com.chronosdtn.gateway.controller;

import com.chronosdtn.gateway.dto.DtnPackageRequest;
import com.chronosdtn.gateway.model.DtnPackage;
import com.chronosdtn.gateway.service.DtnQueueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class DtnPackageController {

    private final DtnQueueService dtnQueueService;

    public DtnPackageController(DtnQueueService dtnQueueService) {
        this.dtnQueueService = dtnQueueService;
    }

    @GetMapping
    public ResponseEntity<List<DtnPackage>> getAllPackages() {
        return ResponseEntity.ok(dtnQueueService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtnPackage> getPackageById(@PathVariable Long id) {
        return dtnQueueService.getPackageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPackage(@Valid @RequestBody DtnPackageRequest request) {
        try {
            DtnPackage created = dtnQueueService.createPackage(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Integer retries) {
        try {
            DtnPackage updated = dtnQueueService.updateStatus(id, status, retries);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
