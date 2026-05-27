package com.chronosdtn.gateway.repository;

import com.chronosdtn.gateway.model.PacoteDtn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacoteDtnRepository extends JpaRepository<PacoteDtn, Long> {
}
