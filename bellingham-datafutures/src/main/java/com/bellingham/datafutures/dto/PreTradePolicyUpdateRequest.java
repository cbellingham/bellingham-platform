package com.bellingham.datafutures.dto;

import com.bellingham.datafutures.model.AttestationStatus;

import java.time.LocalDateTime;
import java.util.Set;

public class PreTradePolicyUpdateRequest {

    private PreTradePolicyDto policy;
    private Set<String> requiredRoles;
    private Set<DataCategoryApprovalDto> dataCategoryApprovals;

    private AttestationStatus kycStatus;
    private String kycAttestedBy;
    private LocalDateTime kycAttestedAt;

    private AttestationStatus amlStatus;
    private String amlAttestedBy;
    private LocalDateTime amlAttestedAt;

    public PreTradePolicyDto getPolicy() {
        return policy;
    }

    public void setPolicy(PreTradePolicyDto policy) {
        this.policy = policy;
    }

    public Set<String> getRequiredRoles() {
        return requiredRoles;
    }

    public void setRequiredRoles(Set<String> requiredRoles) {
        this.requiredRoles = requiredRoles;
    }

    public Set<DataCategoryApprovalDto> getDataCategoryApprovals() {
        return dataCategoryApprovals;
    }

    public void setDataCategoryApprovals(Set<DataCategoryApprovalDto> dataCategoryApprovals) {
        this.dataCategoryApprovals = dataCategoryApprovals;
    }

    public AttestationStatus getKycStatus() {
        return kycStatus;
    }

    public void setKycStatus(AttestationStatus kycStatus) {
        this.kycStatus = kycStatus;
    }

    public String getKycAttestedBy() {
        return kycAttestedBy;
    }

    public void setKycAttestedBy(String kycAttestedBy) {
        this.kycAttestedBy = kycAttestedBy;
    }

    public LocalDateTime getKycAttestedAt() {
        return kycAttestedAt;
    }

    public void setKycAttestedAt(LocalDateTime kycAttestedAt) {
        this.kycAttestedAt = kycAttestedAt;
    }

    public AttestationStatus getAmlStatus() {
        return amlStatus;
    }

    public void setAmlStatus(AttestationStatus amlStatus) {
        this.amlStatus = amlStatus;
    }

    public String getAmlAttestedBy() {
        return amlAttestedBy;
    }

    public void setAmlAttestedBy(String amlAttestedBy) {
        this.amlAttestedBy = amlAttestedBy;
    }

    public LocalDateTime getAmlAttestedAt() {
        return amlAttestedAt;
    }

    public void setAmlAttestedAt(LocalDateTime amlAttestedAt) {
        this.amlAttestedAt = amlAttestedAt;
    }
}

