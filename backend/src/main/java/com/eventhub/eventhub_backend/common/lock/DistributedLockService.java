package com.eventhub.eventhub_backend.common.lock;

import java.util.concurrent.Callable;

public interface DistributedLockService {

    /**
     * Thực thi một tác vụ có bảo vệ bởi Distributed Lock.
     *
     * @param lockKey  Khóa phân tán định danh tài nguyên (ví dụ: lock:ticket-type:{id})
     * @param waitTime Thời gian chờ nhận khóa tối đa (giây)
     * @param leaseTime Thời gian tự động giải phóng khóa (giây)
     * @param task     Hành động cần thực thi trong vùng tranh chấp
     * @param <T>      Kiểu dữ liệu trả về
     * @return Kết quả từ task
     */
    <T> T executeWithLock(String lockKey, long waitTime, long leaseTime, Callable<T> task);

    /**
     * Thực thi một tác vụ Runnable không có giá trị trả về.
     */
    void executeWithLock(String lockKey, long waitTime, long leaseTime, Runnable task);
}
