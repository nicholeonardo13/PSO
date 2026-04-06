package com.pso.backoffice.controller;

import com.pso.backoffice.entity.Parent;
import com.pso.backoffice.service.ParentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @GetMapping
    public ResponseEntity<?> listParents(@RequestParam(required = false) String name) {
        try {
            List<Parent> parents = parentService.listParents(name);
            return ResponseEntity.ok(parents);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getParent(@PathVariable UUID id) {
        try {
            Map<String, Object> result = parentService.getParentWithStudents(id);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/outstanding")
    public ResponseEntity<?> getOutstanding(@PathVariable UUID id) {
        try {
            Map<String, Object> result = parentService.getOutstanding(id);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createParent(@RequestBody Map<String, Object> body) {
        try {
            if (body.get("name") == null || body.get("phone_number") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "name and phone_number are required"));
            }
            Parent parent = parentService.createParent(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(parent);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParent(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        try {
            Parent parent = parentService.updateParent(id, body);
            return ResponseEntity.ok(parent);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteParent(@PathVariable UUID id) {
        try {
            parentService.deleteParent(id);
            return ResponseEntity.ok(Map.of("message", "Parent deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
