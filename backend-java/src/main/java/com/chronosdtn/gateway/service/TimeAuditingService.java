package com.chronosdtn.gateway.service;

import org.springframework.stereotype.Service;

@Service
public class TimeAuditingService {

    public static final long REFERENCE_EPOCH = 1779900000000000L;
    private static final double DRIFT_FACTOR = 56.02e-6 / 86400.0;

    /**
     * Calculates the compensated Earth time (UTC/TAI) in microseconds
     * given the raw Lunar Local Clock timestamp (LTC) in microseconds.
     */
    public long calculateEarthTimeCorrection(long lunarRawTimestampMicroseconds) {
        long delta_t = lunarRawTimestampMicroseconds - REFERENCE_EPOCH;
        double adjustment = delta_t * DRIFT_FACTOR;
        return lunarRawTimestampMicroseconds - (long) Math.round(adjustment);
    }

    /**
     * Calculates the relativistic drift (deviation) in microseconds between
     * the Lunar raw time and the Earth corrected time.
     */
    public long calculateDrift(long lunarRawTimestamp, long earthCorrected) {
        return lunarRawTimestamp - earthCorrected;
    }
}
