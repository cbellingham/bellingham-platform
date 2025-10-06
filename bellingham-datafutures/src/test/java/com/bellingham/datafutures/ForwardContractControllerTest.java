package com.bellingham.datafutures;

import com.bellingham.datafutures.controller.ForwardContractController;
import com.bellingham.datafutures.dto.ForwardContractCreateRequest;
import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.repository.ContractActivityRepository;
import com.bellingham.datafutures.repository.ForwardContractRepository;
import com.bellingham.datafutures.repository.UserRepository;
import com.bellingham.datafutures.service.NotificationService;
import com.bellingham.datafutures.service.PdfService;
import com.bellingham.datafutures.service.MarketDataService;
import com.bellingham.datafutures.service.MarketDataStreamService;
import com.bellingham.datafutures.service.SavedSearchService;
import com.bellingham.datafutures.security.JwtFilter;
import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.model.UserPermission;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ForwardContractController.class)
@AutoConfigureMockMvc(addFilters = false)
class ForwardContractControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ForwardContractRepository repository;
    @MockBean
    private UserRepository userRepository;
    @MockBean
    private PdfService pdfService;
    @MockBean
    private ContractActivityRepository activityRepository;
    @MockBean
    private NotificationService notificationService;
    @MockBean
    private MarketDataService marketDataService;
    @MockBean
    private MarketDataStreamService marketDataStreamService;
    @MockBean
    private SavedSearchService savedSearchService;
    @MockBean
    private JwtFilter jwtFilter;

    @Test
    void getAvailableContractsReturnsPage() throws Exception {
        ForwardContract contract = new ForwardContract();
        contract.setId(1L);
        contract.setTitle("Test Contract");
        given(repository.findByStatus(eq("Available"), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(contract)));

        mockMvc.perform(get("/api/contracts/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Contract"));
    }

    @Test
    void createContractValidatesAndMapsDto() throws Exception {
        ForwardContractCreateRequest request = new ForwardContractCreateRequest();
        request.setTitle("Contract");
        request.setPrice(BigDecimal.valueOf(150));
        request.setDeliveryDate(LocalDate.now().plusDays(5));
        request.setDeliveryFormat("Digital");
        request.setPlatformName("Platform");
        request.setDataDescription("Description");
        request.setEffectiveDate(LocalDate.now());
        request.setAgreementText("Agreement");
        request.setTermsFileName("terms.pdf");

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("seller", "pass"));
        given(userRepository.findByUsername("seller"))
                .willReturn(Optional.of(userWithPermissions("seller", UserPermission.SELL)));
        given(repository.save(any())).willAnswer(invocation -> {
            ForwardContract saved = invocation.getArgument(0);
            saved.setId(99L);
            return saved;
        });

        mockMvc.perform(post("/api/contracts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(99))
                .andExpect(jsonPath("$.status").value("Available"))
                .andExpect(jsonPath("$.creatorUsername").value("seller"))
                .andExpect(jsonPath("$.title").value("Contract"));
    }

    @Test
    void createContractRejectsInvalidPayload() throws Exception {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("seller", "pass"));

        mockMvc.perform(post("/api/contracts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        org.mockito.Mockito.verify(repository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void buyContractStoresSignatureWhenProvided() throws Exception {
        ForwardContract contract = new ForwardContract();
        contract.setId(1L);
        contract.setStatus("Available");
        contract.setTitle("Test Contract");
        contract.setCreatorUsername("seller");
        given(repository.findById(1L)).willReturn(java.util.Optional.of(contract));
        given(repository.save(any())).willAnswer(invocation -> invocation.getArgument(0));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("user", "pass"));
        given(userRepository.findByUsername("user"))
                .willReturn(Optional.of(userWithPermissions("user", UserPermission.BUY)));

        mockMvc.perform(post("/api/contracts/1/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"signature\":\"sig\"}"))
                .andExpect(status().isOk());

        org.junit.jupiter.api.Assertions.assertEquals("sig", contract.getBuyerSignature());
        org.mockito.Mockito.verify(notificationService)
                .notifyUser("seller", "Your contract Test Contract was purchased", 1L);
    }

    @Test
    void buyContractWithoutSignatureIsAllowed() throws Exception {
        ForwardContract contract = new ForwardContract();
        contract.setId(2L);
        contract.setStatus("Available");
        contract.setTitle("Second Contract");
        contract.setCreatorUsername("seller2");
        given(repository.findById(2L)).willReturn(java.util.Optional.of(contract));
        given(repository.save(any())).willAnswer(invocation -> invocation.getArgument(0));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("buyer", "pass"));
        given(userRepository.findByUsername("buyer"))
                .willReturn(Optional.of(userWithPermissions("buyer", UserPermission.BUY)));

        mockMvc.perform(post("/api/contracts/2/buy")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        org.junit.jupiter.api.Assertions.assertNull(contract.getBuyerSignature());
        org.mockito.Mockito.verify(notificationService)
                .notifyUser("seller2", "Your contract Second Contract was purchased", 2L);
    }

    @Test
    void buyingOwnContractIsForbidden() throws Exception {
        ForwardContract contract = new ForwardContract();
        contract.setId(3L);
        contract.setStatus("Available");
        contract.setTitle("Own Contract");
        contract.setCreatorUsername("owner");
        given(repository.findById(3L)).willReturn(java.util.Optional.of(contract));
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("owner", "pass"));
        given(userRepository.findByUsername("owner"))
                .willReturn(Optional.of(userWithPermissions("owner", UserPermission.BUY)));

        mockMvc.perform(post("/api/contracts/3/buy")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        org.mockito.Mockito.verify(repository, org.mockito.Mockito.never()).save(any());
        org.mockito.Mockito.verify(notificationService, org.mockito.Mockito.never()).notifyUser(any(), any(), any());
    }

    @Test
    void buyingContractWithoutBuyPermissionIsForbidden() throws Exception {
        ForwardContract contract = new ForwardContract();
        contract.setId(4L);
        contract.setStatus("Available");
        contract.setTitle("Restricted Contract");
        contract.setCreatorUsername("seller");
        given(repository.findById(4L)).willReturn(java.util.Optional.of(contract));
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("buyer", "pass"));
        given(userRepository.findByUsername("buyer"))
                .willReturn(Optional.of(userWithPermissions("buyer")));

        mockMvc.perform(post("/api/contracts/4/buy")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        org.mockito.Mockito.verify(repository, org.mockito.Mockito.never()).save(any());
        org.mockito.Mockito.verify(notificationService, org.mockito.Mockito.never()).notifyUser(any(), any(), any());
    }

    @Test
    void createContractWithoutSellPermissionIsForbidden() throws Exception {
        ForwardContractCreateRequest request = new ForwardContractCreateRequest();
        request.setTitle("Contract");
        request.setPrice(BigDecimal.valueOf(150));
        request.setDeliveryDate(LocalDate.now().plusDays(5));
        request.setDeliveryFormat("Digital");
        request.setPlatformName("Platform");
        request.setDataDescription("Description");
        request.setEffectiveDate(LocalDate.now());
        request.setAgreementText("Agreement");
        request.setTermsFileName("terms.pdf");

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("seller", "pass"));
        given(userRepository.findByUsername("seller"))
                .willReturn(Optional.of(userWithPermissions("seller")));

        mockMvc.perform(post("/api/contracts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        org.mockito.Mockito.verify(repository, org.mockito.Mockito.never()).save(any());
    }

    private User userWithPermissions(String username, UserPermission... permissions) {
        User user = new User();
        user.setUsername(username);
        EnumSet<UserPermission> set = EnumSet.noneOf(UserPermission.class);
        if (permissions != null) {
            for (UserPermission permission : permissions) {
                set.add(permission);
            }
        }
        user.setPermissions(set);
        return user;
    }
}
