package com.pso.backoffice.repository;

import com.pso.backoffice.entity.SessionRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionRateRepository extends JpaRepository<SessionRate, UUID> {

    @Query(value = """
        SELECT sr.id, sr.course_id, sr.teacher_id, sr.student_id,
               sr.teacher_amount_per_hour, sr.parent_amount_per_hour,
               sr.created_at, sr.updated_at,
               c.name AS course_name, t.name AS teacher_name, s.name AS student_name
        FROM session_rate sr
        LEFT JOIN course c ON c.id = sr.course_id
        LEFT JOIN teacher t ON t.id = sr.teacher_id
        LEFT JOIN student s ON s.id = sr.student_id
        ORDER BY c.name ASC, t.name ASC
        """, nativeQuery = true)
    List<Object[]> findAllWithNames();

    @Query(value = """
        SELECT sr.id, sr.course_id, sr.teacher_id, sr.student_id,
               sr.teacher_amount_per_hour, sr.parent_amount_per_hour,
               sr.created_at, sr.updated_at,
               c.name AS course_name, t.name AS teacher_name, s.name AS student_name
        FROM session_rate sr
        LEFT JOIN course c ON c.id = sr.course_id
        LEFT JOIN teacher t ON t.id = sr.teacher_id
        LEFT JOIN student s ON s.id = sr.student_id
        WHERE (:teacherId IS NULL OR sr.teacher_id = CAST(:teacherId AS uuid))
          AND (:studentId IS NULL OR sr.student_id = CAST(:studentId AS uuid))
          AND (:courseId IS NULL OR sr.course_id = CAST(:courseId AS uuid))
        LIMIT 1
        """, nativeQuery = true)
    Optional<Object[]> findByLookup(@Param("teacherId") String teacherId,
                                    @Param("studentId") String studentId,
                                    @Param("courseId") String courseId);
}
