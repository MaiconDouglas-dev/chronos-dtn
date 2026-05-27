package com.chronosdtn.gateway.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class NodeRequest {

    @NotBlank(message = "Node name cannot be blank")
    @Size(max = 100, message = "Node name must be at most 100 characters")
    private String nome;

    @NotNull(message = "Latency Terra is required")
    @Min(value = 0, message = "Latency Terra must be a non-negative number")
    private Integer latencyTerraMs;

    @NotNull(message = "Latency Lua is required")
    @Min(value = 0, message = "Latency Lua must be a non-negative number")
    private Integer latencyLuaMs;

    @NotBlank(message = "Status is required")
    @Size(max = 20, message = "Status must be at most 20 characters")
    private String status;

    @NotNull(message = "Throughput is required")
    @Min(value = 1, message = "Throughput must be at least 1 kbps")
    private Integer throughputKbps;

    public NodeRequest() {
    }

    public NodeRequest(String nome, Integer latencyTerraMs, Integer latencyLuaMs, String status, Integer throughputKbps) {
        this.nome = nome;
        this.latencyTerraMs = latencyTerraMs;
        this.latencyLuaMs = latencyLuaMs;
        this.status = status;
        this.throughputKbps = throughputKbps;
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
}
