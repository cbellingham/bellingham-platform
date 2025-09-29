package com.bellingham.datafutures.service;

import com.bellingham.datafutures.dto.market.MarketSnapshot;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class MarketDataStreamService {

    public static final String MARKET_EVENT_NAME = "market-update";
    private static final long TIMEOUT = 0L;

    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((ex) -> emitters.remove(emitter));

        return emitter;
    }

    public void broadcast(MarketSnapshot snapshot) {
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                sendSnapshot(emitter, snapshot);
            } catch (IOException ex) {
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
        }
    }

    public void sendSnapshot(SseEmitter emitter, MarketSnapshot snapshot) throws IOException {
        emitter.send(SseEmitter.event()
                .name(MARKET_EVENT_NAME)
                .data(snapshot));
    }
}
