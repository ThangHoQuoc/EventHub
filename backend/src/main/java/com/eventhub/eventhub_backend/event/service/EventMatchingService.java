package com.eventhub.eventhub_backend.event.service;

import com.eventhub.eventhub_backend.event.dto.request.EventMatchRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventMatchResponse;

public interface EventMatchingService {

    /**
     * Tìm kiếm và xếp hạng các sự kiện phù hợp nhất dựa trên prompt ngôn ngữ tự nhiên.
     *
     * @param request Prompt tìm kiếm tự nhiên của người dùng.
     * @return Kết quả các sự kiện được đề xuất kèm điểm Match Score và lý do gợi ý.
     */
    EventMatchResponse matchEvents(EventMatchRequest request);
}
