package com.chronosdtn.gateway.controller;

import com.chronosdtn.gateway.dto.NodeRequest;
import com.chronosdtn.gateway.model.SatelliteNode;
import com.chronosdtn.gateway.repository.SatelliteNodeRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nodes")
public class SatelliteNodeController {

    private final SatelliteNodeRepository satelliteNodeRepository;

    public SatelliteNodeController(SatelliteNodeRepository satelliteNodeRepository) {
        this.satelliteNodeRepository = satelliteNodeRepository;
    }

    @GetMapping
    public ResponseEntity<List<SatelliteNode>> getAllNodes() {
        return ResponseEntity.ok(satelliteNodeRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SatelliteNode> getNodeById(@PathVariable Long id) {
        return satelliteNodeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SatelliteNode> createNode(@Valid @RequestBody NodeRequest request) {
        SatelliteNode node = new SatelliteNode();
        node.setNome(request.getNome());
        node.setLatencyTerraMs(request.getLatencyTerraMs());
        node.setLatencyLuaMs(request.getLatencyLuaMs());
        node.setStatus(request.getStatus());
        node.setThroughputKbps(request.getThroughputKbps());
        
        SatelliteNode saved = satelliteNodeRepository.save(node);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SatelliteNode> updateNode(@PathVariable Long id, @Valid @RequestBody NodeRequest request) {
        return satelliteNodeRepository.findById(id)
                .map(node -> {
                    node.setNome(request.getNome());
                    node.setLatencyTerraMs(request.getLatencyTerraMs());
                    node.setLatencyLuaMs(request.getLatencyLuaMs());
                    node.setStatus(request.getStatus());
                    node.setThroughputKbps(request.getThroughputKbps());
                    SatelliteNode updated = satelliteNodeRepository.save(node);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable Long id) {
        if (satelliteNodeRepository.existsById(id)) {
            satelliteNodeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
