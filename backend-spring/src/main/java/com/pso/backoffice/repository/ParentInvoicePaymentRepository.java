package com.pso.backoffice.repository;

import com.pso.backoffice.entity.ParentInvoicePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ParentInvoicePaymentRepository extends JpaRepository<ParentInvoicePayment, UUID> {

    List<ParentInvoicePayment> findByInvoiceIdOrderByPaymentTimestampAsc(UUID invoiceId);

    @Query(value = """
        SELECT COALESCE(SUM(amount), 0) FROM parent_invoice_payment WHERE invoice_id = :invoiceId
        """, nativeQuery = true)
    BigDecimal sumAmountByInvoiceId(@Param("invoiceId") UUID invoiceId);
}
