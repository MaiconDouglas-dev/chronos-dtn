package com.chronosdtn.gateway.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "TRANSACOES_AUDITADAS")
public class AuditedTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "operadora_id", nullable = false)
    private Operator operator;

    @Column(name = "vl_creditos", nullable = false, precision = 18, scale = 4)
    private BigDecimal vlCreditos;

    @Column(name = "tm_lunar_bruto", nullable = false)
    private Long tmLunarBruto; // Microseconds since Epoch (Lunar clock)

    @Column(name = "tm_terra_corrigido", nullable = false)
    private Long tmTerraCorrigido; // Microseconds since Epoch (Earth compensated)

    @Column(name = "desvio_microssegundos", nullable = false)
    private Long desvioMicrossegundos; // Relativistic drift

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "hash_transacao", unique = true, nullable = false, length = 64)
    private String hashTransacao;

    public AuditedTransaction() {
    }

    public AuditedTransaction(Long id, Operator operator, BigDecimal vlCreditos, Long tmLunarBruto, Long tmTerraCorrigido, Long desvioMicrossegundos, String status, String hashTransacao) {
        this.id = id;
        this.operator = operator;
        this.vlCreditos = vlCreditos;
        this.tmLunarBruto = tmLunarBruto;
        this.tmTerraCorrigido = tmTerraCorrigido;
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

    public Operator getOperator() {
        return operator;
    }

    public void setOperator(Operator operator) {
        this.operator = operator;
    }

    public BigDecimal getVlCreditos() {
        return vlCreditos;
    }

    public void setVlCreditos(BigDecimal vlCreditos) {
        this.vlCreditos = vlCreditos;
    }

    public Long getTmLunarBruto() {
        return tmLunarBruto;
    }

    public void setTmLunarBruto(Long tmLunarBruto) {
        this.tmLunarBruto = tmLunarBruto;
    }

    public Long getTmTerraCorrigido() {
        return tmTerraCorrigido;
    }

    public void setTmTerraCorrigido(Long tmTerraCorrigido) {
        this.tmTerraCorrigido = tmTerraCorrigido;
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
