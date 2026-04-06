package com.pso.backoffice.service;

import com.pso.backoffice.repository.ParentInvoiceRepository;
import com.pso.backoffice.repository.ParentRepository;
import com.pso.backoffice.repository.SessionRepository;
import com.pso.backoffice.repository.StudentRepository;
import com.pso.backoffice.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SessionRepository sessionRepository;
    private final ParentInvoiceRepository parentInvoiceRepository;

    public Map<String, Object> getDashboard() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();

        long totalParents = parentRepository.countAll();
        long totalStudents = studentRepository.countAll();
        long totalTeachers = teacherRepository.countAll();
        long sessionsThisMonth = sessionRepository.countByYearAndMonth(year, month);

        // Outstanding bills: current month invoices with negative balance
        List<Object[]> outstandingRows = parentInvoiceRepository.findOutstandingInvoices(year, month);
        List<Map<String, Object>> outstandingBills = outstandingRows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("parent_id", row[1]);
            m.put("parent_name", row[7]);
            m.put("year", row[2]);
            m.put("month", row[3]);
            m.put("current_balance_amount", row[4] != null ? new BigDecimal(row[4].toString()) : BigDecimal.ZERO);
            return m;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total_parents", totalParents);
        result.put("total_students", totalStudents);
        result.put("total_teachers", totalTeachers);
        result.put("sessions_this_month", sessionsThisMonth);
        result.put("outstanding_bills", outstandingBills);

        return result;
    }
}
