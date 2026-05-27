package com.chronosdtn.gateway;

import com.chronosdtn.gateway.dto.RequisicaoPacoteDtn;
import com.chronosdtn.gateway.dto.RequisicaoLogin;
import com.chronosdtn.gateway.dto.RequisicaoNo;
import com.chronosdtn.gateway.dto.RequisicaoTransacao;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TesteIntegracaoGateway {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testeAutenticacaoObrigatoria() throws Exception {
        mockMvc.perform(get("/api/nos"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testeFluxoTrabalhoCompleto() throws Exception {
        // 1. Autenticar para obter um token
        RequisicaoLogin login = new RequisicaoLogin("operator", "password");
        MvcResult loginResult = mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String responseContent = loginResult.getResponse().getContentAsString();
        Map<?, ?> map = objectMapper.readValue(responseContent, Map.class);
        String token = "Bearer " + map.get("token");

        // 2. Ler nós existentes (devem estar pré-populados do data.sql)
        mockMvc.perform(get("/api/nos")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[0].nome", notNullValue()));

        // 3. Criar um novo nó (CRUD - Create)
        RequisicaoNo novoNo = new RequisicaoNo("LunaRelay-5 (Next Gen)", 1250, 4, "ONLINE", 150000);
        MvcResult nodeCreateResult = mockMvc.perform(post("/api/nos")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novoNo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome", is("LunaRelay-5 (Next Gen)")))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andReturn();

        Map<?, ?> createdNode = objectMapper.readValue(nodeCreateResult.getResponse().getContentAsString(), Map.class);
        Long nodeId = ((Number) createdNode.get("id")).longValue();

        // 4. Atualizar o nó criado (CRUD - Update)
        novoNo.setLatenciaTerraMs(1260);
        novoNo.setStatus("DEGRADED");
        mockMvc.perform(put("/api/nos/" + nodeId)
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novoNo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latenciaTerraMs", is(1260)))
                .andExpect(jsonPath("$.status", is("DEGRADED")));

        // 5. Criar um pacote DTN
        RequisicaoPacoteDtn novoPacote = new RequisicaoPacoteDtn(
                1L,
                "{\"bundle_id\":\"dtn://selene.luna/trans-005\",\"priority\":\"LOW\"}",
                new BigDecimal("10.50"),
                "QUEUED",
                0,
                1779900000000000L
        );
        MvcResult packageCreateResult = mockMvc.perform(post("/api/pacotes")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novoPacote)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.statusTransmissao", is("QUEUED")))
                .andReturn();

        Map<?, ?> createdPackage = objectMapper.readValue(packageCreateResult.getResponse().getContentAsString(), Map.class);
        Long packageId = ((Number) createdPackage.get("id")).longValue();

        // 6. Atualizar o status do pacote DTN
        mockMvc.perform(patch("/api/pacotes/" + packageId + "/status")
                        .header("Authorization", token)
                        .param("status", "IN_TRANSIT")
                        .param("tentativas", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusTransmissao", is("IN_TRANSIT")))
                .andExpect(jsonPath("$.tentativas", is(1)));

        // 7. Realizar uma Transação Audita Relativística e checar HATEOAS + Cálculo de Sincronização de Tempo
        // Supondo 10 dias após a época de referência (desvio esperado de 560 microssegundos)
        long tempoLunarBruto = 1779900000000000L + (10L * 86400000000L); // 10 dias em microssegundos
        RequisicaoTransacao requisicaoTransacao = new RequisicaoTransacao(
                1L,
                new BigDecimal("250.7500"),
                tempoLunarBruto,
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899" // hash único SHA-256
        );

        mockMvc.perform(post("/api/transacoes")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requisicaoTransacao)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.tempoLunarBrutoUs", is(tempoLunarBruto)))
                .andExpect(jsonPath("$.tempoTerraCorrigidoUs", is(tempoLunarBruto - 560L)))
                .andExpect(jsonPath("$.desvioMicrossegundos", is(560)))
                .andExpect(jsonPath("$.status", is("AUDITED")))
                .andExpect(jsonPath("$._links.self.href").isNotEmpty())
                .andExpect(jsonPath("$._links.transacoes.href").isNotEmpty())
                .andExpect(jsonPath("$._links.nos.href").isNotEmpty());

        // 8. Deletar o nó satélite criado (CRUD - Delete)
        mockMvc.perform(delete("/api/nos/" + nodeId)
                        .header("Authorization", token))
                .andExpect(status().isNoContent());
    }
}
