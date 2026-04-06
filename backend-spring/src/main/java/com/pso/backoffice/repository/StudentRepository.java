package com.pso.backoffice.repository;

import com.pso.backoffice.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {

    List<Student> findByParentIdOrderByNameAsc(UUID parentId);

    @Query("SELECT s FROM Student s ORDER BY s.name ASC")
    List<Student> findAllOrderByName();

    @Query(value = """
        SELECT s.id, s.name, s.phone_number, s.email_address, s.parent_id, p.name AS parent_name
        FROM student s
        LEFT JOIN parent p ON p.id = s.parent_id
        ORDER BY s.name ASC
        """, nativeQuery = true)
    List<Object[]> findAllWithParentName();

    @Query("SELECT COUNT(s) FROM Student s")
    long countAll();
}
