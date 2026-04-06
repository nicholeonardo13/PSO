package com.pso.backoffice.controller;

import com.pso.backoffice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<?> listPayments(@RequestParam(required = false) String parentId) {
        try {
            List<Map<String, Object>> payments = paymentService.listPayments(parentId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> body) {
        try {
            if (body.get("parent_id") == null || body.get("amount") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "parent_id and amount are required"));
            }
            Map<String, Object> result = paymentService.createPayment(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}
