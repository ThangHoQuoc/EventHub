package com.eventhub.eventhub_backend.event.service;

import com.eventhub.eventhub_backend.event.dto.response.ExtractedPreferencesDto;

public interface EventMatchAiService {

    /**
     * Phân tích câu truy vấn tự nhiên của người dùng thành các tiêu chí có cấu trúc.
     * Sử dụng LLM hoặc semantic heuristic parser fallback an toàn.
     *
     * @param prompt Câu truy vấn văn bản tự nhiên của người dùng.
     * @return Các tiêu chí lọc trích xuất được.
     */
    ExtractedPreferencesDto parsePrompt(String prompt);
}
