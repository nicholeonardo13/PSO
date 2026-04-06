package com.pso.backoffice.service;

import com.pso.backoffice.entity.ParentInvoice;
import com.pso.backoffice.entity.Session;
import com.pso.backoffice.entity.Student;
import com.pso.backoffice.repository.SessionRepository;
import com.pso.backoffice.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final BillingService billingService;

    public List<Map<String, Object>> listSessions(String parentId, String teacherId,
                                                    Integer year, Integer month) {
        List<Object[]> rows = sessionRepository.findAllWithFilters(parentId, teacherId, year, month);
        return rows.stream().map(this::mapRow).toList();
    }

    @Transactional
    public Map<String, Object> createSession(Map<String, Object> body) {
        UUID studentId = UUID.fromString((String) body.get("student_id"));
        UUID courseId = UUID.fromString((String) body.get("course_id"));
        UUID teacherId = UUID.fromString((String) body.get("teacher_id"));

        // Validate student exists and get parent
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        UUID parentId = student.getParentId();

        // Parse session start timestamp
        OffsetDateTime sessionStart = OffsetDateTime.parse((String) body.get("session_start_timestamp"));

        // Determine bill month
        YearMonth billMonth = billingService.getBillMonth(sessionStart);

        // Check if invoice is locked
        if (billingService.isInvoiceLocked(billMonth.getYear(), billMonth.getMonthValue())) {
            throw new RuntimeException(
                    String.format("Invoice for %d/%d is locked and cannot be modified",
                            billMonth.getMonthValue(), billMonth.getYear()));
        }

        // Get or create invoice
        ParentInvoice invoice = billingService.getOrCreateInvoice(parentId, billMonth.getYear(), billMonth.getMonthValue());

        // Calculate amounts
        BigDecimal durationHour = parseBigDecimal(body.get("duration_hour"));
        BigDecimal parentAmountPerHour = parseBigDecimal(body.get("parent_amount_per_hour"));
        BigDecimal teacherAmountPerHour = parseBigDecimal(body.get("teacher_amount_per_hour"));

        // If amounts not provided directly, use provided parent_amount / teacher_amount
        BigDecimal parentAmount;
        BigDecimal teacherAmount;

        if (body.containsKey("parent_amount") && body.get("parent_amount") != null) {
            parentAmount = parseBigDecimal(body.get("parent_amount"));
        } else if (parentAmountPerHour != null && durationHour != null) {
            parentAmount = parentAmountPerHour.multiply(durationHour);
        } else {
            parentAmount = BigDecimal.ZERO;
        }

        if (body.containsKey("teacher_amount") && body.get("teacher_amount") != null) {
            teacherAmount = parseBigDecimal(body.get("teacher_amount"));
        } else if (teacherAmountPerHour != null && durationHour != null) {
            teacherAmount = teacherAmountPerHour.multiply(durationHour);
        } else {
            teacherAmount = BigDecimal.ZERO;
        }

        // Create session
        Session session = new Session();
        session.setInvoiceId(invoice.getId());
        session.setStudentId(studentId);
        session.setCourseId(courseId);
        session.setTeacherId(teacherId);
        session.setBillYear(billMonth.getYear());
        session.setBillMonth(billMonth.getMonthValue());
        session.setSessionStartTimestamp(sessionStart);
        session.setDurationHour(durationHour);
        session.setParentAmount(parentAmount);
        session.setTeacherAmount(teacherAmount);
        session.setDescription((String) body.get("description"));

        session = sessionRepository.save(session);

        // Recalculate invoice balance
        billingService.recalculateInvoiceBalance(invoice.getId());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", session.getId());
        result.put("invoice_id", session.getInvoiceId());
        result.put("student_id", session.getStudentId());
        result.put("course_id", session.getCourseId());
        result.put("teacher_id", session.getTeacherId());
        result.put("bill_year", session.getBillYear());
        result.put("bill_month", session.getBillMonth());
        result.put("session_start_timestamp", session.getSessionStartTimestamp());
        result.put("duration_hour", session.getDurationHour());
        result.put("parent_amount", session.getParentAmount());
        result.put("teacher_amount", session.getTeacherAmount());
        result.put("description", session.getDescription());

        return result;
    }

    @Transactional
    public Map<String, Object> updateSession(UUID id, Map<String, Object> body) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (billingService.isInvoiceLocked(session.getBillYear(), session.getBillMonth())) {
            throw new RuntimeException(
                    String.format("Invoice for %d/%d is locked and cannot be modified",
                            session.getBillMonth(), session.getBillYear()));
        }

        if (body.containsKey("teacher_id") && body.get("teacher_id") != null) {
            session.setTeacherId(UUID.fromString((String) body.get("teacher_id")));
        }
        if (body.containsKey("course_id") && body.get("course_id") != null) {
            session.setCourseId(UUID.fromString((String) body.get("course_id")));
        }
        if (body.containsKey("session_start_timestamp") && body.get("session_start_timestamp") != null) {
            session.setSessionStartTimestamp(OffsetDateTime.parse((String) body.get("session_start_timestamp")));
        }
        if (body.containsKey("duration_hour")) {
            session.setDurationHour(parseBigDecimal(body.get("duration_hour")));
        }
        if (body.containsKey("parent_amount")) {
            session.setParentAmount(parseBigDecimal(body.get("parent_amount")));
        }
        if (body.containsKey("teacher_amount")) {
            session.setTeacherAmount(parseBigDecimal(body.get("teacher_amount")));
        }
        if (body.containsKey("description")) {
            session.setDescription((String) body.get("description"));
        }

        session = sessionRepository.save(session);
        billingService.recalculateInvoiceBalance(session.getInvoiceId());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", session.getId());
        result.put("invoice_id", session.getInvoiceId());
        result.put("student_id", session.getStudentId());
        result.put("course_id", session.getCourseId());
        result.put("teacher_id", session.getTeacherId());
        result.put("bill_year", session.getBillYear());
        result.put("bill_month", session.getBillMonth());
        result.put("session_start_timestamp", session.getSessionStartTimestamp());
        result.put("duration_hour", session.getDurationHour());
        result.put("parent_amount", session.getParentAmount());
        result.put("teacher_amount", session.getTeacherAmount());
        result.put("description", session.getDescription());
        return result;
    }

    @Transactional
    public void deleteSession(UUID id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (billingService.isInvoiceLocked(session.getBillYear(), session.getBillMonth())) {
            throw new RuntimeException(
                    String.format("Invoice for %d/%d is locked and cannot be modified",
                            session.getBillMonth(), session.getBillYear()));
        }

        UUID invoiceId = session.getInvoiceId();
        sessionRepository.deleteById(id);
        billingService.recalculateInvoiceBalance(invoiceId);
    }

    private Map<String, Object> mapRow(Object[] row) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", row[0]);
        m.put("invoice_id", row[1]);
        m.put("student_id", row[2]);
        m.put("course_id", row[3]);
        m.put("teacher_id", row[4]);
        m.put("bill_year", row[5]);
        m.put("bill_month", row[6]);
        m.put("session_start_timestamp", row[7]);
        m.put("duration_hour", row[8] != null ? new BigDecimal(row[8].toString()) : null);
        m.put("parent_amount", row[9] != null ? new BigDecimal(row[9].toString()) : null);
        m.put("teacher_amount", row[10] != null ? new BigDecimal(row[10].toString()) : null);
        m.put("description", row[11]);
        m.put("student_name", row[12]);
        m.put("course_name", row[13]);
        m.put("teacher_name", row[14]);
        m.put("parent_id", row[15]);
        m.put("parent_name", row[16]);
        return m;
    }

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return new BigDecimal(n.toString());
        return new BigDecimal(value.toString());
    }
}
