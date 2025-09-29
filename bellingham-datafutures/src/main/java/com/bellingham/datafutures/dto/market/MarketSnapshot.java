package com.bellingham.datafutures.dto.market;

import com.bellingham.datafutures.model.ForwardContract;

import java.time.Instant;
import java.util.List;

public class MarketSnapshot {

    private List<ForwardContract> contracts;
    private MarketKpis kpis;
    private MarketDelta delta;
    private Instant generatedAt;

    public List<ForwardContract> getContracts() {
        return contracts;
    }

    public void setContracts(List<ForwardContract> contracts) {
        this.contracts = contracts;
    }

    public MarketKpis getKpis() {
        return kpis;
    }

    public void setKpis(MarketKpis kpis) {
        this.kpis = kpis;
    }

    public MarketDelta getDelta() {
        return delta;
    }

    public void setDelta(MarketDelta delta) {
        this.delta = delta;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }
}
