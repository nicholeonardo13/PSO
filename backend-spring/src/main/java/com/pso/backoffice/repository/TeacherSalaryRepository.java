package com.pso.backoffice.repository;

import com.pso.backoffice.entity.TeacherSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeacherSalaryRepository extends JpaRepository<TeacherSalary, UUID> {

    @Query(value = """
        SELECT ts.id, ts.insert_timestamp, ts.year, ts.month, ts.teacher_id, ts.amount,
               t.name AS teacher_name
        FROM teacher_salary ts
        LEFT JOIN teacher t ON t.id = ts.teacher_id
        WHERE (:teacherId IS NULL OR ts.teacher_id = CAST(:teacherId AS uuid))
          AND (:year IS NULL OR ts.year = :year)
          AND (:month IS NULL OR ts.month = :month)
        ORDER BY ts.year DESC, ts.month DESC, t.name ASC
        """, nativeQuery = true)
    List<Object[]> findAllWithFilters(@Param("teacherId") String teacherId,
                                      @Param("year") Integer year,
                                      @Param("month") Integer month);

    List<TeacherSalary> findByTeacherIdOrderByYearDescMonthDesc(UUID teacherId);

    @Modifying
    @Query(value = "DELETE FROM teacher_salary WHERE year = :year AND month = :month", nativeQuery = true)
    void deleteByYearAndMonth(@Param("year") int year, @Param("month") int month);
}
