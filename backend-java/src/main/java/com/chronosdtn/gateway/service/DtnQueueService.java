package com.chronosdtn.gateway.service;

import com.chronosdtn.gateway.dto.DtnPackageRequest;
import com.chronosdtn.gateway.model.DtnPackage;
import com.chronosdtn.gateway.model.Operator;
import com.chronosdtn.gateway.repository.DtnPackageRepository;
import com.chronosdtn.gateway.repository.OperatorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DtnQueueService {

    private final DtnPackageRepository dtnPackageRepository;
    private final OperatorRepository operatorRepository;

    public DtnQueueService(DtnPackageRepository dtnPackageRepository, OperatorRepository operatorRepository) {
        this.dtnPackageRepository = dtnPackageRepository;
        this.operatorRepository = operatorRepository;
    }

    @Transactional
    public DtnPackage createPackage(DtnPackageRequest request) {
        Operator operator = operatorRepository.findById(request.getOperadoraId())
                .orElseThrow(() -> new IllegalArgumentException("Operator not found with ID: " + request.getOperadoraId()));

        DtnPackage dtnPackage = new DtnPackage();
        dtnPackage.setOperator(operator);
        dtnPackage.setPacoteMetadata(request.getPacoteMetadata());
        dtnPackage.setTamanhoKb(request.getTamanhoKb());
        if (request.getStatusTransmissao() != null) {
            dtnPackage.setStatusTransmissao(request.getStatusTransmissao());
        }
        if (request.getRetries() != null) {
            dtnPackage.setRetries(request.getRetries());
        }
        dtnPackage.setCreatedAt(request.getCreatedAt());

        return dtnPackageRepository.save(dtnPackage);
    }

    @Transactional
    public DtnPackage updateStatus(Long id, String status, Integer retries) {
        DtnPackage dtnPackage = dtnPackageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("DTN Package not found with ID: " + id));

        dtnPackage.setStatusTransmissao(status);
        if (retries != null) {
            dtnPackage.setRetries(retries);
        }

        return dtnPackageRepository.save(dtnPackage);
    }

    public List<DtnPackage> getAllPackages() {
        return dtnPackageRepository.findAll();
    }

    public Optional<DtnPackage> getPackageById(Long id) {
        return dtnPackageRepository.findById(id);
    }
}
