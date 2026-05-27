package com.chronosdtn.gateway.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NOS_SATELLITES")
public class SatelliteNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "latency_terra_ms", nullable = false)
    private Integer latencyTerraMs = 1280;

    @Column(name = "latency_lua_ms", nullable = false)
    private Integer latencyLuaMs = 10;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ONLINE";

    @Column(name = "throughput_kbps", nullable = false)
    private Integer throughputKbps = 10240;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public SatelliteNode() {
    }

    public SatelliteNode(Long id, String nome, Integer latencyTerraMs, Integer latencyLuaMs, String status, Integer throughputKbps) {
        this.id = id;
        this.nome = nome;
        this.latencyTerraMs = latencyTerraMs;
        this.latencyLuaMs = latencyLuaMs;
        this.status = status;
        this.throughputKbps = throughputKbps;
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

    public Integer getLatencyTerraMs() {
        return latencyTerraMs;
    }

    public void setLatencyTerraMs(Integer latencyTerraMs) {
        this.latencyTerraMs = latencyTerraMs;
    }

    public Integer getLatencyLuaMs() {
        return latencyLuaMs;
    }

    public void setLatencyLuaMs(Integer latencyLuaMs) {
        this.latencyLuaMs = latencyLuaMs;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getThroughputKbps() {
        return throughputKbps;
    }

    public void setThroughputKbps(Integer throughputKbps) {
        this.throughputKbps = throughputKbps;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
