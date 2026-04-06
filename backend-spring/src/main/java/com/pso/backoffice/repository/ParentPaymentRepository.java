package com.pso.backoffice.repository;

import com.pso.backoffice.entity.ParentPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ParentPaymentRepository extends JpaRepository<ParentPayment, UUID> {

    @Query(value = """
        SELECT pp.id, pp.parent_id, pp.insert_timestamp, pp.source,
               pp.payment_timestamp, pp.amount, pp.description,
               p.name AS parent_name
        FROM parent_payment pp
        LEFT JOIN parent p ON p.id = pp.parent_id
        WHERE (:parentId IS NULL OR pp.parent_id = CAST(:parentId AS uuid))
        ORDER BY pp.payment_timestamp DESC
        """, nativeQuery = true)
    List<Object[]> findAllWithParentName(@Param("parentId") String parentId);

    @Query(value = """
        SELECT COALESCE(SUM(amount), 0) FROM parent_payment WHERE parent_id = :parentId
        """, nativeQuery = true)
    BigDecimal sumAmountByParentId(@Param("parentId") UUID parentId);
}
