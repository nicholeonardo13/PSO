package com.pso.backoffice.service;

import com.pso.backoffice.entity.TeacherSalary;
import com.pso.backoffice.repository.SessionRepository;
import com.pso.backoffice.repository.TeacherSalaryRepository;
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
public class SalaryService {

    private final TeacherSalaryRepository teacherSalaryRepository;
    private final SessionRepository sessionRepository;

    public List<Map<String, Object>> listSalaries(String teacherId, Integer year, Integer month) {
        List<Object[]> rows = teacherSalaryRepository.findAllWithFilters(teacherId, year, month);
        return rows.stream().map(this::mapSalaryRow).toList();
    }

    public List<Map<String, Object>> getSalaryPreview(int year, int month) {
        List<Object[]> rows = sessionRepository.getSalaryPreview(year, month);
        return rows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("teacher_id", row[0]);
            m.put("teacher_name", row[1]);
            m.put("total_amount", row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO);
            m.put("total_hours", row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO);
            m.put("session_count", row[4] != null ? ((Number) row[4]).longValue() : 0L);
            return m;
        }).toList();
    }

    public List<Map<String, Object>> getSalaryDetail(int year, int month) {
        // Fetch all sessions for the month with full join data
        List<Object[]> rows = sessionRepository.findAllWithFilters(null, null, year, month);

        // Group by teacher
        Map<String, Map<String, Object>> teacherMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String teacherId = row[4] != null ? row[4].toString() : "unknown";
            String teacherName = row[14] != null ? row[14].toString() : "Unknown";

            teacherMap.computeIfAbsent(teacherId, k -> {
                Map<String, Object> t = new LinkedHashMap<>();
                t.put("teacher_id", teacherId);
                t.put("teacher_name", teacherName);
                t.put("total_amount", BigDecimal.ZERO);
                t.put("total_hours", BigDecimal.ZERO);
                t.put("session_count", 0L);
                t.put("sessions", new java.util.ArrayList<>());
                return t;
            });

            Map<String, Object> teacher = teacherMap.get(teacherId);
            BigDecimal teacherAmt = row[10] != null ? new BigDecimal(row[10].toString()) : BigDecimal.ZERO;
            BigDecimal durationHour = row[8] != null ? new BigDecimal(row[8].toString()) : BigDecimal.ZERO;

            teacher.put("total_amount", ((BigDecimal) teacher.get("total_amount")).add(teacherAmt));
            teacher.put("total_hours", ((BigDecimal) teacher.get("total_hours")).add(durationHour));
            teacher.put("session_count", (Long) teacher.get("session_count") + 1L);

            Map<String, Object> session = new LinkedHashMap<>();
            session.put("id", row[0]);
            session.put("session_start_timestamp", row[7]);
            session.put("student_name", row[12]);
            session.put("parent_name", row[16]);
            session.put("course_name", row[13]);
            session.put("duration_hour", durationHour);
            session.put("teacher_amount", teacherAmt);
            session.put("description", row[11]);
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> sessions = (java.util.List<Map<String, Object>>) teacher.get("sessions");
            sessions.add(session);
        }

        return new java.util.ArrayList<>(teacherMap.values());
    }

    @Transactional
    public Map<String, Object> generateSalary(int year, int month) {
        // Delete existing records for this month
        teacherSalaryRepository.deleteByYearAndMonth(year, month);

        // Get session aggregations (with total_hours and session_count)
        List<Object[]> rows = sessionRepository.getSalaryPreview(year, month);

        OffsetDateTime now = OffsetDateTime.now();
        List<Map<String, Object>> salaries = rows.stream().map(row -> {
            TeacherSalary salary = new TeacherSalary();
            salary.setInsertTimestamp(now);
            salary.setYear(year);
            salary.setMonth(month);
            salary.setTeacherId(UUID.fromString(row[0].toString()));
            salary.setAmount(row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO);
            TeacherSalary saved = teacherSalaryRepository.save(salary);

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", saved.getId());
            m.put("teacher_id", saved.getTeacherId());
            m.put("year", saved.getYear());
            m.put("month", saved.getMonth());
            m.put("amount", saved.getAmount());
            m.put("insert_timestamp", saved.getInsertTimestamp());
            m.put("teacher_name", row[1]);
            m.put("total_hours", row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO);
            m.put("session_count", row[4] != null ? ((Number) row[4]).longValue() : 0L);
            return m;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("year", year);
        result.put("month", month);
        result.put("salaries", salaries);
        return result;
    }

    private Map<String, Object> mapSalaryRow(Object[] row) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", row[0]);
        m.put("insert_timestamp", row[1]);
        m.put("year", row[2]);
        m.put("month", row[3]);
        m.put("teacher_id", row[4]);
        m.put("amount", row[5] != null ? new BigDecimal(row[5].toString()) : BigDecimal.ZERO);
        m.put("teacher_name", row[6]);
        return m;
    }
}
