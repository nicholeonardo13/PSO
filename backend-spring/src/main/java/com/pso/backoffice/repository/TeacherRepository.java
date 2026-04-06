package com.pso.backoffice.repository;

import com.pso.backoffice.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID> {

    @Query(value = """
        SELECT * FROM teacher
        WHERE (:name IS NULL OR LOWER(name) LIKE LOWER(CONCAT('%', :name, '%')))
        ORDER BY name ASC
        """, nativeQuery = true)
    List<Teacher> findByNameContainingIgnoreCase(@Param("name") String name);

    @Query("SELECT COUNT(t) FROM Teacher t")
    long countAll();
}
