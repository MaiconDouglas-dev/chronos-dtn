package com.chronosdtn.gateway.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NOS_SATELLITES")
public class NoSatelite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "latency_terra_ms", nullable = false)
    private Integer latenciaTerraMs = 1280;

    @Column(name = "latency_lua_ms", nullable = false)
    private Integer latenciaLuaMs = 10;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ONLINE";

    @Column(name = "throughput_kbps", nullable = false)
    private Integer vazaoKbps = 10240;

    @Column(name = "atualizado_em", insertable = false, updatable = false)
    private LocalDateTime atualizadoEm;

    public NoSatelite() {
    }

    public NoSatelite(Long id, String nome, Integer latenciaTerraMs, Integer latenciaLuaMs, String status, Integer vazaoKbps) {
        this.id = id;
        this.nome = nome;
        this.latenciaTerraMs = latenciaTerraMs;
        this.latenciaLuaMs = latenciaLuaMs;
        this.status = status;
        this.vazaoKbps = vazaoKbps;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getLatenciaTerraMs() {
        return latenciaTerraMs;
    }

    public void setLatenciaTerraMs(Integer latenciaTerraMs) {
        this.latenciaTerraMs = latenciaTerraMs;
    }

    public Integer getLatenciaLuaMs() {
        return latenciaLuaMs;
    }

    public void setLatenciaLuaMs(Integer latenciaLuaMs) {
        this.latenciaLuaMs = latenciaLuaMs;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getVazaoKbps() {
        return vazaoKbps;
    }

    public void setVazaoKbps(Integer vazaoKbps) {
        this.vazaoKbps = vazaoKbps;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
