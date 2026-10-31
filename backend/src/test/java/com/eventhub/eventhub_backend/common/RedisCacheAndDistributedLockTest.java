package com.eventhub.eventhub_backend.common;

import com.eventhub.eventhub_backend.common.cache.RedisEventCacheService;
import com.eventhub.eventhub_backend.common.lock.RedisDistributedLockService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class RedisCacheAndDistributedLockTest {

    @Test
    @DisplayName("RedisEventCacheService: should cache, return on hit, and evict properly")
    void testCacheOperations() {
        RedisEventCacheService cacheService = new RedisEventCacheService();

        // 1. Initial get is null
        String initial = cacheService.get("events:public:1");
        assertThat(initial).isNull();

        // 2. Put and get
        cacheService.put("events:public:1", "Event Data 1", Duration.ofMinutes(5));
        String cachedValue = cacheService.get("events:public:1");
        assertThat(cachedValue).isEqualTo("Event Data 1");

        // 3. getOrCompute should not invoke supplier on cache hit
        AtomicInteger computations = new AtomicInteger(0);
        String result = cacheService.getOrCompute("events:public:1", Duration.ofMinutes(5), () -> {
            computations.incrementAndGet();
            return "New Computed Data";
        });
        assertThat(result).isEqualTo("Event Data 1");
        assertThat(computations.get()).isEqualTo(0);

        // 4. Evict by prefix
        cacheService.evictByPrefix("events:public");
        String afterEvict = cacheService.get("events:public:1");
        assertThat(afterEvict).isNull();
    }

    @Test
    @DisplayName("RedisDistributedLockService: should ensure mutual exclusion across concurrent threads")
    void testDistributedLockConcurrency() throws InterruptedException {
        RedisDistributedLockService lockService = new RedisDistributedLockService();
        int threadCount = 10;
        int incrementsPerThread = 50;
        AtomicInteger counter = new AtomicInteger(0);

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    for (int j = 0; j < incrementsPerThread; j++) {
                        lockService.executeWithLock("lock:inventory:ticket-type-1", 5, 2, (Runnable) () -> {
                            int current = counter.get();
                            try {
                                Thread.sleep(1); // simulate work
                            } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                            }
                            counter.set(current + 1);
                        });
                    }
                } catch (Exception ignored) {
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        assertThat(counter.get()).isEqualTo(threadCount * incrementsPerThread);
    }
}
