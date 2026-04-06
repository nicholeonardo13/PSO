package com.pso.backoffice.service;

import com.pso.backoffice.entity.Parent;
import com.pso.backoffice.entity.Student;
import com.pso.backoffice.repository.ParentInvoiceRepository;
import com.pso.backoffice.repository.ParentRepository;
import com.pso.backoffice.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParentService {

    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final ParentInvoiceRepository parentInvoiceRepository;
    private final JdbcTemplate jdbcTemplate;

    public List<Parent> listParents(String name) {
        return parentRepository.findByNameContainingIgnoreCase(name != null && !name.isBlank() ? name : null);
    }

    public Map<String, Object> getParentWithStudents(UUID id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        List<Student> students = studentRepository.findByParentIdOrderByNameAsc(id);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", parent.getId());
        result.put("name", parent.getName());
        result.put("balance_amount", parent.getBalanceAmount());
        result.put("email_address", parent.getEmailAddress());
        result.put("phone_number", parent.getPhoneNumber());
        result.put("created_at", parent.getCreatedAt());
        result.put("updated_at", parent.getUpdatedAt());
        result.put("students", students.stream().map(this::mapStudent).toList());

        return result;
    }

    public Map<String, Object> getOutstanding(UUID parentId) {
        // Verify parent exists
        parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        String sql = """
            SELECT
                COALESCE(SUM(s.parent_amount), 0) AS total_sessions,
                COALESCE(SUM(pip.amount), 0) AS total_paid
            FROM parent_invoice pi
            LEFT JOIN session s ON s.invoice_id = pi.id
            LEFT JOIN parent_invoice_payment pip ON pip.invoice_id = pi.id
            WHERE pi.parent_id = ?
            """;

        Map<String, Object> row = jdbcTemplate.queryForMap(sql, parentId);

        BigDecimal totalSessions = row.get("total_sessions") != null
                ? new BigDecimal(row.get("total_sessions").toString()) : BigDecimal.ZERO;
        BigDecimal totalPaid = row.get("total_paid") != null
                ? new BigDecimal(row.get("total_paid").toString()) : BigDecimal.ZERO;
        BigDecimal outstanding = totalPaid.subtract(totalSessions);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total_sessions", totalSessions);
        result.put("total_paid", totalPaid);
        result.put("outstanding", outstanding);

        return result;
    }

    public Parent createParent(Map<String, Object> body) {
        Parent parent = new Parent();
        parent.setName((String) body.get("name"));
        parent.setPhoneNumber((String) body.get("phone_number"));
        if (body.containsKey("email_address")) {
            parent.setEmailAddress((String) body.get("email_address"));
        }
        return parentRepository.save(parent);
    }

    public Parent updateParent(UUID id, Map<String, Object> body) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        if (body.containsKey("name") && body.get("name") != null) {
            parent.setName((String) body.get("name"));
        }
        if (body.containsKey("phone_number")) {
            parent.setPhoneNumber((String) body.get("phone_number"));
        }
        if (body.containsKey("email_address")) {
            parent.setEmailAddress((String) body.get("email_address"));
        }
        return parentRepository.save(parent);
    }

    @Transactional
    public void deleteParent(UUID id) {
        parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        parentRepository.deleteById(id);
    }

    private Map<String, Object> mapStudent(Student s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("parent_id", s.getParentId());
        m.put("name", s.getName());
        m.put("phone_number", s.getPhoneNumber());
        m.put("created_at", s.getCreatedAt());
        m.put("updated_at", s.getUpdatedAt());
        return m;
    }
}
