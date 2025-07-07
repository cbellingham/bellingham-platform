package com.bellingham.datafutures.controller;

import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.repository.ForwardContractRepository;
import com.bellingham.datafutures.repository.UserRepository;
import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.service.PdfService;
import java.time.LocalDate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/contracts")
public class ForwardContractController {

    @Autowired
    private ForwardContractRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PdfService pdfService;

    private void updateExpiredContracts() {
        LocalDate today = LocalDate.now();
        List<ForwardContract> contracts = repository.findAll();
        for (ForwardContract contract : contracts) {
            LocalDate delivery = contract.getDeliveryDate();
            if (delivery != null && delivery.isBefore(today)) {
                String status = contract.getStatus();
                if ("Available".equalsIgnoreCase(status)) {
                    contract.setStatus("Void");
                    repository.save(contract);
                } else if ("Purchased".equalsIgnoreCase(status)) {
                    contract.setStatus("Delivered");
                    repository.save(contract);
                }
            }
        }
    }

    @GetMapping
    public List<ForwardContract> getAll() {
        updateExpiredContracts();
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ForwardContract> getById(@PathVariable Long id) {
        updateExpiredContracts();
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().<ForwardContract>build());
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        return repository.findById(id)
                .map(contract -> {
                    try {
                        byte[] bytes = pdfService.generateContractPdf(contract);
                        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
                        headers.setContentDisposition(org.springframework.http.ContentDisposition
                                .attachment()
                                .filename("contract-" + id + ".pdf")
                                .build());
                        return new org.springframework.http.ResponseEntity<>(bytes, headers, org.springframework.http.HttpStatus.OK);
                    } catch (java.io.IOException e) {
                        return org.springframework.http.ResponseEntity.internalServerError().<byte[]>build();
                    }
                })
                .orElse(org.springframework.http.ResponseEntity.notFound().<byte[]>build());
    }

    @PostMapping
    public ForwardContract create(@RequestBody ForwardContract contract) {
        contract.setStatus("Available");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByUsername(username).ifPresent(user -> fillSellerDetails(contract, user));

        return repository.save(contract);
    }

    private void fillSellerDetails(ForwardContract contract, User user) {
        contract.setSeller(user.getLegalBusinessName());
        contract.setLegalBusinessName(user.getLegalBusinessName());
        contract.setName(user.getName());
        contract.setCountryOfIncorporation(user.getCountryOfIncorporation());
        contract.setTaxId(user.getTaxId());
        contract.setCompanyRegistrationNumber(user.getCompanyRegistrationNumber());
        contract.setPrimaryContactName(user.getPrimaryContactName());
        contract.setPrimaryContactEmail(user.getPrimaryContactEmail());
        contract.setPrimaryContactPhone(user.getPrimaryContactPhone());
        contract.setTechnicalContactName(user.getTechnicalContactName());
        contract.setTechnicalContactEmail(user.getTechnicalContactEmail());
        contract.setTechnicalContactPhone(user.getTechnicalContactPhone());
        contract.setCompanyDescription(user.getCompanyDescription());
    }

    @GetMapping("/available")
    public List<ForwardContract> getAvailable() {
        updateExpiredContracts();
        return repository.findByStatus("Available");
    }

    @GetMapping("/purchased")
    public List<ForwardContract> getPurchased() {
        updateExpiredContracts();
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return repository.findByStatusAndBuyerUsername("Purchased", username);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ForwardContract> update(@PathVariable Long id, @RequestBody ForwardContract updated) {
        return repository.findById(id)
                .map(existing -> {
                    updated.setId(id);
                    ForwardContract saved = repository.save(updated);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().<ForwardContract>build());
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

    @PostMapping("/{id}/buy")
    public ResponseEntity<ForwardContract> buy(@PathVariable Long id) {
        return repository.findById(id)
                .map(contract -> {
                    if (!"Available".equalsIgnoreCase(contract.getStatus())) {
                        return ResponseEntity.badRequest().<ForwardContract>build();
                    }
                    contract.setStatus("Purchased");
                    String username = org.springframework.security.core.context.SecurityContextHolder
                            .getContext().getAuthentication().getName();
                    contract.setBuyerUsername(username);
                    contract.setPurchaseDate(LocalDate.now());
                    ForwardContract saved = repository.save(contract);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().<ForwardContract>build());
    }

    @PostMapping("/{id}/list")
    public ResponseEntity<ForwardContract> listForSale(@PathVariable Long id) {
        return repository.findById(id)
                .map(contract -> {
                    String username = SecurityContextHolder.getContext().getAuthentication().getName();
                    userRepository.findByUsername(username).ifPresent(user -> fillSellerDetails(contract, user));
                    contract.setStatus("Available");
                    contract.setBuyerUsername(null);
                    contract.setPurchaseDate(null);
                    ForwardContract saved = repository.save(contract);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().<ForwardContract>build());
    }
}
