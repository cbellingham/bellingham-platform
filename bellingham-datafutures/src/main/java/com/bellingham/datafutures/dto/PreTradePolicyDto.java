package com.bellingham.datafutures.dto;

public class PreTradePolicyDto {

    private String policyName;
    private String policyVersion;
    private Boolean requireKyc;
    private Boolean requireAml;
    private Boolean requireDataCategoryApproval;
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

    public Boolean getRequireKyc() {
        return requireKyc;
    }

    public void setRequireKyc(Boolean requireKyc) {
        this.requireKyc = requireKyc;
    }

    public Boolean getRequireAml() {
        return requireAml;
    }

    public void setRequireAml(Boolean requireAml) {
        this.requireAml = requireAml;
    }

    public Boolean getRequireDataCategoryApproval() {
        return requireDataCategoryApproval;
    }

    public void setRequireDataCategoryApproval(Boolean requireDataCategoryApproval) {
        this.requireDataCategoryApproval = requireDataCategoryApproval;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

