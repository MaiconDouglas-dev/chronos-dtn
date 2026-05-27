package com.chronosdtn.gateway;

import com.chronosdtn.gateway.dto.DtnPackageRequest;
import com.chronosdtn.gateway.dto.LoginRequest;
import com.chronosdtn.gateway.dto.NodeRequest;
import com.chronosdtn.gateway.dto.TransactionRequest;
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
public class GatewayIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testAuthenticationRequired() throws Exception {
        mockMvc.perform(get("/api/nodes"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testFullWorkflow() throws Exception {
        // 1. Authenticate to get a token
        LoginRequest login = new LoginRequest("operator", "password");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String responseContent = loginResult.getResponse().getContentAsString();
        Map<?, ?> map = objectMapper.readValue(responseContent, Map.class);
        String token = "Bearer " + map.get("token");

        // 2. Read existing nodes (should be pre-populated from data.sql)
        mockMvc.perform(get("/api/nodes")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[0].nome", notNullValue()));

        // 3. Create a new node (CRUD - Create)
        NodeRequest newNode = new NodeRequest("LunaRelay-5 (Next Gen)", 1250, 4, "ONLINE", 150000);
        MvcResult nodeCreateResult = mockMvc.perform(post("/api/nodes")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newNode)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome", is("LunaRelay-5 (Next Gen)")))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andReturn();

        Map<?, ?> createdNode = objectMapper.readValue(nodeCreateResult.getResponse().getContentAsString(), Map.class);
        Long nodeId = ((Number) createdNode.get("id")).longValue();

        // 4. Update the created node (CRUD - Update)
        newNode.setLatencyTerraMs(1260);
        newNode.setStatus("DEGRADED");
        mockMvc.perform(put("/api/nodes/" + nodeId)
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newNode)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latencyTerraMs", is(1260)))
                .andExpect(jsonPath("$.status", is("DEGRADED")));

        // 5. Create a DTN package
        DtnPackageRequest newPackage = new DtnPackageRequest(
                1L,
                "{\"bundle_id\":\"dtn://selene.luna/trans-005\",\"priority\":\"LOW\"}",
                new BigDecimal("10.50"),
                "QUEUED",
                0,
                1779900000000000L
        );
        MvcResult packageCreateResult = mockMvc.perform(post("/api/packages")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPackage)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.statusTransmissao", is("QUEUED")))
                .andReturn();

        Map<?, ?> createdPackage = objectMapper.readValue(packageCreateResult.getResponse().getContentAsString(), Map.class);
        Long packageId = ((Number) createdPackage.get("id")).longValue();

        // 6. Update status of the DTN package
        mockMvc.perform(patch("/api/packages/" + packageId + "/status")
                        .header("Authorization", token)
                        .param("status", "IN_TRANSIT")
                        .param("retries", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusTransmissao", is("IN_TRANSIT")))
                .andExpect(jsonPath("$.retries", is(1)));

        // 7. Perform an Audited Relativistic Transaction and check HATEOAS + Time Sync Calculation
        // Supposing 10 days after reference epoch (expected drift is 560 microseconds)
        long rawLunarTime = 1779900000000000L + (10L * 86400000000L); // 10 days in microseconds
        TransactionRequest transactionReq = new TransactionRequest(
                1L,
                new BigDecimal("250.7500"),
                rawLunarTime,
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899" // unique SHA-256
        );

        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transactionReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.tmLunarBruto", is(rawLunarTime)))
                .andExpect(jsonPath("$.tmTerraCorrigido", is(rawLunarTime - 560L)))
                .andExpect(jsonPath("$.desvioMicrossegundos", is(560)))
                .andExpect(jsonPath("$.status", is("AUDITED")))
                .andExpect(jsonPath("$._links.self.href").isNotEmpty())
                .andExpect(jsonPath("$._links.transactions.href").isNotEmpty())
                .andExpect(jsonPath("$._links.nodes.href").isNotEmpty());

        // 8. Delete the created satellite node (CRUD - Delete)
        mockMvc.perform(delete("/api/nodes/" + nodeId)
                        .header("Authorization", token))
                .andExpect(status().isNoContent());
    }
}
