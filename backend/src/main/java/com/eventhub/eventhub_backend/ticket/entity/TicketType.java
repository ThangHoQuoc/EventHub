package com.eventhub.eventhub_backend.ticket.entity;


import com.eventhub.eventhub_backend.common.entity.BaseEntity;
import com.eventhub.eventhub_backend.event.entity.Event;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "ticket_types")
public class TicketType extends BaseEntity {

    String name;
    String description;
    BigDecimal price;
    Integer quantity;
    Integer soldQuantity;

    @ManyToOne
    @JoinColumn(name = "event_id")
    Event event;

}
