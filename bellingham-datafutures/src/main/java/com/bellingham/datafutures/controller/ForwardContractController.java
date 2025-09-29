package com.bellingham.datafutures.controller;

import com.bellingham.datafutures.dto.DataCategoryApprovalDto;
import com.bellingham.datafutures.dto.ForwardContractCreateRequest;
import com.bellingham.datafutures.dto.market.MarketSnapshot;
import com.bellingham.datafutures.dto.PreTradePolicyDto;
import com.bellingham.datafutures.dto.PreTradePolicyUpdateRequest;
import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.model.ContractActivity;
import com.bellingham.datafutures.model.SignatureRequest;
import com.bellingham.datafutures.model.DataCategoryApproval;
import com.bellingham.datafutures.model.PreTradePolicy;
import com.bellingham.datafutures.repository.ContractActivityRepository;
import com.bellingham.datafutures.repository.ForwardContractRepository;
import com.bellingham.datafutures.repository.UserRepository;
import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.service.MarketDataService;
import com.bellingham.datafutures.service.MarketDataStreamService;
import com.bellingham.datafutures.service.NotificationService;
import com.bellingham.datafutures.service.SavedSearchService;
import java.time.LocalDateTime;
import com.bellingham.datafutures.service.PdfService;
import java.time.LocalDate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;


