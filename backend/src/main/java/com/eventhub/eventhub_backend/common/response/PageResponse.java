package com.eventhub.eventhub_backend.common.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageResponse<T> {

    List<T> content;

    int page;

    int size;

    long totalElements;

    int totalPages;

    boolean first;

    boolean last;
}