package com.chronosdtn.gateway.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ServicoAuditoriaTempoTest {

    private final ServicoAuditoriaTempo servicoAuditoriaTempo = new ServicoAuditoriaTempo();

    @Test
    void testeEpocaReferenciaSemDesvio() {
        long bruto = ServicoAuditoriaTempo.EPOCA_REFERENCIA;
        long corrigido = servicoAuditoriaTempo.calcularCorrecaoTempoTerra(bruto);
        long desvio = servicoAuditoriaTempo.calcularDesvio(bruto, corrigido);
        
        assertEquals(bruto, corrigido);
        assertEquals(0L, desvio);
    }

    @Test
    void testeDesvioUmDia() {
        // 1 dia = 86400 segundos = 86400000000 microssegundos
        long bruto = ServicoAuditoriaTempo.EPOCA_REFERENCIA + 86400000000L;
        long corrigido = servicoAuditoriaTempo.calcularCorrecaoTempoTerra(bruto);
        long desvio = servicoAuditoriaTempo.calcularDesvio(bruto, corrigido);
        
        // Desvio esperado é de aproximadamente 56 microssegundos
        assertEquals(56L, desvio);
        assertEquals(ServicoAuditoriaTempo.EPOCA_REFERENCIA + 86400000000L - 56L, corrigido);
    }

    @Test
    void testeDesvioDezDias() {
        // 10 dias após a época de referência
        long bruto = ServicoAuditoriaTempo.EPOCA_REFERENCIA + (10L * 86400000000L);
        long corrigido = servicoAuditoriaTempo.calcularCorrecaoTempoTerra(bruto);
        long desvio = servicoAuditoriaTempo.calcularDesvio(bruto, corrigido);
        
        // Desvio esperado é de 560 microssegundos
        assertEquals(560L, desvio);
    }
}
