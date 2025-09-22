package com.bellingham.datafutures.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ForwardContractCreateRequest {

    @NotBlank
    private String title;

    @NotNull
    private BigDecimal price;

    @NotNull
    private LocalDate deliveryDate;

    @NotBlank
    private String deliveryFormat;

    @NotBlank
    private String platformName;

    @NotBlank
    private String dataDescription;

    private String termsFileName;

    private String agreementText;

    @NotNull
    private LocalDate effectiveDate;

    private String sellerFullName;

    private String sellerEntityType;

    private String sellerAddress;

    private String buyerFullName;

    private String buyerEntityType;

    private String buyerAddress;

    private String sellerSignature;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getDeliveryFormat() {
        return deliveryFormat;
    }

    public void setDeliveryFormat(String deliveryFormat) {
        this.deliveryFormat = deliveryFormat;
    }

    public String getPlatformName() {
        return platformName;
    }

    public void setPlatformName(String platformName) {
        this.platformName = platformName;
    }

    public String getDataDescription() {
        return dataDescription;
    }

    public void setDataDescription(String dataDescription) {
        this.dataDescription = dataDescription;
    }

    public String getTermsFileName() {
        return termsFileName;
    }

    public void setTermsFileName(String termsFileName) {
        this.termsFileName = termsFileName;
    }

    public String getAgreementText() {
        return agreementText;
    }

    public void setAgreementText(String agreementText) {
        this.agreementText = agreementText;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public String getSellerFullName() {
        return sellerFullName;
    }

    public void setSellerFullName(String sellerFullName) {
        this.sellerFullName = sellerFullName;
    }

    public String getSellerEntityType() {
        return sellerEntityType;
    }

    public void setSellerEntityType(String sellerEntityType) {
        this.sellerEntityType = sellerEntityType;
    }

    public String getSellerAddress() {
        return sellerAddress;
    }

    public void setSellerAddress(String sellerAddress) {
        this.sellerAddress = sellerAddress;
    }

    public String getBuyerFullName() {
        return buyerFullName;
    }

    public void setBuyerFullName(String buyerFullName) {
        this.buyerFullName = buyerFullName;
    }

    public String getBuyerEntityType() {
        return buyerEntityType;
    }

    public void setBuyerEntityType(String buyerEntityType) {
        this.buyerEntityType = buyerEntityType;
    }

    public String getBuyerAddress() {
        return buyerAddress;
    }

    public void setBuyerAddress(String buyerAddress) {
        this.buyerAddress = buyerAddress;
    }

    public String getSellerSignature() {
        return sellerSignature;
    }

    public void setSellerSignature(String sellerSignature) {
        this.sellerSignature = sellerSignature;
    }
}
