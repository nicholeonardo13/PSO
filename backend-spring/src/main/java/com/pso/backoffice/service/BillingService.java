package com.pso.backoffice.service;

import com.pso.backoffice.entity.ParentInvoice;
import com.pso.backoffice.repository.ParentInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final ParentInvoiceRepository parentInvoiceRepository;

    /**
     * Determines the bill month for a session.
     * If session date is 2+ months ago, bill to current month.
     * Otherwise bill to session's month.
     */
    public YearMonth getBillMonth(OffsetDateTime sessionStartTimestamp) {
        LocalDate sessionDate = sessionStartTimestamp.toLocalDate();
        LocalDate today = LocalDate.now();
        LocalDate twoMonthsAgo = today.minusMonths(2);

        if (!sessionDate.isAfter(twoMonthsAgo)) {
            return YearMonth.of(today.getYear(), today.getMonth());
        } else {
            return YearMonth.of(sessionDate.getYear(), sessionDate.getMonth());
        }
    }

    /**
     * Checks if an invoice is locked.
     * An invoice is locked if today is after the last day of the month following the invoice month.
     */
    public boolean isInvoiceLocked(int year, int month) {
        LocalDate lastDayOfNextMonth = YearMonth.of(year, month).plusMonths(1).atEndOfMonth();
        return LocalDate.now().isAfter(lastDayOfNextMonth);
    }

    /**
     * Gets or creates a parent invoice for the given parent/year/month.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public ParentInvoice getOrCreateInvoice(UUID parentId, int year, int month) {
        return parentInvoiceRepository.findByParentIdAndYearAndMonth(parentId, year, month)
                .orElseGet(() -> {
                    ParentInvoice invoice = new ParentInvoice();
                    invoice.setParentId(parentId);
                    invoice.setYear(year);
                    invoice.setMonth(month);
                    return parentInvoiceRepository.save(invoice);
                });
    }

    /**
     * Recalculates the balance for an invoice:
     * balance = sum(invoice_payments) - sum(session parent_amounts)
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void recalculateInvoiceBalance(UUID invoiceId) {
        parentInvoiceRepository.recalculateBalance(invoiceId);
    }
}
