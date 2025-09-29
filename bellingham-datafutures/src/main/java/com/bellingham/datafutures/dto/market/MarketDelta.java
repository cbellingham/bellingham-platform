package com.bellingham.datafutures.dto.market;

import java.math.BigDecimal;

public class MarketDelta {

    private long openContracts;
    private long marketDepth;
    private BigDecimal totalVolume;
    private BigDecimal averageAsk;
    private long activeSellers;
    private BigDecimal spread;
    private BigDecimal bestAsk;
    private long executionsLastHour;

    public static MarketDelta empty() {
        MarketDelta delta = new MarketDelta();
        delta.setOpenContracts(0L);
        delta.setMarketDepth(0L);
        delta.setTotalVolume(BigDecimal.ZERO);
        delta.setAverageAsk(BigDecimal.ZERO);
        delta.setActiveSellers(0L);
        delta.setSpread(BigDecimal.ZERO);
        delta.setBestAsk(BigDecimal.ZERO);
        delta.setExecutionsLastHour(0L);
        return delta;
    }

    public static MarketDelta from(MarketKpis previous, MarketKpis current) {
        MarketKpis safePrevious = previous != null ? previous : MarketKpis.empty();
        MarketKpis safeCurrent = current != null ? current : MarketKpis.empty();

        MarketDelta delta = new MarketDelta();
        delta.setOpenContracts(safeCurrent.getOpenContracts() - safePrevious.getOpenContracts());
        delta.setMarketDepth(safeCurrent.getMarketDepth() - safePrevious.getMarketDepth());
        delta.setTotalVolume(safeCurrent.getTotalVolume().subtract(safePrevious.getTotalVolume()));
        delta.setAverageAsk(safeCurrent.getAverageAsk().subtract(safePrevious.getAverageAsk()));
        delta.setActiveSellers(safeCurrent.getActiveSellers() - safePrevious.getActiveSellers());
        delta.setSpread(safeCurrent.getSpread().subtract(safePrevious.getSpread()));
        delta.setBestAsk(safeCurrent.getBestAsk().subtract(safePrevious.getBestAsk()));
        delta.setExecutionsLastHour(safeCurrent.getExecutionsLastHour() - safePrevious.getExecutionsLastHour());
        return delta;
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
