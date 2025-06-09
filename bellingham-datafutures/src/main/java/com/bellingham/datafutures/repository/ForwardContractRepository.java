package com.bellingham.datafutures.repository;

import com.bellingham.datafutures.model.ForwardContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForwardContractRepository extends JpaRepository<ForwardContract, Long> {
}

