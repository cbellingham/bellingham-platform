package com.bellingham.datafutures.service;

import com.bellingham.datafutures.dto.market.MarketDelta;
import com.bellingham.datafutures.dto.market.MarketKpis;
import com.bellingham.datafutures.dto.market.MarketSnapshot;
import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.repository.ContractActivityRepository;
import com.bellingham.datafutures.repository.ForwardContractRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
public class MarketDataService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MarketDataService.class);
    private static final String PURCHASE_ACTION = "Purchased contract";

    private final ForwardContractRepository contractRepository;
    private final ContractActivityRepository activityRepository;
    private final MarketDataStreamService streamService;
    private final AtomicReference<MarketKpis> baseline = new AtomicReference<>(MarketKpis.empty());

    public MarketDataService(ForwardContractRepository contractRepository,
                             ContractActivityRepository activityRepository,
                             MarketDataStreamService streamService) {
        this.contractRepository = contractRepository;
        this.activityRepository = activityRepository;
        this.streamService = streamService;
    }

    public void publishSnapshot() {
        MarketSnapshot snapshot = computeSnapshot(true);
        streamService.broadcast(snapshot);
    }

    public MarketSnapshot getSnapshot() {
        MarketSnapshot snapshot = computeSnapshot(false);
        snapshot.setDelta(MarketDelta.empty());
        return snapshot;
    }

    public void sendSnapshot(SseEmitter emitter) {
        try {
            MarketSnapshot snapshot = computeSnapshot(false);
            snapshot.setDelta(MarketDelta.empty());
            streamService.sendSnapshot(emitter, snapshot);
        } catch (IOException ex) {
            LOGGER.warn("Failed to send initial market snapshot", ex);
            emitter.completeWithError(ex);
        }
    }

    private MarketSnapshot computeSnapshot(boolean updateBaseline) {
        List<ForwardContract> available = contractRepository
                .findByStatus("Available", Pageable.unpaged())
                .getContent();

        List<ForwardContract> orderBook = available.stream()
                .sorted(Comparator.comparing(ForwardContract::getPrice, (left, right) -> {
                    if (left == null && right == null) {
                        return 0;
                    }
                    if (left == null) {
                        return 1;
                    }
                    if (right == null) {
                        return -1;
                    }
                    return left.compareTo(right);
                }))
                .limit(50)
                .collect(Collectors.toList());

        MarketKpis kpis = calculateKpis(available, orderBook);
        MarketKpis previous = baseline.get();
        MarketDelta delta = MarketDelta.from(previous, kpis);

        if (updateBaseline) {
            baseline.set(kpis);
        }

        MarketSnapshot snapshot = new MarketSnapshot();
        snapshot.setContracts(orderBook);
        snapshot.setKpis(kpis);
        snapshot.setDelta(delta);
        snapshot.setGeneratedAt(Instant.now());
        return snapshot;
    }

    private MarketKpis calculateKpis(List<ForwardContract> available, List<ForwardContract> orderBook) {
        BigDecimal totalVolume = available.stream()
                .map(ForwardContract::getPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long availableCount = available.size();
        BigDecimal averageAsk = availableCount == 0
                ? BigDecimal.ZERO
                : totalVolume.divide(BigDecimal.valueOf(availableCount), 2, RoundingMode.HALF_UP);

        BigDecimal bestAsk = orderBook.stream()
                .map(ForwardContract::getPrice)
                .filter(Objects::nonNull)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal tailAsk = orderBook.stream()
                .map(ForwardContract::getPrice)
                .filter(Objects::nonNull)
                .max(BigDecimal::compareTo)
                .orElse(bestAsk);

        BigDecimal spread = tailAsk.subtract(bestAsk);

        long activeSellers = available.stream()
                .map(ForwardContract::getSeller)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .distinct()
                .count();

        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);
        long executionsLastHour = activityRepository.countByActionAndTimestampAfter(PURCHASE_ACTION, cutoff);

        MarketKpis kpis = new MarketKpis();
        kpis.setOpenContracts(availableCount);
        kpis.setMarketDepth(availableCount);
        kpis.setTotalVolume(totalVolume);
        kpis.setAverageAsk(averageAsk);
        kpis.setActiveSellers(activeSellers);
        kpis.setSpread(spread);
        kpis.setBestAsk(bestAsk);
        kpis.setExecutionsLastHour(executionsLastHour);
        return kpis;
    }
}
