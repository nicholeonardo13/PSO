package com.pso.backoffice.repository;

import com.pso.backoffice.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {

    @Query(value = """
        SELECT * FROM course
        WHERE (:name IS NULL OR LOWER(name) LIKE LOWER(CONCAT('%', :name, '%')))
        ORDER BY name ASC
        """, nativeQuery = true)
    List<Course> findByNameContainingIgnoreCase(@Param("name") String name);
}
