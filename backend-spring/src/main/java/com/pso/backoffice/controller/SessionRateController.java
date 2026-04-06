package com.pso.backoffice.controller;

import com.pso.backoffice.entity.SessionRate;
import com.pso.backoffice.service.SessionRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/session-rates")
@RequiredArgsConstructor
public class SessionRateController {

    private final SessionRateService sessionRateService;

    @GetMapping
    public ResponseEntity<?> listSessionRates() {
        try {
            List<Map<String, Object>> rates = sessionRateService.listSessionRates();
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/lookup")
    public ResponseEntity<?> lookupSessionRate(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String courseId) {
        try {
            Optional<Map<String, Object>> rate = sessionRateService.lookupSessionRate(teacherId, studentId, courseId);
            return rate.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createSessionRate(@RequestBody Map<String, Object> body) {
        try {
            SessionRate rate = sessionRateService.createSessionRate(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(rate);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSessionRate(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        try {
            SessionRate rate = sessionRateService.updateSessionRate(id, body);
            return ResponseEntity.ok(rate);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSessionRate(@PathVariable UUID id) {
        try {
            sessionRateService.deleteSessionRate(id);
            return ResponseEntity.ok(Map.of("message", "Session rate deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
