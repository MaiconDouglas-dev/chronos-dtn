package com.chronosdtn.gateway.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "FILA_PACOTES_DTN")
public class PacoteDtn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "operadora_id", nullable = false)
    private Operador operador;

    @Column(name = "metadata_pacote", nullable = false, columnDefinition = "TEXT")
    private String metadataPacote;

    @Column(name = "tamanho_kb", nullable = false, precision = 10, scale = 2)
    private BigDecimal tamanhoKb;

    @Column(name = "status_transmissao", nullable = false, length = 30)
    private String statusTransmissao = "QUEUED";

    @Column(name = "tentativas", nullable = false)
    private Integer tentativas = 0;

    @Column(name = "criado_em_us", nullable = false)
    private Long criadoEmUs; // Microseconds since Unix Epoch

    public PacoteDtn() {
    }

    public PacoteDtn(Long id, Operador operador, String metadataPacote, BigDecimal tamanhoKb, String statusTransmissao, Integer tentativas, Long criadoEmUs) {
        this.id = id;
        this.operador = operador;
        this.metadataPacote = metadataPacote;
        this.tamanhoKb = tamanhoKb;
        this.statusTransmissao = statusTransmissao;
        this.tentativas = tentativas;
        this.criadoEmUs = criadoEmUs;
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
