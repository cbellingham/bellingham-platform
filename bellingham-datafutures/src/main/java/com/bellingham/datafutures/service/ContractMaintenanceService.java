package com.bellingham.datafutures.service;

import com.bellingham.datafutures.repository.ForwardContractRepository;
import java.time.LocalDate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ContractMaintenanceService {

    private final ForwardContractRepository repository;
    private final MarketDataService marketDataService;

    public ContractMaintenanceService(ForwardContractRepository repository,
                                      MarketDataService marketDataService) {
        this.repository = repository;
        this.marketDataService = marketDataService;
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void updateExpiredContracts() {
        LocalDate today = LocalDate.now();
        int availableUpdated = repository.updateStatusForExpiredContracts(today, "Available", "Void");
        int purchasedUpdated = repository.updateStatusForExpiredContracts(today, "Purchased", "Delivered");

        if (availableUpdated > 0 || purchasedUpdated > 0) {
            marketDataService.publishSnapshot();
        }
    }
}
