package com.bellingham.datafutures.controller;

import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.repository.ForwardContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
public class ForwardContractController {

    @Autowired
    private ForwardContractRepository repository;

    @GetMapping
    public List<ForwardContract> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ForwardContract> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ForwardContract create(@RequestBody ForwardContract contract) {
        contract.setStatus("Available");
        return repository.save(contract);
    }

    @GetMapping("/available")
    public List<ForwardContract> getAvailable() {
        return repository.findByStatus("Available");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ForwardContract> update(@PathVariable Long id, @RequestBody ForwardContract updated) {
        return repository.findById(id)
                .map(existing -> {
                    updated.setId(id);
                    ForwardContract saved = repository.save(updated);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repository.findById(id)
                .map(contract -> {
                    repository.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
