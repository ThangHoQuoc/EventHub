package com.eventhub.eventhub_backend.waitlist.service;

import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.waitlist.dto.request.JoinWaitlistRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistEntryResponse;
import org.springframework.data.domain.Pageable;

public interface WaitlistService {

    WaitlistEntryResponse joinWaitlist(String ticketTypeId, JoinWaitlistRequest request);

    PageResponse<WaitlistEntryResponse> getMyWaitlist(Pageable pageable);
}