@RestController
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

    @Autowired
    private MarketDataService marketDataService;

    @Autowired
    private MarketDataStreamService marketDataStreamService;

    @Autowired
    private SavedSearchService savedSearchService;

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
    public ForwardContract create(@Valid @RequestBody ForwardContractCreateRequest request) {
        ForwardContract contract = mapToContract(request);
        contract.setStatus("Available");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        contract.setCreatorUsername(username);
        userRepository.findByUsername(username).ifPresent(user -> fillSellerDetails(contract, user));

        ForwardContract saved = repository.save(contract);
        logActivity(saved, username, "Created contract");
        marketDataService.publishSnapshot();
        savedSearchService.notifyWatchers(saved);
        return saved;
    }

    private ForwardContract mapToContract(ForwardContractCreateRequest request) {
        ForwardContract contract = new ForwardContract();
        contract.setTitle(request.getTitle());
        contract.setPrice(request.getPrice());
        contract.setDeliveryDate(request.getDeliveryDate());
        contract.setDeliveryFormat(request.getDeliveryFormat());
        contract.setPlatformName(request.getPlatformName());
        contract.setDataDescription(request.getDataDescription());
        contract.setTermsFileName(request.getTermsFileName());
        contract.setAgreementText(request.getAgreementText());
        contract.setEffectiveDate(request.getEffectiveDate());
        contract.setSellerFullName(request.getSellerFullName());
        contract.setSellerEntityType(request.getSellerEntityType());
        contract.setSellerAddress(request.getSellerAddress());
        contract.setBuyerFullName(request.getBuyerFullName());
        contract.setBuyerEntityType(request.getBuyerEntityType());
        contract.setBuyerAddress(request.getBuyerAddress());
        contract.setSellerSignature(request.getSellerSignature());
        applyPreTradeConfiguration(contract, request.getPreTradePolicy(), request.getRequiredClearanceRoles(),
                request.getDataCategoryApprovals());
        return contract;
    }

    private void applyPreTradeConfiguration(ForwardContract contract,
                                            PreTradePolicyDto policyDto,
                                            Set<String> requiredRoles,
                                            Set<DataCategoryApprovalDto> approvals) {
        if (policyDto != null) {
            PreTradePolicy policy = contract.getPreTradePolicy();
            if (policy == null) {
                policy = new PreTradePolicy();
                contract.setPreTradePolicy(policy);
            }
            if (policyDto.getPolicyName() != null) {
                policy.setPolicyName(policyDto.getPolicyName());
            }
            if (policyDto.getPolicyVersion() != null) {
                policy.setPolicyVersion(policyDto.getPolicyVersion());
            }
            if (policyDto.getRequireKyc() != null) {
                policy.setRequireKyc(policyDto.getRequireKyc());
            }
            if (policyDto.getRequireAml() != null) {
                policy.setRequireAml(policyDto.getRequireAml());
            }
            if (policyDto.getRequireDataCategoryApproval() != null) {
                policy.setRequireDataCategoryApproval(policyDto.getRequireDataCategoryApproval());
            }
            if (policyDto.getNotes() != null) {
                policy.setNotes(policyDto.getNotes());
            }
        }

        if (requiredRoles != null) {
            contract.setRequiredClearanceRoles(new HashSet<>(requiredRoles));
        }

        if (approvals != null) {
            contract.setDataCategoryApprovals(mapApprovals(approvals));
        }
    }

    private Set<DataCategoryApproval> mapApprovals(Set<DataCategoryApprovalDto> approvals) {
        return approvals.stream()
                .filter(dto -> dto.getCategory() != null && !dto.getCategory().isBlank())
                .map(dto -> {
                    DataCategoryApproval approval = new DataCategoryApproval();
                    approval.setCategory(dto.getCategory());
                    if (dto.getStatus() != null) {
                        approval.setStatus(dto.getStatus());
                    }
                    approval.setAttestedBy(dto.getAttestedBy());
                    approval.setAttestedAt(dto.getAttestedAt());
                    approval.setNotes(dto.getNotes());
                    return approval;
                }).collect(Collectors.toCollection(HashSet::new));
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

    @GetMapping("/market")
    public MarketSnapshot getMarketSnapshot() {
        return marketDataService.getSnapshot();
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMarket() {
        SseEmitter emitter = marketDataStreamService.subscribe();
        marketDataService.sendSnapshot(emitter);
        return emitter;
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
                    String username = SecurityContextHolder.getContext().getAuthentication().getName();
                    if (!username.equals(existing.getCreatorUsername())) {
                        return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                                .<ForwardContract>build();
                    }

                    existing.setTitle(updated.getTitle());
                    existing.setPrice(updated.getPrice());
                    existing.setDeliveryDate(updated.getDeliveryDate());
                    existing.setDeliveryFormat(updated.getDeliveryFormat());
                    existing.setPlatformName(updated.getPlatformName());
                    existing.setDataDescription(updated.getDataDescription());
                    existing.setTermsFileName(updated.getTermsFileName());
                    existing.setAgreementText(updated.getAgreementText());
                    existing.setEffectiveDate(updated.getEffectiveDate());
                    existing.setSellerFullName(updated.getSellerFullName());
                    existing.setSellerEntityType(updated.getSellerEntityType());
                    existing.setSellerAddress(updated.getSellerAddress());
                    existing.setBuyerFullName(updated.getBuyerFullName());
                    existing.setBuyerEntityType(updated.getBuyerEntityType());
                    existing.setBuyerAddress(updated.getBuyerAddress());
                    existing.setSellerSignature(updated.getSellerSignature());

                    ForwardContract saved = repository.save(existing);
                    logActivity(saved, username, "Updated contract");
                    marketDataService.publishSnapshot();
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
                    marketDataService.publishSnapshot();
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/buy")
    public ResponseEntity<ForwardContract> buy(@PathVariable Long id,
                                               @RequestBody(required = false) SignatureRequest signature) {
        return repository.findById(id)
                .map(contract -> {
                    if (!"Available".equalsIgnoreCase(contract.getStatus())) {
                        return ResponseEntity.badRequest().<ForwardContract>build();
                    }
                    Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext()
                            .getAuthentication().getAuthorities();
                    Set<String> authorityNames = authorities.stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toSet());
                    if (!contract.canProgress(authorityNames)) {
                        return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                                .<ForwardContract>build();
                    }
                    contract.setStatus("Purchased");
                    String username = org.springframework.security.core.context.SecurityContextHolder
                            .getContext().getAuthentication().getName();
                    contract.setBuyerUsername(username);
                    contract.setPurchaseDate(LocalDate.now());
                    if (signature != null) {
                        contract.setBuyerSignature(signature.getSignature());
                    } else {
                        contract.setBuyerSignature(null);
                    }
                    ForwardContract saved = repository.save(contract);
                    logActivity(saved, username, "Purchased contract");

                    String sellerUsername = contract.getCreatorUsername();
                    if (sellerUsername != null && !sellerUsername.equals(username)) {
                        String msg = "Your contract " + contract.getTitle() + " was purchased";
                        notificationService.notifyUser(sellerUsername, msg, contract.getId());
                    }

                    marketDataService.publishSnapshot();
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().<ForwardContract>build());
    }

    @PatchMapping("/{id}/pre-trade-policy")
    public ResponseEntity<ForwardContract> updatePreTradePolicy(@PathVariable Long id,
                                                                @RequestBody PreTradePolicyUpdateRequest request) {
        return repository.findById(id)
                .map(contract -> {
                    String username = SecurityContextHolder.getContext().getAuthentication().getName();
                    Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext()
                            .getAuthentication().getAuthorities();
                    Set<String> authorityNames = authorities.stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toSet());
                    boolean isCreator = username.equals(contract.getCreatorUsername());
                    boolean hasComplianceRole = authorityNames.contains("ROLE_ADMIN")
                            || authorityNames.contains("ROLE_COMPLIANCE_OFFICER");

                    if (!isCreator && !hasComplianceRole) {
                        return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                                .<ForwardContract>build();
                    }

                    if (request.getPolicy() != null) {
                        applyPreTradeConfiguration(contract, request.getPolicy(), null, null);
                    }

                    if (request.getRequiredRoles() != null) {
                        contract.setRequiredClearanceRoles(new HashSet<>(request.getRequiredRoles()));
                    }

                    if (request.getDataCategoryApprovals() != null) {
                        contract.setDataCategoryApprovals(mapApprovals(request.getDataCategoryApprovals()));
                    }

                    if (request.getKycStatus() != null) {
                        contract.setKycStatus(request.getKycStatus());
                    }
                    if (request.getKycAttestedBy() != null) {
                        contract.setKycAttestedBy(request.getKycAttestedBy());
                    }
                    if (request.getKycAttestedAt() != null) {
                        contract.setKycAttestedAt(request.getKycAttestedAt());
                    }

                    if (request.getAmlStatus() != null) {
                        contract.setAmlStatus(request.getAmlStatus());
                    }
                    if (request.getAmlAttestedBy() != null) {
                        contract.setAmlAttestedBy(request.getAmlAttestedBy());
                    }
                    if (request.getAmlAttestedAt() != null) {
                        contract.setAmlAttestedAt(request.getAmlAttestedAt());
                    }

                    ForwardContract saved = repository.save(contract);
                    logActivity(saved, username, "Updated pre-trade policy");
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
                    if (!username.equals(contract.getCreatorUsername())) {
                        return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                                .<ForwardContract>build();
                    }
                    userRepository.findByUsername(username).ifPresent(user -> fillSellerDetails(contract, user));
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
                    marketDataService.publishSnapshot();
                    savedSearchService.notifyWatchers(saved);
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
                        marketDataService.publishSnapshot();
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
