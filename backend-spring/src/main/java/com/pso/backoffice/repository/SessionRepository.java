package com.pso.backoffice.repository;

import com.pso.backoffice.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    @Query(value = """
        SELECT s.id, s.invoice_id, s.student_id, s.course_id, s.teacher_id,
               s.bill_year, s.bill_month, s.session_start_timestamp, s.duration_hour,
               s.parent_amount, s.teacher_amount, s.description,
               st.name AS student_name, c.name AS course_name, t.name AS teacher_name,
               p.id AS parent_id, p.name AS parent_name
        FROM session s
        LEFT JOIN student st ON st.id = s.student_id
        LEFT JOIN course c ON c.id = s.course_id
        LEFT JOIN teacher t ON t.id = s.teacher_id
        LEFT JOIN parent p ON p.id = st.parent_id
        WHERE (:parentId IS NULL OR p.id = CAST(:parentId AS uuid))
          AND (:teacherId IS NULL OR s.teacher_id = CAST(:teacherId AS uuid))
          AND (:year IS NULL OR s.bill_year = :year)
          AND (:month IS NULL OR s.bill_month = :month)
        ORDER BY s.session_start_timestamp DESC
        """, nativeQuery = true)
    List<Object[]> findAllWithFilters(@Param("parentId") String parentId,
                                      @Param("teacherId") String teacherId,
                                      @Param("year") Integer year,
                                      @Param("month") Integer month);

    @Query(value = """
        SELECT s.id, s.invoice_id, s.student_id, s.course_id, s.teacher_id,
               s.bill_year, s.bill_month, s.session_start_timestamp, s.duration_hour,
               s.parent_amount, s.teacher_amount, s.description,
               st.name AS student_name, c.name AS course_name, t.name AS teacher_name
        FROM session s
        LEFT JOIN student st ON st.id = s.student_id
        LEFT JOIN course c ON c.id = s.course_id
        LEFT JOIN teacher t ON t.id = s.teacher_id
        WHERE s.invoice_id = :invoiceId
        ORDER BY st.name ASC, c.name ASC, s.session_start_timestamp ASC
        """, nativeQuery = true)
    List<Object[]> findByInvoiceIdWithNames(@Param("invoiceId") UUID invoiceId);

    @Query(value = """
        SELECT s.teacher_id, t.name AS teacher_name,
               SUM(s.teacher_amount) AS total_teacher_amount,
               SUM(s.duration_hour) AS total_hours,
               COUNT(s.id) AS session_count
        FROM session s
        LEFT JOIN teacher t ON t.id = s.teacher_id
        WHERE s.bill_year = :year AND s.bill_month = :month
        GROUP BY s.teacher_id, t.name
        ORDER BY t.name ASC
        """, nativeQuery = true)
    List<Object[]> getSalaryPreview(@Param("year") int year, @Param("month") int month);

    @Query(value = """
        SELECT COUNT(s.id) FROM session s
        WHERE s.bill_year = :year AND s.bill_month = :month
        """, nativeQuery = true)
    long countByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Query(value = """
        SELECT COALESCE(SUM(s.parent_amount), 0)
        FROM session s
        WHERE s.invoice_id = :invoiceId
        """, nativeQuery = true)
    BigDecimal sumParentAmountByInvoiceId(@Param("invoiceId") UUID invoiceId);
}
