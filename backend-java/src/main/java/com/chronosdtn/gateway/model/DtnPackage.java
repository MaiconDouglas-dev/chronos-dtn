package com.chronosdtn.gateway.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "FILA_PACOTES_DTN")
public class DtnPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "operadora_id", nullable = false)
    private Operator operator;

    @Column(name = "pacote_metadata", nullable = false, columnDefinition = "TEXT")
    private String pacoteMetadata;

    @Column(name = "tamanho_kb", nullable = false, precision = 10, scale = 2)
    private BigDecimal tamanhoKb;

    @Column(name = "status_transmissao", nullable = false, length = 30)
    private String statusTransmissao = "QUEUED";

    @Column(name = "retries", nullable = false)
    private Integer retries = 0;

    @Column(name = "created_at", nullable = false)
    private Long createdAt; // Microseconds since Unix Epoch

    public DtnPackage() {
    }

    public DtnPackage(Long id, Operator operator, String pacoteMetadata, BigDecimal tamanhoKb, String statusTransmissao, Integer retries, Long createdAt) {
        this.id = id;
        this.operator = operator;
        this.pacoteMetadata = pacoteMetadata;
        this.tamanhoKb = tamanhoKb;
        this.statusTransmissao = statusTransmissao;
        this.retries = retries;
        this.createdAt = createdAt;
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

    public String getPacoteMetadata() {
        return pacoteMetadata;
    }

    public void setPacoteMetadata(String pacoteMetadata) {
        this.pacoteMetadata = pacoteMetadata;
    }

    public BigDecimal getTamanhoKb() {
        return tamanhoKb;
    }

    public void setTamanhoKb(BigDecimal tamanhoKb) {
        this.tamanhoKb = tamanhoKb;
    }

    public String getStatusTransmissao() {
        return statusTransmissao;
    }

    public void setStatusTransmissao(String statusTransmissao) {
        this.statusTransmissao = statusTransmissao;
    }

    public Integer getRetries() {
        return retries;
    }

    public void setRetries(Integer retries) {
        this.retries = retries;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
}
