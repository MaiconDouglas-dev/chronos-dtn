package com.chronosdtn.gateway.service;

import com.chronosdtn.gateway.dto.RequisicaoPacoteDtn;
import com.chronosdtn.gateway.model.PacoteDtn;
import com.chronosdtn.gateway.model.Operador;
import com.chronosdtn.gateway.repository.PacoteDtnRepository;
import com.chronosdtn.gateway.repository.OperadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ServicoFilaDtn {

    private final PacoteDtnRepository pacoteDtnRepository;
    private final OperadorRepository operadorRepository;

    public ServicoFilaDtn(PacoteDtnRepository pacoteDtnRepository, OperadorRepository operadorRepository) {
        this.pacoteDtnRepository = pacoteDtnRepository;
        this.operadorRepository = operadorRepository;
    }

    @Transactional
    public PacoteDtn criarPacote(RequisicaoPacoteDtn request) {
        Operador operador = operadorRepository.findById(request.getOperadoraId())
                .orElseThrow(() -> new IllegalArgumentException("Operadora não encontrada com o ID: " + request.getOperadoraId()));

        PacoteDtn pacote = new PacoteDtn();
        pacote.setOperador(operador);
        pacote.setMetadataPacote(request.getMetadataPacote());
        pacote.setTamanhoKb(request.getTamanhoKb());
        if (request.getStatusTransmissao() != null) {
            pacote.setStatusTransmissao(request.getStatusTransmissao());
        }
        if (request.getTentativas() != null) {
            pacote.setTentativas(request.getTentativas());
        }
        pacote.setCriadoEmUs(request.getCriadoEmUs());

        return pacoteDtnRepository.save(pacote);
    }

    @Transactional
    public PacoteDtn atualizarStatus(Long id, String status, Integer tentativas) {
        PacoteDtn pacote = pacoteDtnRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pacote DTN não encontrado com o ID: " + id));

        pacote.setStatusTransmissao(status);
        if (tentativas != null) {
            pacote.setTentativas(tentativas);
        }

        return pacoteDtnRepository.save(pacote);
    }

    public List<PacoteDtn> obterTodosPacotes() {
        return pacoteDtnRepository.findAll();
    }

    public Optional<PacoteDtn> obterPacotePorId(Long id) {
        return pacoteDtnRepository.findById(id);
    }
}
