package com.eventhub.eventhub_backend.event.service.Impl;

import com.eventhub.eventhub_backend.event.dto.response.ExtractedPreferencesDto;
import com.eventhub.eventhub_backend.event.service.EventMatchAiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class EventMatchAiServiceImpl implements EventMatchAiService {

    @Value("${eventhub.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${eventhub.ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Override
    public ExtractedPreferencesDto parsePrompt(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return ExtractedPreferencesDto.builder()
                    .rawPrompt("")
                    .build();
        }

        log.info("Parsing natural language prompt for EventMatch: '{}'", prompt);

        // Heuristic Semantic Natural Language Parsing Engine
        String lower = prompt.toLowerCase(Locale.ROOT).trim();

        // 1. Phân tích Thành phố / Địa điểm
        String city = null;
        if (lower.contains("hà nội") || lower.contains("ha noi") || lower.contains("hn")) {
            city = "Hà Nội";
        } else if (lower.contains("đà nẵng") || lower.contains("da nang") || lower.contains("dn")) {
            city = "Đà Nẵng";
        } else if (lower.contains("sài gòn") || lower.contains("sai gon") || lower.contains("hồ chí minh") || lower.contains("tp.hcm") || lower.contains("tphcm") || lower.contains("hcm")) {
            city = "TP.HCM";
        } else if (lower.contains("đà lạt") || lower.contains("da lat")) {
            city = "Đà Lạt";
        } else if (lower.contains("cần thơ") || lower.contains("can tho")) {
            city = "Cần Thơ";
        }

        // 2. Phân tích Thể loại / Chủ đề
        String category = null;
        if (lower.contains("nhạc") || lower.contains("music") || lower.contains("concert") || lower.contains("âm nhạc") || lower.contains("ca nhạc") || lower.contains("indie")) {
            category = "Âm nhạc / Concert";
        } else if (lower.contains("công nghệ") || lower.contains("tech") || lower.contains("ai") || lower.contains("lập trình") || lower.contains("code") || lower.contains("software")) {
            category = "Công nghệ";
        } else if (lower.contains("workshop") || lower.contains("kỹ năng") || lower.contains("khóa học") || lower.contains("lớp học")) {
            category = "Workshop";
        } else if (lower.contains("thiết kế") || lower.contains("design") || lower.contains("ui/ux") || lower.contains("ux") || lower.contains("art") || lower.contains("nghệ thuật")) {
            category = "Thiết kế & Nghệ thuật";
        } else if (lower.contains("kinh doanh") || lower.contains("startup") || lower.contains("networking") || lower.contains("khởi nghiệp") || lower.contains("đầu tư")) {
            category = "Kinh doanh";
        } else if (lower.contains("thể thao") || lower.contains("sport") || lower.contains("chạy bộ") || lower.contains("marathon") || lower.contains("bóng đá")) {
            category = "Thể thao";
        }

        // 3. Phân tích Ngân sách tối đa (maxPrice)
        BigDecimal maxPrice = null;
        if (lower.contains("miễn phí") || lower.contains("free") || lower.contains("0đ") || lower.contains("0 đồng")) {
            maxPrice = BigDecimal.ZERO;
        } else {
            // Check các mẫu số: dưới 300k, < 500k, 200.000, 1tr, 1 triệu
            Pattern kPattern = Pattern.compile("(\\d+)\\s*(k|nghìn|ngàn)");
            Matcher kMatcher = kPattern.matcher(lower);
            if (kMatcher.find()) {
                long val = Long.parseLong(kMatcher.group(1));
                maxPrice = BigDecimal.valueOf(val * 1000);
            } else {
                Pattern trPattern = Pattern.compile("(\\d+)\\s*(tr|triệu|m)");
                Matcher trMatcher = trPattern.matcher(lower);
                if (trMatcher.find()) {
                    long val = Long.parseLong(trMatcher.group(1));
                    maxPrice = BigDecimal.valueOf(val * 1000000);
                } else {
                    Pattern numPattern = Pattern.compile("(\\d{1,3}(?:[.,]\\d{3})+)\\s*(?:đ|vnd|đồng)?");
                    Matcher numMatcher = numPattern.matcher(lower);
                    if (numMatcher.find()) {
                        String numStr = numMatcher.group(1).replaceAll("[.,]", "");
                        maxPrice = new BigDecimal(numStr);
                    }
                }
            }
        }

        // 4. Phân tích Khung thời gian (timeRange)
        String timeRange = "Bất kỳ lúc nào";
        if (lower.contains("cuối tuần") || lower.contains("weekend") || lower.contains("thứ 7") || lower.contains("chủ nhật")) {
            timeRange = "Cuối tuần này";
        } else if (lower.contains("tối nay") || lower.contains("hôm nay") || lower.contains("tonight") || lower.contains("today")) {
            timeRange = "Hôm nay / Tối nay";
        } else if (lower.contains("tuần này") || lower.contains("tuần tới") || lower.contains("tuần sau")) {
            timeRange = "Trong 7 ngày tới";
        } else if (lower.contains("tháng này") || lower.contains("tháng tới")) {
            timeRange = "Trong tháng này";
        }

        return ExtractedPreferencesDto.builder()
                .city(city)
                .category(category)
                .maxPrice(maxPrice)
                .timeRange(timeRange)
                .rawPrompt(prompt)
                .build();
    }
}
