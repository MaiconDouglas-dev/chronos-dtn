package com.chronosdtn.gateway.repository;

import com.chronosdtn.gateway.model.NoSatelite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoSateliteRepository extends JpaRepository<NoSatelite, Long> {
}
