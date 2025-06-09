package com.bellingham.datafutures.repository;

import com.bellingham.datafutures.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByStatus(String status);
}

