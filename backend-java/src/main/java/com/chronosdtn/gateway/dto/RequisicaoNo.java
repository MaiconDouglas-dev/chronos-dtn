package com.chronosdtn.gateway.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RequisicaoNo {

    @NotBlank(message = "Nome do nó não pode ser em branco")
    @Size(max = 100, message = "Nome do nó deve ter no máximo 100 caracteres")
    private String nome;

    @NotNull(message = "Latência Terra é obrigatória")
    @Min(value = 0, message = "Latência Terra não pode ser negativa")
    private Integer latenciaTerraMs;

    @NotNull(message = "Latência Lua é obrigatória")
    @Min(value = 0, message = "Latência Lua não pode ser negativa")
    private Integer latenciaLuaMs;

    @NotBlank(message = "Status é obrigatório")
    @Size(max = 20, message = "Status deve ter no máximo 20 caracteres")
    private String status;

    @NotNull(message = "Vazão é obrigatória")
    @Min(value = 1, message = "Vazão deve ser de pelo menos 1 kbps")
    private Integer vazaoKbps;

    public RequisicaoNo() {
    }

    public RequisicaoNo(String nome, Integer latenciaTerraMs, Integer latenciaLuaMs, String status, Integer vazaoKbps) {
        this.nome = nome;
        this.latenciaTerraMs = latenciaTerraMs;
        this.latenciaLuaMs = latenciaLuaMs;
        this.status = status;
        this.vazaoKbps = vazaoKbps;
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
}
