package com.eventhub.eventhub_backend.event.service.Impl;

import com.eventhub.eventhub_backend.event.dto.request.EventMatchRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventMatchResponse;
import com.eventhub.eventhub_backend.event.dto.response.ExtractedPreferencesDto;
import com.eventhub.eventhub_backend.event.dto.response.MatchedEventItemDto;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.event.service.EventMatchAiService;
import com.eventhub.eventhub_backend.event.service.EventMatchingService;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventMatchingServiceImpl implements EventMatchingService {

    private final EventRepository eventRepository;
    private final EventMatchAiService eventMatchAiService;

    @Override
    @Transactional(readOnly = true)
    public EventMatchResponse matchEvents(EventMatchRequest request) {
        String prompt = request != null ? request.getPrompt() : "";
        ExtractedPreferencesDto prefs = eventMatchAiService.parsePrompt(prompt);

        // Lấy tất cả sự kiện đã công bố (PUBLISHED)
        List<Event> publishedEvents = eventRepository.findAll().stream()
                .filter(e -> e.getStatus() == EventStatus.PUBLISHED)
                .collect(Collectors.toList());

        Instant now = Instant.now();
        List<MatchedEventItemDto> matchedList = new ArrayList<>();

        for (Event event : publishedEvents) {
            // Xác định minPrice và availableQuantity từ ticketTypes
            BigDecimal minPrice = BigDecimal.ZERO;
            int totalAvailable = 0;
            if (event.getTicketTypes() != null && !event.getTicketTypes().isEmpty()) {
                minPrice = event.getTicketTypes().stream()
                        .map(TicketType::getPrice)
                        .filter(Objects::nonNull)
                        .min(BigDecimal::compareTo)
                        .orElse(BigDecimal.ZERO);

                totalAvailable = event.getTicketTypes().stream()
                        .mapToInt(tt -> Math.max(0, (tt.getQuantity() != null ? tt.getQuantity() : 0) - (tt.getSoldQuantity() != null ? tt.getSoldQuantity() : 0)))
                        .sum();
            }

            // Trích xuất thành phố thực tế của sự kiện
            String eventCity = detectCity(event.getLocation());

            // Chấm điểm tương thích (Match Score 0-100)
            int score = 65; // Điểm nền tảng cho sự kiện active
            List<String> reasons = new ArrayList<>();

            // 1. Kiểm tra thành phố (Trọng số 20%)
            if (prefs.getCity() != null) {
                if (eventCity != null && eventCity.equalsIgnoreCase(prefs.getCity())) {
                    score += 15;
                    reasons.add("Diễn ra tại " + prefs.getCity());
                } else if (event.getLocation() != null && event.getLocation().toLowerCase().contains(prefs.getCity().toLowerCase())) {
                    score += 15;
                    reasons.add("Diễn ra tại " + prefs.getCity());
                } else {
                    score -= 10;
                }
            }

            // 2. Kiểm tra danh mục / chủ đề (Trọng số 20%)
            if (prefs.getCategory() != null) {
                String cat = event.getCategory() != null ? event.getCategory().toLowerCase() : "";
                String title = event.getTitle() != null ? event.getTitle().toLowerCase() : "";
                String desc = event.getDescription() != null ? event.getDescription().toLowerCase() : "";

                if (cat.contains(prefs.getCategory().toLowerCase()) ||
                    title.contains(prefs.getCategory().toLowerCase()) ||
                    desc.contains(prefs.getCategory().toLowerCase())) {
                    score += 15;
                    reasons.add("Đúng chủ đề " + prefs.getCategory());
                }
            }

            // 3. Kiểm tra ngân sách (Trọng số 15%)
            if (prefs.getMaxPrice() != null) {
                if (minPrice.compareTo(prefs.getMaxPrice()) <= 0) {
                    score += 10;
                    if (prefs.getMaxPrice().compareTo(BigDecimal.ZERO) == 0) {
                        reasons.add("Vé miễn phí theo đúng yêu cầu");
                    } else {
                        reasons.add("Giá vé từ " + minPrice.stripTrailingZeros().toPlainString() + "đ (trong ngân sách)");
                    }
                } else {
                    score -= 10;
                }
            }

            // 4. Kiểm tra thời gian (Trọng số 10%)
            if (event.getStartAt() != null) {
                if (event.getStartAt().isAfter(now)) {
                    score += 5;
                    if (event.getStartAt().isBefore(now.plus(7, ChronoUnit.DAYS))) {
                        score += 5;
                        reasons.add("Sắp diễn ra trong tuần này");
                    }
                }
            }

            // Giới hạn điểm số từ 40 đến 99
            int finalScore = Math.max(40, Math.min(score, 99));

            // Sinh lý do tổng hợp
            String combinedReason;
            if (reasons.isEmpty()) {
                combinedReason = "Sự kiện nổi bật đang mở bán vé được nhiều người quan tâm.";
            } else {
                combinedReason = "Phù hợp tiêu chí: " + String.join(", ", reasons) + ".";
            }

            List<String> tags = new ArrayList<>();
            if (event.getCategory() != null) tags.add(event.getCategory());
            if (eventCity != null) tags.add(eventCity);

            matchedList.add(MatchedEventItemDto.builder()
                    .id(event.getId())
                    .title(event.getTitle())
                    .description(event.getDescription())
                    .thumbnailUrl(event.getThumbnailUrl())
                    .category(event.getCategory())
                    .location(event.getLocation())
                    .city(eventCity)
                    .startAt(event.getStartAt())
                    .endAt(event.getEndAt())
                    .minPrice(minPrice)
                    .availableQuantity(totalAvailable)
                    .matchScore(finalScore)
                    .matchReason(combinedReason)
                    .tags(tags)
                    .build());
        }

        // Sắp xếp giảm dần theo điểm số matchScore
        matchedList.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));

        return EventMatchResponse.builder()
                .parsedPreferences(prefs)
                .matches(matchedList)
                .totalFound(matchedList.size())
                .build();
    }

    private String detectCity(String location) {
        if (location == null) return "TP.HCM";
        String lower = location.toLowerCase();
        if (lower.contains("hà nội") || lower.contains("hn")) return "Hà Nội";
        if (lower.contains("đà nẵng") || lower.contains("da nang")) return "Đà Nẵng";
        if (lower.contains("đà lạt") || lower.contains("da lat")) return "Đà Lạt";
        if (lower.contains("cần thơ") || lower.contains("can tho")) return "Cần Thơ";
        return "TP.HCM";
    }
}
