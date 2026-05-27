package com.chronosdtn.gateway.dto;

public class JWTResponse {

    private String token;
    private String type = "Bearer";

    public JWTResponse() {
    }

    public JWTResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
