package com.eventhub.eventhub_backend.common.lock;

import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Service
public class RedisDistributedLockService implements DistributedLockService {

    // Bộ quản lý lock phân tán dự phòng in-memory kết hợp sẵn sàng cho Redis/Redisson
    private final ConcurrentHashMap<String, ReentrantLock> lockMap = new ConcurrentHashMap<>();

    @Override
    public <T> T executeWithLock(String lockKey, long waitTime, long leaseTime, Callable<T> task) {
        ReentrantLock lock = lockMap.computeIfAbsent(lockKey, k -> new ReentrantLock(true));
        boolean acquired = false;
        try {
            log.debug("Acquiring distributed lock for key: '{}', waitTime: {}s", lockKey, waitTime);
            acquired = lock.tryLock(waitTime, TimeUnit.SECONDS);
            if (!acquired) {
                log.warn("Failed to acquire lock for key '{}' within {} seconds", lockKey, waitTime);
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            log.debug("Lock acquired successfully for key: '{}'", lockKey);
            return task.call();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Interrupted while waiting for lock '{}'", lockKey, e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error executing task under lock '{}'", lockKey, e);
            throw new RuntimeException(e);
        } finally {
            if (acquired) {
                lock.unlock();
                log.debug("Released lock for key: '{}'", lockKey);
                if (!lock.hasQueuedThreads()) {
                    lockMap.remove(lockKey, lock);
                }
            }
        }
    }

    @Override
    public void executeWithLock(String lockKey, long waitTime, long leaseTime, Runnable task) {
        executeWithLock(lockKey, waitTime, leaseTime, () -> {
            task.run();
            return null;
        });
    }
}
