package com.eventhub.eventhub_backend.common.cache;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Slf4j
@Service
public class RedisEventCacheService {

    private static class CacheEntry<T> {
        final T value;
        final Instant expiry;

        CacheEntry(T value, Duration ttl) {
            this.value = value;
            this.expiry = Instant.now().plus(ttl);
        }

        boolean isExpired() {
            return Instant.now().isAfter(expiry);
        }
    }

    private final Map<String, CacheEntry<?>> cacheMap = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        CacheEntry<?> entry = cacheMap.get(key);
        if (entry == null) {
            log.debug("Cache MISS for key: {}", key);
            return null;
        }
        if (entry.isExpired()) {
            log.debug("Cache EXPIRED for key: {}", key);
            cacheMap.remove(key);
            return null;
        }
        log.debug("Cache HIT for key: {}", key);
        return (T) entry.value;
    }

    public <T> void put(String key, T value, Duration ttl) {
        log.debug("Cache PUT for key: {}, ttl: {}s", key, ttl.toSeconds());
        cacheMap.put(key, new CacheEntry<>(value, ttl));
    }

    public <T> T getOrCompute(String key, Duration ttl, Supplier<T> supplier) {
        T cached = get(key);
        if (cached != null) {
            return cached;
        }
        T computed = supplier.get();
        if (computed != null) {
            put(key, computed, ttl);
        }
        return computed;
    }

    public void evict(String key) {
        log.debug("Cache EVICT for key: {}", key);
        cacheMap.remove(key);
    }

    public void evictByPrefix(String prefix) {
        log.debug("Cache EVICT prefix: {}", prefix);
        cacheMap.keySet().removeIf(k -> k.startsWith(prefix));
    }

    public void clear() {
        log.debug("Cache CLEAR all entries");
        cacheMap.clear();
    }
}
