package com.chronosdtn.gateway.repository;

import com.chronosdtn.gateway.model.DtnPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DtnPackageRepository extends JpaRepository<DtnPackage, Long> {
}
