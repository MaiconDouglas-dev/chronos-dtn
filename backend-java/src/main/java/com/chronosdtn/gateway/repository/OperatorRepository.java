package com.chronosdtn.gateway.repository;

import com.chronosdtn.gateway.model.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OperatorRepository extends JpaRepository<Operator, Long> {
    Optional<Operator> findByCodigoRegistro(String codigoRegistro);
}
