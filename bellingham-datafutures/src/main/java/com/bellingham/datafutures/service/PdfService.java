package com.bellingham.datafutures.service;

import com.bellingham.datafutures.model.ForwardContract;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    public byte[] generateContractPdf(ForwardContract contract) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                stream.setLeading(14.5f);
                stream.beginText();
                stream.setFont(PDType1Font.TIMES_BOLD, 16);
                stream.newLineAtOffset(50, 750);
                stream.showText("Data Purchase Agreement");
                stream.newLine();
                stream.setFont(PDType1Font.TIMES_ROMAN, 12);
                stream.showText("Title: " + nullSafe(contract.getTitle()));
                stream.newLine();
                stream.showText("Seller: " + nullSafe(contract.getSeller()));
                stream.newLine();
                String buyer = contract.getBuyerUsername() == null ? "-" : contract.getBuyerUsername();
                stream.showText("Buyer: " + buyer);
                stream.newLine();
                stream.showText("Price: $" + contract.getPrice());
                stream.newLine();
                if (contract.getDeliveryDate() != null) {
                    String date = contract.getDeliveryDate().format(DateTimeFormatter.ISO_DATE);
                    stream.showText("Delivery Date: " + date);
                    stream.newLine();
                }
                stream.showText("Status: " + nullSafe(contract.getStatus()));
                stream.newLine();
                stream.newLine();
                stream.showText("Data Description:");
                stream.newLine();
                stream.setFont(PDType1Font.TIMES_ROMAN, 11);
                stream.showText(nullSafe(contract.getDataDescription()));
                stream.newLine();
                stream.newLine();
                stream.setFont(PDType1Font.TIMES_BOLD, 12);
                stream.showText("Agreement Text:");
                stream.setFont(PDType1Font.TIMES_ROMAN, 11);
                stream.newLine();
                for (String line : splitLines(contract.getAgreementText())) {
                    stream.showText(line);
                    stream.newLine();
                }
                stream.endText();
            }

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                document.save(out);
                return out.toByteArray();
            }
        }
    }

    private String[] splitLines(String text) {
        if (text == null) return new String[]{""};
        return text.split("\r?\n");
    }

    private String nullSafe(String str) {
        return str == null ? "" : str;
    }
}
