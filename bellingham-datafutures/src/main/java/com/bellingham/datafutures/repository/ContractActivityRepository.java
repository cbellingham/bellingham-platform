package com.bellingham.datafutures.repository;

import com.bellingham.datafutures.model.ContractActivity;
import com.bellingham.datafutures.model.ForwardContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContractActivityRepository extends JpaRepository<ContractActivity, Long> {
    List<ContractActivity> findByContractOrderByTimestampAsc(ForwardContract contract);

    long countByActionAndTimestampAfter(String action, LocalDateTime timestamp);
}
