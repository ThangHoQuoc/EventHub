package com.eventhub.eventhub_backend.event;

import com.eventhub.eventhub_backend.event.dto.request.EventMatchRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventMatchResponse;
import com.eventhub.eventhub_backend.event.dto.response.ExtractedPreferencesDto;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.event.service.EventMatchAiService;
import com.eventhub.eventhub_backend.event.service.Impl.EventMatchAiServiceImpl;
import com.eventhub.eventhub_backend.event.service.Impl.EventMatchingServiceImpl;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventMatchingServiceTest {

    @Mock
    private EventRepository eventRepository;

    private EventMatchAiService eventMatchAiService;
    private EventMatchingServiceImpl eventMatchingService;

    @BeforeEach
    void setUp() {
        eventMatchAiService = new EventMatchAiServiceImpl();
        eventMatchingService = new EventMatchingServiceImpl(eventRepository, eventMatchAiService);
    }

    @Test
    @DisplayName("parsePrompt should correctly extract city, category, and budget")
    void testParsePrompt() {
        String prompt = "Tìm concert âm nhạc ở Hà Nội cuối tuần này dưới 500k";
        ExtractedPreferencesDto prefs = eventMatchAiService.parsePrompt(prompt);

        assertThat(prefs.getCity()).isEqualTo("Hà Nội");
        assertThat(prefs.getCategory()).isEqualTo("Âm nhạc / Concert");
        assertThat(prefs.getMaxPrice()).isEqualByComparingTo(new BigDecimal("500000"));
        assertThat(prefs.getTimeRange()).isEqualTo("Cuối tuần này");
    }

    @Test
    @DisplayName("matchEvents should rank matching events higher")
    void testMatchEvents() {
        TicketType tt1 = TicketType.builder()
                .price(new BigDecimal("200000"))
                .quantity(100)
                .soldQuantity(20)
                .build();

        Event event1 = Event.builder()
                .title("Hà Nội Indie Music Night")
                .description("Đêm nhạc acoustic tuyệt vời cho giới trẻ")
                .category("Âm nhạc / Concert")
                .location("Trung tâm Hội nghị Quốc gia, Hà Nội")
                .status(EventStatus.PUBLISHED)
                .startAt(Instant.now().plus(2, ChronoUnit.DAYS))
                .endAt(Instant.now().plus(2, ChronoUnit.DAYS).plus(4, ChronoUnit.HOURS))
                .ticketTypes(List.of(tt1))
                .build();
        event1.setId("event-1");

        TicketType tt2 = TicketType.builder()
                .price(new BigDecimal("1500000"))
                .quantity(50)
                .soldQuantity(10)
                .build();

        Event event2 = Event.builder()
                .title("Workshop UI/UX Đà Nẵng")
                .description("Khóa học thiết kế sản phẩm số")
                .category("Thiết kế & Nghệ thuật")
                .location("Hải Châu, Đà Nẵng")
                .status(EventStatus.PUBLISHED)
                .startAt(Instant.now().plus(10, ChronoUnit.DAYS))
                .endAt(Instant.now().plus(10, ChronoUnit.DAYS).plus(3, ChronoUnit.HOURS))
                .ticketTypes(List.of(tt2))
                .build();
        event2.setId("event-2");

        when(eventRepository.findAll()).thenReturn(List.of(event1, event2));

        EventMatchRequest request = EventMatchRequest.builder()
                .prompt("Tìm show nhạc tại Hà Nội giá rẻ dưới 300k")
                .build();

        EventMatchResponse response = eventMatchingService.matchEvents(request);

        assertThat(response).isNotNull();
        assertThat(response.getTotalFound()).isEqualTo(2);
        assertThat(response.getMatches()).isNotEmpty();
        // Event 1 matches city, category, and budget -> should be ranked #1 with high score
        assertThat(response.getMatches().get(0).getId()).isEqualTo("event-1");
        assertThat(response.getMatches().get(0).getMatchScore()).isGreaterThan(response.getMatches().get(1).getMatchScore());
        assertThat(response.getMatches().get(0).getMatchReason()).contains("Hà Nội");
    }
}
