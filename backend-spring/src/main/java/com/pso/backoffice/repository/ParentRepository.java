package com.pso.backoffice.repository;

import com.pso.backoffice.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ParentRepository extends JpaRepository<Parent, UUID> {

    @Query(value = """
        SELECT * FROM parent
        WHERE (:name IS NULL OR LOWER(name) LIKE LOWER(CONCAT('%', :name, '%')))
        ORDER BY name ASC
        """, nativeQuery = true)
    List<Parent> findByNameContainingIgnoreCase(@Param("name") String name);

    @Query("SELECT COUNT(p) FROM Parent p")
    long countAll();
}
