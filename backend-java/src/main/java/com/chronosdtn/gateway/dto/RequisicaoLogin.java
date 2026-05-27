package com.chronosdtn.gateway.dto;

import jakarta.validation.constraints.NotBlank;

public class RequisicaoLogin {

    @NotBlank(message = "Username é obrigatório")
    private String username;

    @NotBlank(message = "Password é obrigatória")
    private String password;

    public RequisicaoLogin() {
    }

    public RequisicaoLogin(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
