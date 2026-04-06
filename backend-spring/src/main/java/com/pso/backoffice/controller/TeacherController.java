package com.pso.backoffice.controller;

import com.pso.backoffice.entity.Teacher;
import com.pso.backoffice.entity.TeacherSalary;
import com.pso.backoffice.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    public ResponseEntity<?> listTeachers(@RequestParam(required = false) String name) {
        try {
            List<Teacher> teachers = teacherService.listTeachers(name);
            return ResponseEntity.ok(teachers);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTeacher(@PathVariable UUID id) {
        try {
            Teacher teacher = teacherService.getTeacher(id);
            return ResponseEntity.ok(teacher);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/salary")
    public ResponseEntity<?> getTeacherSalary(@PathVariable UUID id) {
        try {
            List<TeacherSalary> salaries = teacherService.getTeacherSalary(id);
            return ResponseEntity.ok(salaries);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createTeacher(@RequestBody Map<String, Object> body) {
        try {
            if (body.get("name") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "name is required"));
            }
            Teacher teacher = teacherService.createTeacher(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(teacher);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        try {
            Teacher teacher = teacherService.updateTeacher(id, body);
            return ResponseEntity.ok(teacher);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable UUID id) {
        try {
            teacherService.deleteTeacher(id);
            return ResponseEntity.ok(Map.of("message", "Teacher deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
