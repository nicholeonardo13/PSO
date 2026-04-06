package com.pso.backoffice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "session_rate")
@Getter
@Setter
public class SessionRate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "course_id")
    private UUID courseId;

    @Column(name = "teacher_id")
    private UUID teacherId;

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "teacher_amount_per_hour", precision = 15, scale = 2)
    private BigDecimal teacherAmountPerHour;

    @Column(name = "parent_amount_per_hour", precision = 15, scale = 2)
    private BigDecimal parentAmountPerHour;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
