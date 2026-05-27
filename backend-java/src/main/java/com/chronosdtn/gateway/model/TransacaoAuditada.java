package com.chronosdtn.gateway.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "TRANSACOES_AUDITADAS")
public class TransacaoAuditada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "operadora_id", nullable = false)
    private Operador operador;

    @Column(name = "valor_creditos", nullable = false, precision = 18, scale = 4)
    private BigDecimal valorCreditos;

    @Column(name = "tempo_lunar_bruto_us", nullable = false)
    private Long tempoLunarBrutoUs; // Microseconds since Epoch (Lunar clock)

    @Column(name = "tempo_terra_corrigido_us", nullable = false)
    private Long tempoTerraCorrigidoUs; // Microseconds since Epoch (Earth compensated)

    @Column(name = "desvio_microssegundos", nullable = false)
    private Long desvioMicrossegundos; // Relativistic drift

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "hash_transacao", unique = true, nullable = false, length = 64)
    private String hashTransacao;

    public TransacaoAuditada() {
    }

    public TransacaoAuditada(Long id, Operador operador, BigDecimal valorCreditos, Long tempoLunarBrutoUs, Long tempoTerraCorrigidoUs, Long desvioMicrossegundos, String status, String hashTransacao) {
        this.id = id;
        this.operador = operador;
        this.valorCreditos = valorCreditos;
        this.tempoLunarBrutoUs = tempoLunarBrutoUs;
        this.tempoTerraCorrigidoUs = tempoTerraCorrigidoUs;
        this.desvioMicrossegundos = desvioMicrossegundos;
        this.status = status;
        this.hashTransacao = hashTransacao;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Operador getOperador() {
        return operador;
    }

    public void setOperador(Operador operador) {
        this.operador = operador;
    }

    public BigDecimal getValorCreditos() {
        return valorCreditos;
    }

    public void setValorCreditos(BigDecimal valorCreditos) {
        this.valorCreditos = valorCreditos;
    }

    public Long getTempoLunarBrutoUs() {
        return tempoLunarBrutoUs;
    }

    public void setTempoLunarBrutoUs(Long tempoLunarBrutoUs) {
        this.tempoLunarBrutoUs = tempoLunarBrutoUs;
    }

    public Long getTempoTerraCorrigidoUs() {
        return tempoTerraCorrigidoUs;
    }

    public void setTempoTerraCorrigidoUs(Long tempoTerraCorrigidoUs) {
        this.tempoTerraCorrigidoUs = tempoTerraCorrigidoUs;
    }

    public Long getDesvioMicrossegundos() {
        return desvioMicrossegundos;
    }

    public void setDesvioMicrossegundos(Long desvioMicrossegundos) {
        this.desvioMicrossegundos = desvioMicrossegundos;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHashTransacao() {
        return hashTransacao;
    }

    public void setHashTransacao(String hashTransacao) {
        this.hashTransacao = hashTransacao;
    }
}
