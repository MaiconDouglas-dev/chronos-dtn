package com.chronosdtn.gateway.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class TimeAuditingServiceTest {

    private final TimeAuditingService timeAuditingService = new TimeAuditingService();

    @Test
    void testReferenceEpochNoDrift() {
        long raw = TimeAuditingService.REFERENCE_EPOCH;
        long corrected = timeAuditingService.calculateEarthTimeCorrection(raw);
        long drift = timeAuditingService.calculateDrift(raw, corrected);
        
        assertEquals(raw, corrected);
        assertEquals(0L, drift);
    }

    @Test
    void testOneDayDrift() {
        // 1 day = 86400 seconds = 86400000000 microseconds
        long raw = TimeAuditingService.REFERENCE_EPOCH + 86400000000L;
        long corrected = timeAuditingService.calculateEarthTimeCorrection(raw);
        long drift = timeAuditingService.calculateDrift(raw, corrected);
        
        // Expected drift is approximately 56 microseconds
        assertEquals(56L, drift);
        assertEquals(TimeAuditingService.REFERENCE_EPOCH + 86400000000L - 56L, corrected);
    }

    @Test
    void testTenDaysDrift() {
        // 10 days after reference epoch
        long raw = TimeAuditingService.REFERENCE_EPOCH + (10L * 86400000000L);
        long corrected = timeAuditingService.calculateEarthTimeCorrection(raw);
        long drift = timeAuditingService.calculateDrift(raw, corrected);
        
        // Expected drift is 560 microseconds
        assertEquals(560L, drift);
    }
}
