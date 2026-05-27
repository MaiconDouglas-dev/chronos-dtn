package com.chronosdtn.gateway.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class DtnPackageRequest {

    @NotNull(message = "Operator ID is required")
    private Long operadoraId;

    @NotBlank(message = "Package metadata is required")
    private String pacoteMetadata;

    @NotNull(message = "Size is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Size must be greater than 0")
    private BigDecimal tamanhoKb;

    private String statusTransmissao = "QUEUED";

    private Integer retries = 0;

    @NotNull(message = "Created at timestamp (microseconds) is required")
    private Long createdAt;

    public DtnPackageRequest() {
    }

    public DtnPackageRequest(Long operadoraId, String pacoteMetadata, BigDecimal tamanhoKb, String statusTransmissao, Integer retries, Long createdAt) {
        this.operadoraId = operadoraId;
        this.pacoteMetadata = pacoteMetadata;
        this.tamanhoKb = tamanhoKb;
        this.statusTransmissao = statusTransmissao;
        this.retries = retries;
        this.createdAt = createdAt;
    }

    public Long getOperadoraId() {
        return operadoraId;
    }

    public void setOperadoraId(Long operadoraId) {
        this.operadoraId = operadoraId;
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
