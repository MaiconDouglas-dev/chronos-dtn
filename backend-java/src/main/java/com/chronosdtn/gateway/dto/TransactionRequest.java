package com.chronosdtn.gateway.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class TransactionRequest {

    @NotNull(message = "Operator ID is required")
    private Long operadoraId;

    @NotNull(message = "Value in credits is required")
    @DecimalMin(value = "0.0", message = "Credits must be non-negative")
    private BigDecimal vlCreditos;

    @NotNull(message = "Lunar raw timestamp (microseconds) is required")
    private Long tmLunarBruto;

    @NotBlank(message = "Transaction hash is required")
    @Size(min = 64, max = 64, message = "Transaction hash must be exactly 64 characters (SHA-256)")
    private String hashTransacao;

    public TransactionRequest() {
    }

    public TransactionRequest(Long operadoraId, BigDecimal vlCreditos, Long tmLunarBruto, String hashTransacao) {
        this.operadoraId = operadoraId;
        this.vlCreditos = vlCreditos;
        this.tmLunarBruto = tmLunarBruto;
        this.hashTransacao = hashTransacao;
    }

    public Long getOperadoraId() {
        return operadoraId;
    }

    public void setOperadoraId(Long operadoraId) {
        this.operadoraId = operadoraId;
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

    public String getHashTransacao() {
        return hashTransacao;
    }

    public void setHashTransacao(String hashTransacao) {
        this.hashTransacao = hashTransacao;
    }
}
