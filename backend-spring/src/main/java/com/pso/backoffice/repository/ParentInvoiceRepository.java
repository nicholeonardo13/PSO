package com.pso.backoffice.repository;

import com.pso.backoffice.entity.ParentInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParentInvoiceRepository extends JpaRepository<ParentInvoice, UUID> {

    Optional<ParentInvoice> findByParentIdAndYearAndMonth(UUID parentId, Integer year, Integer month);

    List<ParentInvoice> findByParentIdOrderByYearDescMonthDesc(UUID parentId);

    @Query(value = """
        SELECT pi.id, pi.parent_id, pi.year, pi.month, pi.current_balance_amount,
               pi.created_at, pi.updated_at, p.name AS parent_name
        FROM parent_invoice pi
        JOIN parent p ON p.id = pi.parent_id
        ORDER BY pi.year DESC, pi.month DESC
        """, nativeQuery = true)
    List<Object[]> findAllWithParentName();

    @Query(value = """
        SELECT pi.id, pi.parent_id, pi.year, pi.month, pi.current_balance_amount,
               pi.created_at, pi.updated_at, p.name AS parent_name
        FROM parent_invoice pi
        JOIN parent p ON p.id = pi.parent_id
        WHERE pi.year = :year AND pi.month = :month AND pi.current_balance_amount < 0
        ORDER BY pi.current_balance_amount ASC
        """, nativeQuery = true)
    List<Object[]> findOutstandingInvoices(@Param("year") int year, @Param("month") int month);

    @Modifying
    @Query(value = """
        UPDATE parent_invoice SET current_balance_amount =
            COALESCE((SELECT SUM(amount) FROM parent_invoice_payment WHERE invoice_id = :invoiceId), 0) -
            COALESCE((SELECT SUM(parent_amount) FROM session WHERE invoice_id = :invoiceId), 0),
            updated_at = NOW()
        WHERE id = :invoiceId
        """, nativeQuery = true)
    void recalculateBalance(@Param("invoiceId") UUID invoiceId);

    @Query(value = """
        SELECT pi.id, pi.parent_id, pi.year, pi.month, pi.current_balance_amount,
               pi.created_at, pi.updated_at
        FROM parent_invoice pi
        WHERE pi.parent_id = :parentId
        ORDER BY pi.year ASC, pi.month ASC
        """, nativeQuery = true)
    List<Object[]> findByParentIdOrderedAsc(@Param("parentId") UUID parentId);
}
