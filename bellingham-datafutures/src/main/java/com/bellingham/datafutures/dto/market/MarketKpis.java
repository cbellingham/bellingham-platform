package com.bellingham.datafutures.dto.market;

import java.math.BigDecimal;

public class MarketKpis {

    private long openContracts;
    private long marketDepth;
    private BigDecimal totalVolume;
    private BigDecimal averageAsk;
    private long activeSellers;
    private BigDecimal spread;
    private BigDecimal bestAsk;
    private long executionsLastHour;

    public static MarketKpis empty() {
        MarketKpis kpis = new MarketKpis();
        kpis.setOpenContracts(0L);
        kpis.setMarketDepth(0L);
        kpis.setTotalVolume(BigDecimal.ZERO);
        kpis.setAverageAsk(BigDecimal.ZERO);
        kpis.setActiveSellers(0L);
        kpis.setSpread(BigDecimal.ZERO);
        kpis.setBestAsk(BigDecimal.ZERO);
        kpis.setExecutionsLastHour(0L);
        return kpis;
    }

    public long getOpenContracts() {
        return openContracts;
    }

    public void setOpenContracts(long openContracts) {
        this.openContracts = openContracts;
    }

    public long getMarketDepth() {
        return marketDepth;
    }

    public void setMarketDepth(long marketDepth) {
        this.marketDepth = marketDepth;
    }

    public BigDecimal getTotalVolume() {
        return totalVolume;
    }

    public void setTotalVolume(BigDecimal totalVolume) {
        this.totalVolume = totalVolume;
    }

    public BigDecimal getAverageAsk() {
        return averageAsk;
    }

    public void setAverageAsk(BigDecimal averageAsk) {
        this.averageAsk = averageAsk;
    }

    public long getActiveSellers() {
        return activeSellers;
    }

    public void setActiveSellers(long activeSellers) {
        this.activeSellers = activeSellers;
    }

    public BigDecimal getSpread() {
        return spread;
    }

    public void setSpread(BigDecimal spread) {
        this.spread = spread;
    }

    public BigDecimal getBestAsk() {
        return bestAsk;
    }

    public void setBestAsk(BigDecimal bestAsk) {
        this.bestAsk = bestAsk;
    }

    public long getExecutionsLastHour() {
        return executionsLastHour;
    }

    public void setExecutionsLastHour(long executionsLastHour) {
        this.executionsLastHour = executionsLastHour;
    }
}
