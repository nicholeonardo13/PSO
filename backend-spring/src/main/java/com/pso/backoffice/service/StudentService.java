package com.pso.backoffice.service;

import com.pso.backoffice.entity.Student;
import com.pso.backoffice.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> listStudents(String parentId) {
        if (parentId != null && !parentId.isBlank()) {
            return studentRepository.findByParentIdOrderByNameAsc(UUID.fromString(parentId));
        }
        return studentRepository.findAllOrderByName();
    }

    public List<Map<String, Object>> listStudentsWithParent() {
        List<Object[]> rows = studentRepository.findAllWithParentName();
        return rows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", row[0]);
            m.put("name", row[1]);
            m.put("phone_number", row[2]);
            m.put("email_address", row[3]);
            m.put("parent_id", row[4]);
            m.put("parent_name", row[5]);
            return m;
        }).toList();
    }

    public Student getStudent(UUID id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student createStudent(Map<String, Object> body) {
        Student student = new Student();
        if (body.get("parent_id") != null && !((String) body.get("parent_id")).isBlank()) {
            student.setParentId(UUID.fromString((String) body.get("parent_id")));
        }
        student.setName((String) body.get("name"));
        if (body.containsKey("phone_number")) {
            student.setPhoneNumber((String) body.get("phone_number"));
        }
        if (body.containsKey("email_address")) {
            student.setEmailAddress((String) body.get("email_address"));
        }
        return studentRepository.save(student);
    }

    public Student updateStudent(UUID id, Map<String, Object> body) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (body.containsKey("name") && body.get("name") != null) {
            student.setName((String) body.get("name"));
        }
        if (body.containsKey("parent_id")) {
            String pid = (String) body.get("parent_id");
            student.setParentId(pid != null && !pid.isBlank() ? UUID.fromString(pid) : null);
        }
        if (body.containsKey("phone_number")) {
            student.setPhoneNumber((String) body.get("phone_number"));
        }
        if (body.containsKey("email_address")) {
            student.setEmailAddress((String) body.get("email_address"));
        }
        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(UUID id) {
        studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        studentRepository.deleteById(id);
    }
}
