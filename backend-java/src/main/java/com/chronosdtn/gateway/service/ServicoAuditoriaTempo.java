package com.chronosdtn.gateway.service;

import org.springframework.stereotype.Service;

@Service
public class ServicoAuditoriaTempo {

    public static final long EPOCA_REFERENCIA = 1779900000000000L;
    private static final double FATOR_DESVIO = 56.02e-6 / 86400.0;

    /**
     * Calcula o tempo corrigido da Terra (UTC/TAI) em microssegundos
     * dado o timestamp bruto do relógio lunar local (LTC) em microssegundos.
     */
    public long calcularCorrecaoTempoTerra(long tempoBrutoLunarUs) {
        long delta_t = tempoBrutoLunarUs - EPOCA_REFERENCIA;
        double ajuste = delta_t * FATOR_DESVIO;
        return tempoBrutoLunarUs - (long) Math.round(ajuste);
    }

    /**
     * Calcula o desvio relativístico (desvio) em microssegundos entre
     * o tempo bruto lunar e o tempo corrigido da Terra.
     */
    public long calcularDesvio(long tempoBrutoLunarUs, long tempoTerraCorrigidoUs) {
        return tempoBrutoLunarUs - tempoTerraCorrigidoUs;
    }
}
