package com.chronosdtn.gateway.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class RequisicaoTransacao {

    @NotNull(message = "ID da operadora é obrigatório")
    private Long operadoraId;

    @NotNull(message = "Valor em créditos é obrigatório")
    @DecimalMin(value = "0.0", message = "Créditos não podem ser negativos")
    private BigDecimal valorCreditos;

    @NotNull(message = "Timestamp lunar bruto (microssegundos) é obrigatório")
    private Long tempoLunarBrutoUs;

    @NotBlank(message = "Hash da transação é obrigatório")
    @Size(min = 64, max = 64, message = "Hash da transação deve ter exatamente 64 caracteres (SHA-256)")
    private String hashTransacao;

    public RequisicaoTransacao() {
    }

    public RequisicaoTransacao(Long operadoraId, BigDecimal valorCreditos, Long tempoLunarBrutoUs, String hashTransacao) {
        this.operadoraId = operadoraId;
        this.valorCreditos = valorCreditos;
        this.tempoLunarBrutoUs = tempoLunarBrutoUs;
        this.hashTransacao = hashTransacao;
    }

    public Long getOperadoraId() {
        return operadoraId;
    }

    public void setOperadoraId(Long operadoraId) {
        this.operadoraId = operadoraId;
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

    public String getHashTransacao() {
        return hashTransacao;
    }

    public void setHashTransacao(String hashTransacao) {
        this.hashTransacao = hashTransacao;
    }
}
