package com.eventhub.eventhub_backend.waitlist.exception;

import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;

/** Chỉ nhánh hết hạn được commit trạng thái trước khi trả lỗi cho caller. */
public class WaitlistOfferExpiredException extends AppException {
    public WaitlistOfferExpiredException() {
        super(ErrorCode.INVALID_REQUEST);
    }
}
