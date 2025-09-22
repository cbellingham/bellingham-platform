package com.bellingham.datafutures.service;

import com.bellingham.datafutures.repository.ForwardContractRepository;
import java.time.LocalDate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ContractMaintenanceService {

    private final ForwardContractRepository repository;

    public ContractMaintenanceService(ForwardContractRepository repository) {
        this.repository = repository;
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void updateExpiredContracts() {
        LocalDate today = LocalDate.now();
        repository.updateStatusForExpiredContracts(today, "Available", "Void");
        repository.updateStatusForExpiredContracts(today, "Purchased", "Delivered");
    }
}
