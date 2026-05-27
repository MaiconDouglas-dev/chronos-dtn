package com.chronosdtn.gateway.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RequisicaoPacoteDtn {

    @NotNull(message = "ID da operadora é obrigatório")
    private Long operadoraId;

    @NotBlank(message = "Metadata do pacote é obrigatório")
    private String metadataPacote;

    @NotNull(message = "Tamanho em KB é obrigatório")
    @DecimalMin(value = "0.0", inclusive = false, message = "Tamanho deve ser maior que 0")
    private BigDecimal tamanhoKb;

    private String statusTransmissao = "QUEUED";

    private Integer tentativas = 0;

    @NotNull(message = "Timestamp de criação (microssegundos) é obrigatório")
    private Long criadoEmUs;

    public RequisicaoPacoteDtn() {
    }

    public RequisicaoPacoteDtn(Long operadoraId, String metadataPacote, BigDecimal tamanhoKb, String statusTransmissao, Integer tentativas, Long criadoEmUs) {
        this.operadoraId = operadoraId;
        this.metadataPacote = metadataPacote;
        this.tamanhoKb = tamanhoKb;
        this.statusTransmissao = statusTransmissao;
        this.tentativas = tentativas;
        this.criadoEmUs = criadoEmUs;
    }

    public Long getOperadoraId() {
        return operadoraId;
    }

    public void setOperadoraId(Long operadoraId) {
        this.operadoraId = operadoraId;
    }

    public String getMetadataPacote() {
        return metadataPacote;
    }

    public void setMetadataPacote(String metadataPacote) {
        this.metadataPacote = metadataPacote;
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

    public Integer getTentativas() {
        return tentativas;
    }

    public void setTentativas(Integer tentativas) {
        this.tentativas = tentativas;
    }

    public Long getCriadoEmUs() {
        return criadoEmUs;
    }

    public void setCriadoEmUs(Long criadoEmUs) {
        this.criadoEmUs = criadoEmUs;
    }
}
