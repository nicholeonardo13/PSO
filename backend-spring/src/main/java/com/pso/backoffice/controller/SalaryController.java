package com.pso.backoffice.controller;

import com.pso.backoffice.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;

    @GetMapping
    public ResponseEntity<?> listSalaries(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        try {
            List<Map<String, Object>> salaries = salaryService.listSalaries(teacherId, year, month);
            return ResponseEntity.ok(salaries);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/preview/{year}/{month}")
    public ResponseEntity<?> getSalaryPreview(@PathVariable int year, @PathVariable int month) {
        try {
            List<Map<String, Object>> preview = salaryService.getSalaryPreview(year, month);
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/detail/{year}/{month}")
    public ResponseEntity<?> getSalaryDetail(@PathVariable int year, @PathVariable int month) {
        try {
            List<Map<String, Object>> detail = salaryService.getSalaryDetail(year, month);
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/generate/{year}/{month}")
    public ResponseEntity<?> generateSalary(@PathVariable int year, @PathVariable int month) {
        try {
            Map<String, Object> result = salaryService.generateSalary(year, month);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
