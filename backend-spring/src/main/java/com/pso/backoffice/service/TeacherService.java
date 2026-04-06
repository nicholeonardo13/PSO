package com.pso.backoffice.service;

import com.pso.backoffice.entity.Teacher;
import com.pso.backoffice.entity.TeacherSalary;
import com.pso.backoffice.repository.TeacherRepository;
import com.pso.backoffice.repository.TeacherSalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final TeacherSalaryRepository teacherSalaryRepository;

    public List<Teacher> listTeachers(String name) {
        return teacherRepository.findByNameContainingIgnoreCase(name != null && !name.isBlank() ? name : null);
    }

    public Teacher getTeacher(UUID id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
    }

    public List<TeacherSalary> getTeacherSalary(UUID teacherId) {
        return teacherSalaryRepository.findByTeacherIdOrderByYearDescMonthDesc(teacherId);
    }

    public Teacher createTeacher(Map<String, Object> body) {
        Teacher teacher = new Teacher();
        teacher.setName((String) body.get("name"));
        if (body.containsKey("email_address")) teacher.setEmailAddress((String) body.get("email_address"));
        if (body.containsKey("phone_number")) teacher.setPhoneNumber((String) body.get("phone_number"));
        return teacherRepository.save(teacher);
    }

    public Teacher updateTeacher(UUID id, Map<String, Object> body) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        if (body.containsKey("name") && body.get("name") != null) teacher.setName((String) body.get("name"));
        if (body.containsKey("email_address")) teacher.setEmailAddress((String) body.get("email_address"));
        if (body.containsKey("phone_number")) teacher.setPhoneNumber((String) body.get("phone_number"));
        return teacherRepository.save(teacher);
    }

    @Transactional
    public void deleteTeacher(UUID id) {
        teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        teacherRepository.deleteById(id);
    }
}
