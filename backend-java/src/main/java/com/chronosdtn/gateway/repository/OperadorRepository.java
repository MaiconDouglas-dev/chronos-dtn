package com.chronosdtn.gateway.repository;

import com.chronosdtn.gateway.model.Operador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {
    Optional<Operador> findByCodigoRegistro(String codigoRegistro);
}
