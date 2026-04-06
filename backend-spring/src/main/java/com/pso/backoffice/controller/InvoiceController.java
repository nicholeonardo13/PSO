package com.pso.backoffice.controller;

import com.pso.backoffice.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<?> listInvoices() {
        try {
            List<Map<String, Object>> invoices = invoiceService.listInvoices();
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/invoices/:parentId/:year/:month — monthly invoice detail
     */
    @GetMapping("/{parentId}/{year}/{month}")
    public ResponseEntity<?> getMonthlyInvoice(
            @PathVariable UUID parentId,
            @PathVariable int year,
            @PathVariable int month) {
        try {
            Map<String, Object> invoice = invoiceService.getMonthlyInvoice(parentId, year, month);
            return ResponseEntity.ok(invoice);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/invoices/:parentId/:year — yearly summary
     */
    @GetMapping("/{parentId}/{year}")
    public ResponseEntity<?> getYearlySummary(
            @PathVariable UUID parentId,
            @PathVariable int year) {
        try {
            Map<String, Object> summary = invoiceService.getYearlySummary(parentId, year);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
