package com.pso.backoffice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "session")
@Getter
@Setter
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "course_id")
    private UUID courseId;

    @Column(name = "teacher_id")
    private UUID teacherId;

    @Column(name = "bill_year")
    private Integer billYear;

    @Column(name = "bill_month")
    private Integer billMonth;

    @Column(name = "session_start_timestamp")
    private OffsetDateTime sessionStartTimestamp;

    @Column(name = "duration_hour", precision = 5, scale = 2)
    private BigDecimal durationHour;

    @Column(name = "parent_amount", precision = 15, scale = 2)
    private BigDecimal parentAmount;

    @Column(name = "teacher_amount", precision = 15, scale = 2)
    private BigDecimal teacherAmount;

    @Column(name = "description")
    private String description;
}
