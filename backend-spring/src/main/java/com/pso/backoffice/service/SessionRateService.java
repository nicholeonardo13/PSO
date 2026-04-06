package com.pso.backoffice.service;

import com.pso.backoffice.entity.SessionRate;
import com.pso.backoffice.repository.SessionRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionRateService {

    private final SessionRateRepository sessionRateRepository;

    public List<Map<String, Object>> listSessionRates() {
        List<Object[]> rows = sessionRateRepository.findAllWithNames();
        return rows.stream().map(this::mapRow).toList();
    }

    public Optional<Map<String, Object>> lookupSessionRate(String teacherId, String studentId, String courseId) {
        return sessionRateRepository.findByLookup(teacherId, studentId, courseId)
                .map(this::mapRow);
    }

    public SessionRate createSessionRate(Map<String, Object> body) {
        SessionRate rate = new SessionRate();
        rate.setCourseId(UUID.fromString((String) body.get("course_id")));
        rate.setTeacherId(UUID.fromString((String) body.get("teacher_id")));
        rate.setStudentId(UUID.fromString((String) body.get("student_id")));
        if (body.get("teacher_amount_per_hour") != null) {
            rate.setTeacherAmountPerHour(parseBigDecimal(body.get("teacher_amount_per_hour")));
        }
        if (body.get("parent_amount_per_hour") != null) {
            rate.setParentAmountPerHour(parseBigDecimal(body.get("parent_amount_per_hour")));
        }
        return sessionRateRepository.save(rate);
    }

    public SessionRate updateSessionRate(UUID id, Map<String, Object> body) {
        SessionRate rate = sessionRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session rate not found"));
        if (body.containsKey("course_id") && body.get("course_id") != null) {
            rate.setCourseId(UUID.fromString((String) body.get("course_id")));
        }
        if (body.containsKey("teacher_id") && body.get("teacher_id") != null) {
            rate.setTeacherId(UUID.fromString((String) body.get("teacher_id")));
        }
        if (body.containsKey("student_id") && body.get("student_id") != null) {
            rate.setStudentId(UUID.fromString((String) body.get("student_id")));
        }
        if (body.containsKey("teacher_amount_per_hour")) {
            rate.setTeacherAmountPerHour(parseBigDecimal(body.get("teacher_amount_per_hour")));
        }
        if (body.containsKey("parent_amount_per_hour")) {
            rate.setParentAmountPerHour(parseBigDecimal(body.get("parent_amount_per_hour")));
        }
        return sessionRateRepository.save(rate);
    }

    @Transactional
    public void deleteSessionRate(UUID id) {
        sessionRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session rate not found"));
        sessionRateRepository.deleteById(id);
    }

    private Map<String, Object> mapRow(Object[] row) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", row[0]);
        m.put("course_id", row[1]);
        m.put("teacher_id", row[2]);
        m.put("student_id", row[3]);
        m.put("teacher_amount_per_hour", row[4] != null ? new BigDecimal(row[4].toString()) : null);
        m.put("parent_amount_per_hour", row[5] != null ? new BigDecimal(row[5].toString()) : null);
        m.put("created_at", row[6]);
        m.put("updated_at", row[7]);
        m.put("course_name", row[8]);
        m.put("teacher_name", row[9]);
        m.put("student_name", row[10]);
        return m;
    }

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return new BigDecimal(n.toString());
        return new BigDecimal(value.toString());
    }
}
