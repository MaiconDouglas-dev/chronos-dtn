package com.chronosdtn.gateway.repository;

import com.chronosdtn.gateway.model.AuditedTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuditedTransactionRepository extends JpaRepository<AuditedTransaction, Long> {
    Optional<AuditedTransaction> findByHashTransacao(String hashTransacao);
}
