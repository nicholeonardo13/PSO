package com.pso.backoffice.controller;

import com.pso.backoffice.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<?> listSessions(
            @RequestParam(required = false) String parentId,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        try {
            List<Map<String, Object>> sessions = sessionService.listSessions(parentId, teacherId, year, month);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody Map<String, Object> body) {
        try {
            if (body.get("student_id") == null || body.get("course_id") == null
                    || body.get("teacher_id") == null || body.get("session_start_timestamp") == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "student_id, course_id, teacher_id, and session_start_timestamp are required"));
            }
            Map<String, Object> result = sessionService.createSession(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSession(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> result = sessionService.updateSession(id, body);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable UUID id) {
        try {
            sessionService.deleteSession(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}
