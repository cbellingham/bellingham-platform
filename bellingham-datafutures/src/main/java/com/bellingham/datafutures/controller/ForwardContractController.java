package com.bellingham.datafutures.controller;

import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.model.ContractActivity;
import com.bellingham.datafutures.model.SignatureRequest;
import com.bellingham.datafutures.repository.ContractActivityRepository;
import com.bellingham.datafutures.repository.ForwardContractRepository;
import com.bellingham.datafutures.repository.UserRepository;
import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.service.NotificationService;
import java.time.LocalDateTime;
import com.bellingham.datafutures.service.PdfService;
import java.time.LocalDate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;


@RestController
// Allow CORS from any host during development.
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequestMapping("/api/contracts")
public class ForwardContractController {

    @Autowired
    private ForwardContractRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private ContractActivityRepository activityRepository;

    @Autowired
    private NotificationService notificationService;

    private void logActivity(ForwardContract contract, String username, String action) {
        ContractActivity activity = new ContractActivity();
        activity.setContract(contract);
        activity.setUsername(username);
        activity.setAction(action);
        activity.setTimestamp(LocalDateTime.now());
        activityRepository.save(activity);
    }


    @GetMapping
    public Page<ForwardContract> getAll(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ForwardContract> getById(@PathVariable Long id) {
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
        contract.setCreatorUsername(username);
        userRepository.findByUsername(username).ifPresent(user -> fillSellerDetails(contract, user));

        ForwardContract saved = repository.save(contract);
        logActivity(saved, username, "Created contract");
        return saved;
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
    public Page<ForwardContract> getAvailable(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findByStatus("Available", pageable);
    }

    @GetMapping("/purchased")
    public Page<ForwardContract> getPurchased(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return repository.findByStatusAndBuyerUsername("Purchased", username, pageable);
    }

    @GetMapping("/my")
    public Page<ForwardContract> getMyContracts(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return repository.findByCreatorUsername(username, pageable);
    }

    @GetMapping("/sold")
    public Page<ForwardContract> getSoldContracts(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return repository.findByCreatorUsernameAndBuyerUsernameIsNotNull(username, pageable);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ForwardContract> update(@PathVariable Long id, @RequestBody ForwardContract updated) {
        return repository.findById(id)
                .map(existing -> {
                    updated.setId(id);
                    ForwardContract saved = repository.save(updated);
                    String username = SecurityContextHolder.getContext().getAuthentication().getName();
                    logActivity(saved, username, "Updated contract");
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().<ForwardContract>build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repository.findById(id)
                .map(contract -> {
                    String username = SecurityContextHolder.getContext().getAuthentication().getName();
                    repository.deleteById(id);
                    logActivity(contract, username, "Deleted contract");
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/buy")
    public ResponseEntity<ForwardContract> buy(@PathVariable Long id, @RequestBody SignatureRequest signature) {
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
                    contract.setBuyerSignature(signature.getSignature());
                    ForwardContract saved = repository.save(contract);
                    logActivity(saved, username, "Purchased contract");

                    String sellerUsername = contract.getCreatorUsername();
                    if (sellerUsername != null && !sellerUsername.equals(username)) {
                        String msg = "Your contract " + contract.getTitle() + " was purchased";
                        notificationService.notifyUser(sellerUsername, msg, contract.getId());
                    }

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().<ForwardContract>build());
    }

    @PostMapping("/{id}/list")
    public ResponseEntity<ForwardContract> listForSale(@PathVariable Long id,
                                                       @RequestBody(required = false) java.util.Map<String, Object> body) {
        return repository.findById(id)
                .map(contract -> {
                    String username = SecurityContextHolder.getContext().getAuthentication().getName();
                    userRepository.findByUsername(username).ifPresent(user -> fillSellerDetails(contract, user));
                    contract.setCreatorUsername(username);
                    contract.setStatus("Available");
                    contract.setBuyerUsername(null);
                    contract.setPurchaseDate(null);
                    if (body != null && body.containsKey("price")) {
                        try {
                            java.math.BigDecimal p = new java.math.BigDecimal(body.get("price").toString());
                            contract.setPrice(p);
                        } catch (Exception e) {
                            // ignore invalid price
                        }
                    }
                    ForwardContract saved = repository.save(contract);
                    logActivity(saved, username, "Listed for sale");
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().<ForwardContract>build());
    }

    @PostMapping("/{id}/closeout")
    public ResponseEntity<ForwardContract> closeOut(@PathVariable Long id) {
        return repository.findById(id)
                .map(contract -> {
                    String username = SecurityContextHolder.getContext().getAuthentication().getName();
                    String buyer = contract.getBuyerUsername();
                    boolean isCreator = username.equals(contract.getCreatorUsername());
                    boolean isBuyer = buyer != null && buyer.equals(username);
                    if ((buyer == null && isCreator) || isBuyer) {
                        contract.setStatus("Closed");
                        contract.setBuyerUsername(null);
                        contract.setPurchaseDate(null);
                        ForwardContract saved = repository.save(contract);
                        logActivity(saved, username, "Closed contract");
                        return ResponseEntity.ok(saved);
                    }
                    return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                            .<ForwardContract>build();
                })
                .orElse(ResponseEntity.notFound().<ForwardContract>build());
    }

    @GetMapping("/history")
    public Page<ForwardContract> getHistory(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return repository.findByStatusAndBuyerUsernameOrStatusAndCreatorUsername(
                "Closed",
                username,
                "Closed",
                username,
                pageable);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<java.util.List<ContractActivity>> getHistory(@PathVariable Long id) {
        return repository.findById(id)
                .map(contract -> ResponseEntity.ok(activityRepository.findByContractOrderByTimestampAsc(contract)))
                .orElse(ResponseEntity.notFound().build());
    }
}
