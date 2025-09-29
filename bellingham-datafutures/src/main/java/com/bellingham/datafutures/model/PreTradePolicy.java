package com.bellingham.datafutures.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Defines configurable policy levers for the pre-trade compliance workflow.
 */
@Embeddable
public class PreTradePolicy {

    @Column(name = "policy_name")
    private String policyName = "default";

    @Column(name = "policy_version")
    private String policyVersion = "1.0";

    @Column(name = "require_kyc")
    private boolean requireKyc = false;

    @Column(name = "require_aml")
    private boolean requireAml = false;

    @Column(name = "require_data_approval")
    private boolean requireDataCategoryApproval = false;

    @Column(name = "policy_notes", length = 512)
    private String notes;

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public String getPolicyVersion() {
        return policyVersion;
    }

    public void setPolicyVersion(String policyVersion) {
        this.policyVersion = policyVersion;
    }

    public boolean isRequireKyc() {
        return requireKyc;
    }

    public void setRequireKyc(boolean requireKyc) {
        this.requireKyc = requireKyc;
    }

    public boolean isRequireAml() {
        return requireAml;
    }

    public void setRequireAml(boolean requireAml) {
        this.requireAml = requireAml;
    }

    public boolean isRequireDataCategoryApproval() {
        return requireDataCategoryApproval;
    }

    public void setRequireDataCategoryApproval(boolean requireDataCategoryApproval) {
        this.requireDataCategoryApproval = requireDataCategoryApproval;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

