package com.bellingham.datafutures;

import com.bellingham.datafutures.controller.ForwardContractController;
import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.repository.BidRepository;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
    private BidRepository bidRepository;
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
}
