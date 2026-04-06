package com.pso.backoffice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "teacher_salary")
@Getter
@Setter
public class TeacherSalary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "insert_timestamp")
    private OffsetDateTime insertTimestamp;

    @Column(name = "year")
    private Integer year;

    @Column(name = "month")
    private Integer month;

    @Column(name = "teacher_id")
    private UUID teacherId;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

}
