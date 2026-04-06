package com.pso.backoffice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "parent_payment")
@Getter
@Setter
public class ParentPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "insert_timestamp")
    private OffsetDateTime insertTimestamp;

    @Column(name = "source")
    private String source;

    @Column(name = "payment_timestamp")
    private OffsetDateTime paymentTimestamp;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "description")
    private String description;
}
