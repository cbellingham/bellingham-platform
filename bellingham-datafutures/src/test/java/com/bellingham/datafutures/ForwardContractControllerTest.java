package com.bellingham.datafutures;

import com.bellingham.datafutures.controller.ForwardContractController;
import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.repository.ContractActivityRepository;
import com.bellingham.datafutures.repository.ForwardContractRepository;
import com.bellingham.datafutures.repository.UserRepository;
import com.bellingham.datafutures.service.NotificationService;
import com.bellingham.datafutures.service.PdfService;
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

import java.util.List;

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
    void buyContractStoresSignature() throws Exception {
        ForwardContract contract = new ForwardContract();
        contract.setId(1L);
        contract.setStatus("Available");
        contract.setTitle("Test Contract");
        contract.setCreatorUsername("seller");
        given(repository.findById(1L)).willReturn(java.util.Optional.of(contract));
        given(repository.save(any())).willAnswer(invocation -> invocation.getArgument(0));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("user", "pass"));

        mockMvc.perform(post("/api/contracts/1/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"signature\":\"sig\"}"))
                .andExpect(status().isOk());

        org.junit.jupiter.api.Assertions.assertEquals("sig", contract.getBuyerSignature());
        org.mockito.Mockito.verify(notificationService)
                .notifyUser("seller", "Your contract Test Contract was purchased", 1L);
    }
}
