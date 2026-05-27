package com.chronosdtn.gateway.repository;

import com.chronosdtn.gateway.model.SatelliteNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SatelliteNodeRepository extends JpaRepository<SatelliteNode, Long> {
}
