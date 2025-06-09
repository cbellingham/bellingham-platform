// package com.bellingham.datafutures.controller;
//
// import com.bellingham.datafutures.model.Contract;
// import com.bellingham.datafutures.repository.ContractRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.multipart.MultipartFile;
//
// import java.util.*;
//
// @RestController
// @RequestMapping("/api")
// public class ContractController {
//
//     @Autowired
//     private ContractRepository contractRepository;
//
//     @PostMapping("/contracts")
//     public ResponseEntity<?> createContract(
//             @RequestParam String deliveryDate,
//             @RequestParam String type,
//             @RequestParam double price,
//             @RequestParam String size,
//             @RequestParam(required = false) MultipartFile snippet
//     ) {
//         Contract contract = new Contract();
//         contract.setTitle("Contract for " + type);
//         contract.setType(type);
//         contract.setDeliveryDate(deliveryDate);
//         contract.setPrice(price);
//         contract.setSize(size);
//
//         if (snippet != null && !snippet.isEmpty()) {
//             contract.setSnippetFilename(snippet.getOriginalFilename());
//         }
//
//         contractRepository.save(contract);
//
//         return ResponseEntity.ok(Map.of("message", "Contract created"));
//     }
//
//     @GetMapping("/contracts/available")
//     public ResponseEntity<List<Contract>> getAvailableContracts() {
//         return ResponseEntity.ok(contractRepository.findByStatus("Available"));
//     }
// }
