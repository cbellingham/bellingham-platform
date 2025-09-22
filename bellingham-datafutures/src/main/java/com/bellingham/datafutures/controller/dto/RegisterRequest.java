package com.bellingham.datafutures.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank
    @Size(min = 12, max = 128, message = "Password must be between 12 and 128 characters")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[\\p{Punct}]).+$",
            message = "Password must include upper and lower case letters, a number, and a special character")
    private String password;

    @NotBlank
    @Size(max = 255, message = "Legal business name must be 255 characters or fewer")
    private String legalBusinessName;

    @NotBlank
    @Size(max = 255, message = "Contact name must be 255 characters or fewer")
    private String name;

    @NotBlank
    @Size(max = 100, message = "Country of incorporation must be 100 characters or fewer")
    private String countryOfIncorporation;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9-]{8,20}$", message = "Tax ID must be 8-20 alphanumeric characters or hyphens")
    private String taxId;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9-]{5,20}$",
            message = "Company registration number must be 5-20 alphanumeric characters or hyphens")
    private String companyRegistrationNumber;

    @NotBlank
    @Size(max = 255, message = "Primary contact name must be 255 characters or fewer")
    private String primaryContactName;

    @NotBlank
    @Email
    @Size(max = 255, message = "Primary contact email must be 255 characters or fewer")
    private String primaryContactEmail;

    @NotBlank
    @Pattern(regexp = "^\+?[0-9 .\-()]{7,20}$",
            message = "Primary contact phone must be a valid international phone number")
    private String primaryContactPhone;

    @NotBlank
    @Size(max = 255, message = "Technical contact name must be 255 characters or fewer")
    private String technicalContactName;

    @NotBlank
    @Email
    @Size(max = 255, message = "Technical contact email must be 255 characters or fewer")
    private String technicalContactEmail;

    @NotBlank
    @Pattern(regexp = "^\+?[0-9 .\-()]{7,20}$",
            message = "Technical contact phone must be a valid international phone number")
    private String technicalContactPhone;

    @Size(max = 2000, message = "Company description must be 2000 characters or fewer")
    private String companyDescription;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getLegalBusinessName() {
        return legalBusinessName;
    }

    public void setLegalBusinessName(String legalBusinessName) {
        this.legalBusinessName = legalBusinessName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCountryOfIncorporation() {
        return countryOfIncorporation;
    }

    public void setCountryOfIncorporation(String countryOfIncorporation) {
        this.countryOfIncorporation = countryOfIncorporation;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getCompanyRegistrationNumber() {
        return companyRegistrationNumber;
    }

    public void setCompanyRegistrationNumber(String companyRegistrationNumber) {
        this.companyRegistrationNumber = companyRegistrationNumber;
    }

    public String getPrimaryContactName() {
        return primaryContactName;
    }

    public void setPrimaryContactName(String primaryContactName) {
        this.primaryContactName = primaryContactName;
    }

    public String getPrimaryContactEmail() {
        return primaryContactEmail;
    }

    public void setPrimaryContactEmail(String primaryContactEmail) {
        this.primaryContactEmail = primaryContactEmail;
    }

    public String getPrimaryContactPhone() {
        return primaryContactPhone;
    }

    public void setPrimaryContactPhone(String primaryContactPhone) {
        this.primaryContactPhone = primaryContactPhone;
    }

    public String getTechnicalContactName() {
        return technicalContactName;
    }

    public void setTechnicalContactName(String technicalContactName) {
        this.technicalContactName = technicalContactName;
    }

    public String getTechnicalContactEmail() {
        return technicalContactEmail;
    }

    public void setTechnicalContactEmail(String technicalContactEmail) {
        this.technicalContactEmail = technicalContactEmail;
    }

    public String getTechnicalContactPhone() {
        return technicalContactPhone;
    }

    public void setTechnicalContactPhone(String technicalContactPhone) {
        this.technicalContactPhone = technicalContactPhone;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }
}
