package com.chronosdtn.gateway.repository;

import com.chronosdtn.gateway.model.TransacaoAuditada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransacaoAuditadaRepository extends JpaRepository<TransacaoAuditada, Long> {
    Optional<TransacaoAuditada> findByHashTransacao(String hashTransacao);
}
