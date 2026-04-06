package com.pso.backoffice.service;

import com.pso.backoffice.entity.Parent;
import com.pso.backoffice.entity.ParentInvoice;
import com.pso.backoffice.entity.ParentInvoicePayment;
import com.pso.backoffice.entity.ParentPayment;
import com.pso.backoffice.repository.ParentInvoicePaymentRepository;
import com.pso.backoffice.repository.ParentPaymentRepository;
import com.pso.backoffice.repository.ParentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final ParentPaymentRepository parentPaymentRepository;
    private final ParentInvoicePaymentRepository parentInvoicePaymentRepository;
    private final ParentRepository parentRepository;
    private final BillingService billingService;

    public List<Map<String, Object>> listPayments(String parentId) {
        List<Object[]> rows = parentPaymentRepository.findAllWithParentName(parentId);
        return rows.stream().map(this::mapPaymentRow).toList();
    }

    @Transactional
    public Map<String, Object> createPayment(Map<String, Object> body) {
        UUID parentId = UUID.fromString((String) body.get("parent_id"));
        BigDecimal amount = parseBigDecimal(body.get("amount"));
        String source = body.containsKey("source") ? (String) body.get("source") : null;
        String description = body.containsKey("description") ? (String) body.get("description") : null;

        // Parse payment_timestamp (default to now if not provided)
        OffsetDateTime paymentTimestamp;
        if (body.get("payment_timestamp") != null) {
            paymentTimestamp = OffsetDateTime.parse((String) body.get("payment_timestamp"));
        } else {
            paymentTimestamp = OffsetDateTime.now();
        }

        // Validate parent exists
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        // 1. Insert parent_payment record
        ParentPayment payment = new ParentPayment();
        payment.setParentId(parentId);
        payment.setInsertTimestamp(OffsetDateTime.now());
        payment.setSource(source);
        payment.setPaymentTimestamp(paymentTimestamp);
        payment.setAmount(amount);
        payment.setDescription(description);
        payment = parentPaymentRepository.save(payment);

        // 2. Update parent balance
        BigDecimal newBalance = (parent.getBalanceAmount() != null ? parent.getBalanceAmount() : BigDecimal.ZERO)
                .add(amount);
        parent.setBalanceAmount(newBalance);
        parentRepository.save(parent);

        // 3. Determine invoice month based on payment_timestamp
        int payYear = paymentTimestamp.getYear();
        int payMonth = paymentTimestamp.getMonthValue();

        // 4. Get or create invoice for that month
        ParentInvoice invoice = billingService.getOrCreateInvoice(parentId, payYear, payMonth);

        // 5. Insert parent_invoice_payment
        ParentInvoicePayment invoicePayment = new ParentInvoicePayment();
        invoicePayment.setInvoiceId(invoice.getId());
        invoicePayment.setYear(payYear);
        invoicePayment.setMonth(payMonth);
        invoicePayment.setPaymentTimestamp(paymentTimestamp);
        invoicePayment.setAmount(amount);
        parentInvoicePaymentRepository.save(invoicePayment);

        // 6. Recalculate invoice balance
        billingService.recalculateInvoiceBalance(invoice.getId());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", payment.getId());
        result.put("parent_id", payment.getParentId());
        result.put("insert_timestamp", payment.getInsertTimestamp());
        result.put("source", payment.getSource());
        result.put("payment_timestamp", payment.getPaymentTimestamp());
        result.put("amount", payment.getAmount());
        result.put("description", payment.getDescription());

        return result;
    }

    private Map<String, Object> mapPaymentRow(Object[] row) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", row[0]);
        m.put("parent_id", row[1]);
        m.put("insert_timestamp", row[2]);
        m.put("source", row[3]);
        m.put("payment_timestamp", row[4]);
        m.put("amount", row[5] != null ? new BigDecimal(row[5].toString()) : null);
        m.put("description", row[6]);
        m.put("parent_name", row[7]);
        return m;
    }

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return new BigDecimal(n.toString());
        return new BigDecimal(value.toString());
    }
}
