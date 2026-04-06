package com.pso.backoffice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "parent_invoice_payment")
@Getter
@Setter
public class ParentInvoicePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "year")
    private Integer year;

    @Column(name = "month")
    private Integer month;

    @Column(name = "payment_timestamp")
    private OffsetDateTime paymentTimestamp;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;
}
