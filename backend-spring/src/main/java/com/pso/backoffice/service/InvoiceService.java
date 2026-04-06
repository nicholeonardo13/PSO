package com.pso.backoffice.service;

import com.pso.backoffice.entity.Parent;
import com.pso.backoffice.entity.ParentInvoice;
import com.pso.backoffice.entity.ParentInvoicePayment;
import com.pso.backoffice.repository.ParentInvoicePaymentRepository;
import com.pso.backoffice.repository.ParentInvoiceRepository;
import com.pso.backoffice.repository.ParentRepository;
import com.pso.backoffice.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final ParentInvoiceRepository parentInvoiceRepository;
    private final ParentRepository parentRepository;
    private final SessionRepository sessionRepository;
    private final ParentInvoicePaymentRepository parentInvoicePaymentRepository;
    private final BillingService billingService;
    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> listInvoices() {
        List<Object[]> rows = parentInvoiceRepository.findAllWithParentName();
        return rows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", row[0]);
            m.put("parent_id", row[1]);
            m.put("year", row[2]);
            m.put("month", row[3]);
            m.put("current_balance_amount", row[4] != null ? new BigDecimal(row[4].toString()) : BigDecimal.ZERO);
            m.put("created_at", row[5]);
            m.put("updated_at", row[6]);
            m.put("parent_name", row[7]);
            int year = row[2] != null ? ((Number) row[2]).intValue() : 0;
            int month = row[3] != null ? ((Number) row[3]).intValue() : 0;
            m.put("is_locked", billingService.isInvoiceLocked(year, month));
            return m;
        }).toList();
    }

    public Map<String, Object> getMonthlyInvoice(UUID parentId, int year, int month) {
        // Validate parent exists
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        boolean locked = billingService.isInvoiceLocked(year, month);

        // Try to find invoice
        Optional<ParentInvoice> invoiceOpt = parentInvoiceRepository
                .findByParentIdAndYearAndMonth(parentId, year, month);

        if (invoiceOpt.isEmpty()) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("parent", mapParent(parent));
            result.put("invoice", null);
            result.put("sessions", Collections.emptyList());
            result.put("payments", Collections.emptyList());
            result.put("locked", locked);
            result.put("summary", Map.of(
                    "opening_balance", BigDecimal.ZERO,
                    "total_sessions", BigDecimal.ZERO,
                    "total_payments", BigDecimal.ZERO,
                    "closing_balance", BigDecimal.ZERO
            ));
            return result;
        }

        ParentInvoice invoice = invoiceOpt.get();

        // Get sessions with joins
        List<Object[]> sessionRows = sessionRepository.findByInvoiceIdWithNames(invoice.getId());

        List<Map<String, Object>> sessions = sessionRows.stream().map(row -> {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("id", row[0]);
            s.put("session_start_timestamp", row[7]);
            s.put("duration_hour", row[8] != null ? new BigDecimal(row[8].toString()) : null);
            s.put("parent_amount", row[9] != null ? new BigDecimal(row[9].toString()) : BigDecimal.ZERO);
            s.put("teacher_amount", row[10] != null ? new BigDecimal(row[10].toString()) : null);
            s.put("description", row[11]);
            s.put("student_id", row[2]);
            s.put("student_name", row[12]);
            s.put("teacher_id", row[4]);
            s.put("teacher_name", row[14]);
            s.put("course_id", row[3]);
            s.put("course_name", row[13]);
            return s;
        }).toList();

        // Get payments for this invoice
        List<ParentInvoicePayment> paymentEntities = parentInvoicePaymentRepository
                .findByInvoiceIdOrderByPaymentTimestampAsc(invoice.getId());

        List<Map<String, Object>> payments = paymentEntities.stream().map(p -> {
            Map<String, Object> pm = new LinkedHashMap<>();
            pm.put("id", p.getId());
            pm.put("invoice_id", p.getInvoiceId());
            pm.put("year", p.getYear());
            pm.put("month", p.getMonth());
            pm.put("payment_timestamp", p.getPaymentTimestamp());
            pm.put("amount", p.getAmount());
            return pm;
        }).toList();

        // Opening balance: most recent previous invoice balance
        BigDecimal openingBalance = getPreviousMonthBalance(parentId, year, month);

        BigDecimal totalSessions = sessions.stream()
                .map(s -> s.get("parent_amount") != null ? (BigDecimal) s.get("parent_amount") : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPayments = paymentEntities.stream()
                .map(p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal closingBalance = openingBalance.add(totalPayments).subtract(totalSessions);

        Map<String, Object> invoiceMap = new LinkedHashMap<>();
        invoiceMap.put("id", invoice.getId());
        invoiceMap.put("parent_id", invoice.getParentId());
        invoiceMap.put("year", invoice.getYear());
        invoiceMap.put("month", invoice.getMonth());
        invoiceMap.put("current_balance_amount", invoice.getCurrentBalanceAmount());
        invoiceMap.put("created_at", invoice.getCreatedAt());
        invoiceMap.put("updated_at", invoice.getUpdatedAt());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("parent", mapParent(parent));
        result.put("invoice", invoiceMap);
        result.put("sessions", sessions);
        result.put("payments", payments);
        result.put("locked", locked);
        result.put("summary", Map.of(
                "opening_balance", openingBalance,
                "total_sessions", totalSessions,
                "total_payments", totalPayments,
                "closing_balance", closingBalance
        ));

        return result;
    }

    public Map<String, Object> getYearlySummary(UUID parentId, int year) {
        // Validate parent exists
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        // Get all 12 months data
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            final int m = month;
            Optional<ParentInvoice> invoiceOpt = parentInvoiceRepository
                    .findByParentIdAndYearAndMonth(parentId, year, month);

            if (invoiceOpt.isEmpty()) {
                Map<String, Object> monthMap = new LinkedHashMap<>();
                monthMap.put("month", m);
                monthMap.put("total_sessions", BigDecimal.ZERO);
                monthMap.put("total_payments", BigDecimal.ZERO);
                monthlyData.add(monthMap);
                continue;
            }

            UUID invoiceId = invoiceOpt.get().getId();

            String sessionSql = "SELECT COALESCE(SUM(parent_amount), 0) FROM session WHERE invoice_id = ?";
            String paymentSql = "SELECT COALESCE(SUM(amount), 0) FROM parent_invoice_payment WHERE invoice_id = ?";

            BigDecimal sessionsTotal = jdbcTemplate.queryForObject(sessionSql, BigDecimal.class, invoiceId);
            BigDecimal paymentsTotal = jdbcTemplate.queryForObject(paymentSql, BigDecimal.class, invoiceId);

            Map<String, Object> monthMap = new LinkedHashMap<>();
            monthMap.put("month", m);
            monthMap.put("total_sessions", sessionsTotal != null ? sessionsTotal : BigDecimal.ZERO);
            monthMap.put("total_payments", paymentsTotal != null ? paymentsTotal : BigDecimal.ZERO);
            monthlyData.add(monthMap);
        }

        // Opening balance: last invoice of previous year (December)
        BigDecimal openingBalance = BigDecimal.ZERO;
        // Look for December of previous year, then November, etc.
        for (int m = 12; m >= 1; m--) {
            Optional<ParentInvoice> prevInv = parentInvoiceRepository
                    .findByParentIdAndYearAndMonth(parentId, year - 1, m);
            if (prevInv.isPresent()) {
                openingBalance = prevInv.get().getCurrentBalanceAmount() != null
                        ? prevInv.get().getCurrentBalanceAmount() : BigDecimal.ZERO;
                break;
            }
        }

        // All payments for this year
        List<ParentInvoice> allInvoicesForYear = parentInvoiceRepository
                .findByParentIdOrderByYearDescMonthDesc(parentId)
                .stream()
                .filter(inv -> inv.getYear() != null && inv.getYear() == year)
                .toList();

        List<Object[]> allPaymentRows = allInvoicesForYear.stream()
                .flatMap(inv -> parentInvoicePaymentRepository
                        .findByInvoiceIdOrderByPaymentTimestampAsc(inv.getId()).stream()
                        .map(p -> new Object[]{p.getId(), p.getInvoiceId(), p.getYear(), p.getMonth(),
                                p.getPaymentTimestamp(), p.getAmount()}))
                .toList();

        List<Map<String, Object>> allPayments = allPaymentRows.stream().map(row -> {
            Map<String, Object> pm = new LinkedHashMap<>();
            pm.put("id", row[0]);
            pm.put("invoice_id", row[1]);
            pm.put("year", row[2]);
            pm.put("month", row[3]);
            pm.put("payment_timestamp", row[4]);
            pm.put("amount", row[5]);
            pm.put("created_at", row[6]);
            return pm;
        }).toList();

        BigDecimal totalSessionsYear = monthlyData.stream()
                .map(entry -> (BigDecimal) entry.get("total_sessions"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("parent", mapParent(parent));
        result.put("year", year);
        result.put("locked", billingService.isInvoiceLocked(year, 12));
        result.put("opening_balance", openingBalance);
        result.put("total_sessions", totalSessionsYear);
        result.put("monthly_data", monthlyData);
        result.put("payments", allPayments);

        return result;
    }

    private BigDecimal getPreviousMonthBalance(UUID parentId, int year, int month) {
        // Find the directly preceding month's invoice
        int prevYear = month == 1 ? year - 1 : year;
        int prevMonth = month == 1 ? 12 : month - 1;
        return parentInvoiceRepository
                .findByParentIdAndYearAndMonth(parentId, prevYear, prevMonth)
                .map(inv -> inv.getCurrentBalanceAmount() != null ? inv.getCurrentBalanceAmount() : BigDecimal.ZERO)
                .orElse(BigDecimal.ZERO);
    }

    private Map<String, Object> mapParent(Parent parent) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", parent.getId());
        m.put("name", parent.getName());
        m.put("balance_amount", parent.getBalanceAmount());
        m.put("email_address", parent.getEmailAddress());
        m.put("phone_number", parent.getPhoneNumber());
        m.put("created_at", parent.getCreatedAt());
        m.put("updated_at", parent.getUpdatedAt());
        return m;
    }
}
