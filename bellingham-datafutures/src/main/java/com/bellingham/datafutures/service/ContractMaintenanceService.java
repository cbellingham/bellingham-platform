package com.bellingham.datafutures.service;

import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.repository.ForwardContractRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ContractMaintenanceService {

    private final ForwardContractRepository repository;

    public ContractMaintenanceService(ForwardContractRepository repository) {
        this.repository = repository;
    }

    @Scheduled(cron = "0 0 * * * *")
    public void updateExpiredContracts() {
        LocalDate today = LocalDate.now();
        List<ForwardContract> contracts = repository.findAll();
        for (ForwardContract contract : contracts) {
            LocalDate delivery = contract.getDeliveryDate();
            if (delivery != null && delivery.isBefore(today)) {
                String status = contract.getStatus();
                if ("Available".equalsIgnoreCase(status)) {
                    contract.setStatus("Void");
                    repository.save(contract);
                } else if ("Purchased".equalsIgnoreCase(status)) {
                    contract.setStatus("Delivered");
                    repository.save(contract);
                }
            }
        }
    }
}
