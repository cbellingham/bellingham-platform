import React, { useState, useEffect, useContext } from "react";
import SignatureModal from "./SignatureModal";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from '../context';

const defaultAgreement = `Forward Data Sale Agreement (England & Wales Law)

Date: [Effective Date of Agreement]
1. Parties

Seller: [Full Name of Seller], a [individual/business entity type] with address at [Seller Address].
Buyer: [Full Name of Buyer], a [individual/business entity type] with address at [Buyer Address].
(Seller and Buyer may be referred to individually as a "Party" or collectively as the "Parties.")
2. Definitions

“Agreement” means this Forward Data Sale Agreement, including its schedules or appendices (if any).
“Data” means the financial trading data to be delivered under this Agreement, described as [Description of Data, including quantity, scope and any specific details].
“Price” means the total amount payable by Buyer for the Data, being [£[Amount] (plus VAT if applicable)].
“Delivery Date” (or “Delivery Deadline”) means the date by which Seller must deliver the Data to Buyer, which is [Delivery Date – e.g. 30/60/90 days or 1 year from the date of this Agreement].
“Delivery Format” means the format and method of delivery for the Data, agreed as [format and method, e.g. CSV file via secure cloud link, API access, etc.].
“Platform” means the online data marketplace platform [Platform Name] through which the Parties have entered into this Agreement and which will process payment settlement.
3. Sale of Data

3.1 Agreement to Sell and Purchase: The Seller hereby agrees to sell, and the Buyer agrees to purchase, the Data as defined above. The Data shall consist of the financial trading data described in this Agreement and must meet the description and quantity specified by the Buyer in the user-editable fields of this template. The sale includes all associated rights as specified in Section 9 (Intellectual Property Rights) below. 3.2 Forward Delivery Obligation: This Agreement is a forward contract for the sale of the Data. The Seller shall deliver the Data to the Buyer on or before the Delivery Date specified. Time is of the essence with respect to the Delivery Date – timely delivery is a fundamental condition of this Agreement. The Data will be delivered in the agreed Delivery Format via the method stipulated (for example, by providing API access credentials, secure download link, or physical media, as detailed for this transaction). 3.3 No Ongoing Obligations: Except for the forward delivery of the Data and any related support expressly agreed, the Seller has no continuing obligation to provide updates or future data beyond what is defined as the Data in this Agreement. The Buyer is purchasing the Data as a one-time deliverable under the terms herein.
4. Price and Payment

4.1 Price: The Buyer shall pay the Seller the Price of £[Amount] for the Data (the Price is [inclusive/exclusive] of any applicable VAT or sales taxes). If VAT or any similar tax is applicable, it shall be added to the Price and borne by the Buyer. 4.2 Payment Method: Payment of the Price shall be made through the Platform. The Buyer shall initiate payment via the Platform’s payment system [immediately upon signing / within ___ days of signing] this Agreement. The Platform will act as the payment intermediary to hold and release funds as per its terms. Settlement to the Seller will be conducted by the Platform, which shall release the payment to Seller once the Buyer confirms receipt and conformity of the Data (or as otherwise in accordance with the Platform’s standard transaction processes). 4.3 Escrow/Settlement: Unless otherwise agreed, the Platform may hold the Buyer’s payment in escrow or pending status until the Seller’s delivery obligation is fulfilled. Upon successful delivery and Buyer’s confirmation (or expiration of an acceptance period without dispute), the Platform will transfer the funds to the Seller’s account. In the event of a valid dispute over delivery or data quality, the Parties agree to abide by the Platform’s dispute resolution procedures (if any) in good faith, in addition to the mechanisms set out in this Agreement. 4.4 No Circumvention: The Parties agree that all payments shall be processed via the Platform as required. Neither Party shall seek to circumvent the Platform in making or receiving the payment for this transaction. Any fees charged by the Platform for facilitating the transaction (if applicable) shall be allocated as per the Platform’s terms of service or as agreed separately with the Platform.
5. Delivery of Data

5.1 Delivery Method and Deadline: The Seller shall deliver the Data to the Buyer no later than the Delivery Date. Delivery shall be made in the agreed Delivery Format, by the following method: [Specify delivery method, e.g. “via secure download link emailed to Buyer” or “by enabling API access to Buyer’s account”]. The Seller will bear any cost of delivery. Delivery is deemed completed when the Data (in the correct format and complete as per description) is made available to the Buyer in the agreed manner and the Buyer has access to it. 5.2 Buyer’s Acknowledgment of Delivery: The Buyer shall promptly acknowledge receipt of the Data through the Platform or in writing. The Buyer will inspect or test the delivered Data within [X] days of delivery and notify the Seller of any material discrepancy from the agreed description or any access issues. If no notice of issues is given within that inspection period (or by default within [7] days of delivery), the Data shall be deemed accepted, provided that this does not waive any warranty claims under Section 6. 5.3 Format and Quality: The Data delivered must conform to the description and quality standards set forth in this Agreement. The Seller shall ensure the Data is delivered in a usable condition and format, without corruption or errors introduced in transit. If the Data is delivered via electronic means, it shall be in a commonly readable digital format as specified (e.g. CSV, JSON, database file, etc.) and accessible with standard tools or as otherwise agreed. 5.4 Partial Delivery: Partial delivery of the Data is not permitted unless explicitly agreed by the Buyer in writing. The Seller shall deliver the entirety of the Data as described. If the Seller anticipates any need to deliver in batches or partial segments, the Seller must obtain the Buyer’s consent and coordinate a schedule, which shall still complete by the Delivery Date unless the Buyer agrees to an extension. 5.5 Assistance and Support: The Seller will provide reasonable cooperation during delivery. If the Data delivery involves enabling API access or transferring large files, the Seller shall give the Buyer any necessary instructions or credentials. The Seller will also be available for a reasonable period post-delivery to answer Buyer’s clarifying questions about accessing or using the delivered Data (this does not imply an obligation to provide ongoing services or updates).
6. Warranties and Representations

Each Party warrants that it has the legal right and authority to enter into this Agreement and to perform its obligations. In addition, the Seller makes the following specific warranties with respect to the Data being sold (the Buyer is entering this Agreement in reliance on these warranties):
Ownership and Rights: The Seller warrants that it is the owner of the Data or otherwise has full right, power, and authority to sell and transfer the Data to the Buyer. The Data and its delivery by Seller do not and will not infringe upon or violate any intellectual property rights, trade secrets, privacy rights, or other rights of any third party. Seller further warrants that no third-party consent or license is required for Buyer to use the Data as contemplated, or if required, such consent has been obtained and disclosed.
Accuracy and Completeness: The Seller warrants that the Data is accurate and complete as of the time of delivery, and matches the description provided. All factual information in the Data has been collected or generated using reasonable care, and the Seller has not knowingly included any false or misleading data. The Seller does not warrant any future performance or results derived from the Data, but confirms the Data itself is a true and unaltered record as described.
Quality and Format: The Seller warrants that the Data will be delivered in a format that is readable and standard as per Section 5. The Data will be free from viruses, malware, or malicious code. If the Data is structured (e.g. a database or dataset), it will be logically organized and not intentionally corrupted or unusable.
No Violation of Law: The Seller warrants that in collecting, compiling, and transferring the Data, it has complied with all applicable laws and regulations. If the Data contains any personal data or sensitive information, the Seller confirms that the data was lawfully obtained and that transfer to Buyer is lawful under data protection laws (e.g., UK Data Protection Act 2018 and UK GDPR, if applicable). The Data does not contain any information whose sale or transfer is prohibited by law.
No Encumbrances: The Data is free of any liens, security interests, or encumbrances. No rights in the Data have been previously assigned or licensed to any third party that would conflict with the Buyer’s rights under this Agreement (except as disclosed in writing in this Agreement). Seller has not entered into any other agreements that would prevent it from fulfilling its obligations here.
The Buyer warrants that it has provided accurate information regarding its identity and payment details and (if an entity) is duly organized and in good standing. The Buyer warrants that it is not under any legal disability or prohibition from entering this Agreement and that it is acquiring the Data for lawful purposes. Disclaimer: Except for the express warranties stated above, no other warranties are given by the Seller, express or implied. Any implied warranties or conditions (including any implied warranties of merchantability or fitness for a particular purpose) are hereby disclaimed to the fullest extent permitted by law. The Data is provided “as is” subject to the representations above, and the Buyer’s sole remedies for breach of warranty are as set out in this Agreement. The Seller does not guarantee that the Data will achieve any particular outcome or benefit for the Buyer, who will use the Data at its own risk after delivery.
7. Penalties for Non-Delivery or Late Delivery

7.1 Late Delivery: If the Seller fails to deliver all or any material portion of the Data by the Delivery Date (and such delay is not caused by the Buyer or the Platform or excused by a force majeure event under Section 12), then the Seller shall be liable to pay a late delivery fee to the Buyer as liquidated damages. The Parties agree that actual damages for delay would be difficult to determine and the following fee is a reasonable pre-estimate of the Buyer’s losses due to delay, and not a penalty. The late delivery fee shall be [£___] per day of delay (or __% of the Price per day of delay) beyond the Delivery Date, up to a maximum of [] days or [% of the Price]. This fee shall accrue automatically without prejudice to any other rights and remedies. 7.2 Extended Delay and Termination: If the Seller has not delivered the complete Data within [___] days after the Delivery Date (or if the Seller refuses to deliver or states it cannot deliver), the Buyer may at its option terminate this Agreement by written notice to the Seller. In the event of such termination for non-delivery, the following shall occur: (a) the Seller (or the Platform on Seller’s behalf) shall refund any amounts already paid by the Buyer for the Data, and (b) the Seller shall pay any accrued late delivery fees up to the date of termination (or the maximum liquidated damages as agreed, if applicable). The Buyer will have no obligation to accept delivery of the Data after the notice of termination due to Seller’s breach. Termination under this clause does not waive the Buyer’s right to claim any additional direct damages actually suffered due to the non-delivery, to the extent such damages are not fully compensated by the refunded Price and late fees (provided that the total damages recovered shall not exceed the legal limitations set in Section 12). 7.3 Partial Non-Delivery or Non-Conforming Delivery: If the Seller delivers the Data by the deadline but a portion of the Data is missing or materially non-conforming to the agreed description, the Buyer may, at its discretion, treat this as a breach akin to late delivery. The Buyer may allow the Seller a short cure period to provide the missing data or correct the issue, or may invoke the remedies in this Section (including applying late fees for the period until full conforming delivery, or terminating and obtaining refund) if the issue is significant and not cured promptly. The Parties shall cooperate in good faith to resolve any such issues, but the Buyer’s rights hereunder are reserved. 7.4 Exclusive Remedy for Delay: The Parties agree that the liquidated damages (late fees) set out in this Section 7 are the exclusive financial remedy for the Buyer due to mere delay in delivery (without prejudice to the Buyer’s right to terminate and obtain refund as provided above). Such late fees, if paid, shall be deducted from or set off against the Price payable (if Buyer has not paid yet) or shall be paid by Seller to Buyer (if Buyer already paid). This Section does not limit the Buyer’s remedies for other breaches (for example, breach of warranty or confidentiality) unrelated to delayed delivery. 7.5 Buyer’s Delay: If the Buyer fails to perform any obligation necessary for delivery (for example, failing to provide access or information the Seller reasonably requires to deliver the Data), then the Seller shall notify the Buyer and the Parties will mutually agree on adjusting the Delivery Date or other affected terms. In such case, Seller shall not be liable for delay for the period attributable to Buyer’s failure. If the Platform or any external system delays the delivery (through no fault of Seller), the Seller will likewise not be responsible for such delay, provided Seller promptly notifies Buyer.
8. Confidentiality

8.1 Confidential Information Defined: For purposes of this Agreement, “Confidential Information” means any non-public or proprietary information disclosed by one Party (“Disclosing Party”) to the other Party (“Receiving Party”) in connection with this Agreement that is identified as confidential or would reasonably be understood to be confidential given the nature of the information and the context of disclosure. Confidential Information includes, without limitation, the Data (before or until it is made available to the Buyer as agreed), any non-public details about the Data’s composition or source, the terms of this Agreement (including Price), and any business plans, trade secrets, know-how or technical information of the Disclosing Party learned by the Receiving Party in the course of this transaction. 8.2 Obligation of Confidentiality: The Receiving Party shall use the Confidential Information of the Disclosing Party solely for the purposes of performing this Agreement and shall not disclose such information to any third party except as permitted herein. The Receiving Party must treat the Disclosing Party’s Confidential Information with at least the same degree of care it uses to protect its own confidential information of similar importance, and at minimum with reasonable care. Each Party agrees to maintain the confidentiality of the other’s data and any transactional details. Specifically, the Buyer shall not disclose or provide the Data (or any analyses derived from it) to any third party (other than its own personnel or contractors bound by similar confidentiality obligations) without the Seller’s prior written consent, except for use internally as intended. Likewise, the Seller shall keep confidential any of Buyer’s sensitive information it learns (for example, Buyer’s plans for using the Data, or any of Buyer’s personal or financial info obtained through the Platform). 8.3 Exclusions: Information shall not be deemed Confidential Information to the extent that the Receiving Party can prove by written records that such information: (a) was already known to the Receiving Party without obligation of confidentiality prior to disclosure by the Disclosing Party; (b) is or becomes publicly available through no wrongful act or omission of the Receiving Party; (c) was rightfully received from a third party who did not require confidentiality; or (d) was independently developed by the Receiving Party without use of or reference to the Disclosing Party’s Confidential Information. 8.4 Permitted Disclosures: Notwithstanding the above, a Receiving Party may disclose Confidential Information if and to the extent required by law, regulation, or court order, provided that (unless prohibited by law) the Receiving Party gives prompt notice to the Disclosing Party to allow an opportunity to seek a protective order or other appropriate remedy. Also, the Receiving Party may disclose Confidential Information to its legal, financial, or professional advisors who have a need to know for purposes of this Agreement, so long as they are bound to confidentiality duties. 8.5 Duration: The obligations in this Section 8 shall commence on the Effective Date and continue for [___] years after the termination or completion of this Agreement, or indefinitely with respect to trade secrets, personal data, or other information that by law does not expire or lose its confidential nature. 8.6 Return or Destruction: Upon request of the Disclosing Party or upon fulfillment of this Agreement, the Receiving Party shall promptly return or destroy (at the Disclosing Party’s option) all materials embodying the Disclosing Party’s Confidential Information that are in the Receiving Party’s possession or control, except that the Buyer may retain the Data itself (since it is the subject of sale) and each Party may retain copies of Confidential Information for record-keeping or compliance purposes as required by law or internal policy, subject to continued confidentiality. 8.7 No Publicity: Neither Party shall issue any press release or public announcement about the specifics of this transaction, including identifying the other Party or describing the Data, without the prior written consent of the other (except to the extent required by law or regulatory authority, in which case the disclosing Party will use reasonable efforts to consult the other Party). 8.8 Injunctive Relief: Each Party acknowledges that unauthorized disclosure of the other’s Confidential Information may cause irreparable harm for which monetary damages may be inadequate. Accordingly, the aggrieved Party shall be entitled to seek injunctive relief (such as a court order to stop the disclosure) in addition to any other rights and remedies available at law or equity, in the event of any actual or threatened breach of this Section.
9. Intellectual Property Rights

9.1 Ownership of Data and IP Transfer: The Data (as described in Section 2) and all intellectual property rights therein (including any copyrights, database rights, and other proprietary rights) are, as of the Effective Date, owned by or licensed to the Seller. Upon full payment of the Price and successful delivery of the Data to the Buyer, the Seller hereby assigns and transfers to the Buyer all of its rights, title, and interest in and to the Data and any intellectual property rights embodied in the Data, to the fullest extent permissible. This transfer is outright and worldwide, and includes all rights to reproduce, distribute, modify, publish, or otherwise use the Data. The Buyer shall thereafter be the owner of the Data and its contents. 9.2 License Pending Payment: To the extent that under applicable law an assignment of copyright or certain rights must occur at a specific time or through a specific instrument, or if full payment is not made at or before delivery, the Seller agrees that from the time of delivery it grants to the Buyer an exclusive, irrevocable license to use the Data for any purpose, until such time as the assignment of rights becomes effective. Immediately upon Seller’s receipt of full payment, such license shall automatically expand into (or be replaced by) the full assignment of rights described in 9.1. 9.3 Moral Rights and Further Assurance: If any moral rights, artist’s rights, or similar rights apply to any portion of the Data (for example, if the Data includes original content protected by author’s rights), the Seller waives and agrees not to assert any such rights as against the Buyer or its successors and assigns, to the extent legally possible. The Seller shall, at the Buyer’s request and expense, execute and deliver any further documents reasonably necessary to perfect or record the transfer of intellectual property rights to the Buyer. 9.4 Seller’s Retained Rights (if any): [Optional: The Parties may specify here any rights the Seller retains or license-back to the Seller, if, for example, the Seller is only granting a license or the sale is non-exclusive. By default, the intent is that Buyer receives all rights exclusively. If the sale is non-exclusive – i.e., the Seller is permitted to continue using or selling the Data to others – it should be clearly indicated here by stating, for example: “Notwithstanding the above, the Buyer’s rights in the Data are non-exclusive, and the Seller retains the right to use and/or sell the Data to third parties.” If nothing is stated, the sale is assumed exclusive.] 9.5 Third-Party Materials: The Seller warrants (as part of Section 6) that the Data does not knowingly include third-party proprietary materials without authorization. In the event that the Data incorporates third-party content (for example, data from a third-party source or open data), the Seller shall identify such portions to the Buyer. Any third-party content that cannot be assigned will be provided under whatever license the Seller has or under standard terms. If any necessary third-party license requires the Buyer to comply with specific terms (such as attribution or restrictions), those terms will be provided in writing and the Buyer agrees to comply with them as a condition of use of that portion of the Data. 9.6 No Further Rights Reserved: Except as explicitly provided in this Agreement, the Seller retains no rights to the Data after delivery and shall not use or reproduce the Data thereafter (except to the extent Seller retained non-exclusive rights as may be noted in 9.4 above). The Seller acknowledges that after the transfer, any use of the Data by Seller (if not permitted under a retained license) would infringe the Buyer’s rights.
10. Transfer of Risk and Title

10.1 Risk of Loss: The risk of loss or damage to the Data remains with the Seller until the Data has been delivered to the Buyer in accordance with Section 5. If the Data or its medium is lost, corrupted, or damaged prior to delivery (for example, lost in transit or suffering a technical failure), the Seller is responsible for such loss and must re-deliver the Data at its own expense. Once delivery to the Buyer is complete (or deemed complete under this Agreement), all risk of loss, damage, or misuse of the Data passes to the Buyer. (In other words, after the Buyer has possession/control of the Data, the Seller is not liable for any deterioration or loss of the Data in the Buyer’s hands, except as may arise from breaches of warranty or other obligations herein.) 10.2 Title: Title to (and ownership of) the Data, including all copies of the Data (and any tangible media if used), shall pass from Seller to Buyer upon delivery of the Data and receipt by Seller of full payment of the Price. Until both delivery and payment have occurred, the Seller retains title to the Data. If payment is made before delivery, title will pass upon the moment of actual delivery; if delivery occurs before full payment, the Buyer receives possession of the Data but title remains conditionally with the Seller until payment is completed. After title passes to Buyer, the Seller will have no remaining ownership interest in the Data (subject to any specific terms in Section 9.4 if non-exclusive rights were retained). 10.3 Platform’s Role: The Parties acknowledge that the Platform may facilitate the transfer of the Data (for instance, through its file exchange or API tools) and the transfer of payment, but the Platform is not a party to this Agreement. The Platform’s involvement in delivery or payment does not affect the allocation of risk and title as between Seller and Buyer as set out above. The moment of delivery for purposes of risk and title is determined by the actions of Seller and Buyer (for example, when the Buyer downloads the file or when the Seller provides access credentials and the Buyer successfully uses them), not by the Platform’s internal status markers alone.
11. Dispute Resolution

11.1 Good Faith Negotiations: In the event of any dispute, claim, or controversy arising out of or relating to this Agreement or the transaction (a “Dispute”), the Parties shall first attempt to resolve it through good-faith negotiation. Either Party may initiate this process by giving written notice to the other Party describing the issue. The Parties shall discuss the matter and attempt to reach an amicable solution within [30] days from the date of such notice. 11.2 Mediation (Optional): [Optional clause: If the Parties are unable to resolve the Dispute by direct negotiation within 30 days, they may by mutual agreement attempt to resolve the Dispute through mediation. The mediation shall be administered by [mediator or mediation service] in [location] or via online forum, and the Parties will share the costs equally. Either Party may withdraw from mediation at any time after a good faith attempt.] 11.3 Governing Law and Jurisdiction: This Agreement is governed by and shall be construed in accordance with the laws of England and Wales, without regard to its conflict of laws principles. Subject to clause 11.4 below, the courts of England and Wales shall have exclusive jurisdiction to hear and determine any suit, action, or proceeding and to settle any Dispute which may arise out of or in connection with this Agreement. The Parties irrevocably submit to the jurisdiction of such courts. 11.4 Platform Dispute Process: If the Platform provides an internal dispute resolution or arbitration process for transactions, the Parties may choose to utilize that process for expediency. However, participation in the Platform’s process (or its outcome) will not prejudice a Party’s right to seek relief in the courts of England and Wales as stated. Any interim decision by the Platform can be made final by agreement of the Parties or otherwise the Parties retain the right to legal recourse. 11.5 Injunctive Relief and Interim Measures: Notwithstanding the foregoing negotiation requirements, either Party may seek interim or preliminary relief (such as an injunction) from a competent court at any time if necessary to protect its rights or Confidential Information, pending the final outcome of any dispute resolution process. 11.6 Continued Performance: Where reasonably possible, the Parties shall continue to perform their undisputed obligations under this Agreement while a dispute is being resolved, unless or until such performance is rendered impossible or is terminated in accordance with this Agreement.
12. General Provisions

12.1 Entire Agreement: This Agreement (including any schedules or attachments expressly incorporated) constitutes the entire agreement between the Buyer and Seller relating to the sale of the Data. It supersedes all prior or contemporaneous oral or written communications, proposals, representations, and agreements relating to its subject matter. Each Party acknowledges that, in entering into this Agreement, it does not rely on any statement, representation, warranty, or agreement not expressly set out in this Agreement. Nothing in this clause limits or excludes any liability for fraud or fraudulent misrepresentation. 12.2 Amendments: No modification or amendment of this Agreement shall be binding unless made in writing and signed (or agreed via the Platform with a clear affirmative action) by both Parties. This includes any change to the description of Data, Price, or Delivery Date – which should be agreed in writing (which can include electronic confirmation via the Platform messaging or contract amendment feature). 12.3 Assignment: Neither Party may assign or transfer any of its rights or obligations under this Agreement to any third party without the prior written consent of the other Party, except that (a) the Buyer may assign its rights (including the Data and associated rights) to an affiliate or successor in interest (such as a purchaser of Buyer’s business) after delivery, and (b) the Seller may assign the right to receive payment to a financing institution. Any attempted assignment in violation of this clause is void. This Agreement shall be binding upon and inure to the benefit of the Parties’ respective successors and permitted assigns. 12.4 Independent Contractors: The relationship of the Parties is that of independent contractors. Nothing in this Agreement is intended to, or shall be deemed to, establish any partnership, joint venture, agency, franchise, or employment relationship between the Parties. Neither Party has authority to act as agent for, or to bind, the other Party in any way. Each Party confirms it is acting on its own behalf and not for the benefit of any other person. 12.5 Third-Party Rights: A person who is not a Party to this Agreement (including any employees, subcontractors, agents, or users of either Party) has no rights to enforce any term of this Agreement under the Contracts (Rights of Third Parties) Act 1999. For avoidance of doubt, the Platform is not a Party to this Agreement and has no obligations or rights hereunder (except to the limited extent a clause expressly confers a benefit on the Platform, in which case the Parties can jointly vary or rescind that clause without the Platform’s consent). 12.6 Notices: Any notice or other communication required or permitted under this Agreement shall be in writing and shall be deemed given: (a) if delivered personally or by courier, on the date of delivery; (b) if sent by pre-paid recorded postal mail to the Party’s address specified above, on the second business day after posting (or fifth business day if international); or (c) if sent electronically, on the date of transmission provided no error or bounce-back was received. For electronic notices, the Parties may use the Platform’s messaging system or the email addresses associated with their accounts ([Seller Email] for Seller and [Buyer Email] for Buyer, or such other email as a Party designates). Notices related to breach, termination, or legal dispute should additionally be sent by email with confirmation of receipt or followed by a physical copy for good measure. 12.7 Force Majeure: Neither Party shall be liable for any failure or delay in performing its obligations (except payment obligations) if such failure or delay is due to unforeseeable events beyond that Party’s reasonable control (“Force Majeure”), including but not limited to natural disasters, acts of government, war, civil unrest, terrorist acts, strikes or labor disputes, failure of utility or telecommunications infrastructure, or widespread Internet outages. The affected Party shall notify the other as soon as possible of the Force Majeure event and make reasonable efforts to resume performance. If a Force Majeure event persists for more than [60] days, either Party may discuss termination or adjustment of this Agreement in good faith. Notwithstanding the foregoing, no Force Majeure shall excuse the Seller’s failure to have the Data already in existence (or properly backed up) prior to the event – for example, loss of the only copy of data might not be excused if proper backup practices would have prevented total loss. 12.8 Liability Limitations: Limitation of Liability: To the maximum extent permitted by law, neither Party shall be liable to the other for any indirect, special, incidental, or consequential damages, or for any loss of profits, loss of revenue, loss of business opportunity, or loss of data (after delivery) arising out of or in connection with this Agreement, even if advised of the possibility of such damages. Each Party’s total aggregate liability to the other for any and all claims arising under or related to this Agreement (whether in contract, tort (including negligence), misrepresentation or otherwise) is limited to the amount of the Price actually paid (and not refunded) under this Agreement. If no Price was paid (e.g., if all payments were refunded), then the Seller’s liability shall not exceed the value of the Price as set in this Agreement, and the Buyer’s liability shall not exceed an equivalent amount. 12.9 Liability Exceptions: Notwithstanding clause 12.8 above, nothing in this Agreement shall limit or exclude either Party’s liability for: (a) death or personal injury caused by its negligence (this is unlikely in a data contract, but included to meet legal requirements); (b) fraud or fraudulent misrepresentation; (c) breach of confidentiality or intellectual property infringement (for which remedies may include equitable relief beyond the contract’s price); or (d) any other liability which cannot be limited or excluded by law. Additionally, the above limitations shall not diminish the Buyer’s right to recover any payments made if the contract is rescinded, nor limit the Seller’s indemnity obligations (if any) under Section 6 or 9 for third-party claims. The Parties agree these limitations are reasonable given the Price of the Data. 12.10 Indemnity for Third-Party Claims: The Seller agrees to indemnify and hold harmless the Buyer against any third-party claims, liabilities, damages, or expenses (including reasonable legal fees) arising from: (i) any allegation that the Seller’s provision of the Data or the Buyer’s use of the Data (as permitted in this Agreement) infringes any intellectual property or proprietary rights of a third party, or (ii) Seller’s breach of any warranty in Section 6 (including any claim that the Data was collected or shared unlawfully). The Buyer shall promptly notify Seller of any such claim and permit the Seller to control the defense or settlement of it (provided the Seller’s counsel and strategy are reasonable and the Seller does not settle any claim in a way that imposes non-monetary obligations on Buyer without Buyer’s consent). The Buyer shall have the right to participate in the defense with counsel of its own choosing at its own expense. [The Parties may include additional indemnities, e.g., Buyer indemnifying Seller if Buyer’s use of Data violates law, depending on the situation.] 12.11 Severability: If any provision of this Agreement is held by a court of competent jurisdiction to be invalid, illegal, or unenforceable, that provision (or the offending part of it) shall be severed and the remaining provisions of this Agreement will remain in full force and effect. The Parties shall negotiate in good faith to amend such invalid provision to reflect the provision’s intent as closely as possible in a valid and enforceable manner. 12.12 No Waiver: No failure or delay by either Party in exercising any right, power, or remedy under this Agreement shall operate as a waiver of that right or remedy, nor shall any single or partial exercise of any right or remedy preclude any further exercise of it or the exercise of any other right or remedy. A waiver of any breach shall not be deemed a waiver of any subsequent breach of the same or any other provision. 12.13 Counterparts & Electronic Signature: This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same instrument. Signatures provided by electronic means (including through the Platform’s acceptance click-wrap or electronic signature service) are valid and binding with the same effect as original signatures. The Parties agree that this transaction may be conducted and signatures obtained electronically. 12.14 Contract Execution: Each person executing or accepting this Agreement represents that they have the full authority to bind the Party on whose behalf they are signing. If either Party is a company or organization, the individual accepting the terms hereby confirms that he/she is authorized to execute this Agreement on that entity’s behalf. 12.15 General Cooperation: The Parties agree to cooperate fully and execute any additional documents or take further actions as may be reasonably necessary to give full effect to the intent of this Agreement (for example, to record an IP transfer or to facilitate payment release via the Platform).
IN WITNESS WHEREOF, the Parties have executed this Forward Data Sale Agreement as of the date first written above by their duly authorized representatives:
<div style="display: flex; justify-content: space-between; margin-top: 2em; margin-bottom: 4em;">
<div>
 **Seller:**
 _Name: [Seller Name]_
 _Title/Capacity: [if applicable]_
 _Signature: _______________________
 _Date: _____________________ _
 </div>
 <div>
 **Buyer:**
 _Name: [Buyer Name]_
 _Title/Capacity: [if applicable]_
 _Signature: _______________________
 _Date: _____________________ _
 </div>
 </div>`;

const Sell = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [form, setForm] = useState({
        effectiveDate: "",
        sellerFullName: "",
        sellerEntityType: "",
        sellerAddress: "",
        buyerFullName: "",
        buyerEntityType: "",
        buyerAddress: "",
        deliveryDate: "",
        deliveryFormat: "",
        platformName: "",
        title: "",
        price: "",
        dataDescription: "",
        agreementText: defaultAgreement,
    });
    const [snippet, setSnippet] = useState(null);
    const [message, setMessage] = useState("");
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);
    const [selectedContractBids, setSelectedContractBids] = useState([]);
    const [bidsLoading, setBidsLoading] = useState(false);
    const [bidsFeedback, setBidsFeedback] = useState("");
    const [bidActionLoading, setBidActionLoading] = useState(null);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await api.get(`/api/contracts/my`);
                setContracts(res.data.content);
            } catch (err) {
                console.error(err);
                setError("Failed to load contracts.");
            }
        };
        fetchContracts();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSnippet(e.target.files[0]);
    };

    const [showSignature, setShowSignature] = useState(false);
    const [pendingData, setPendingData] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            title: form.title,
            deliveryDate: form.deliveryDate,
            deliveryFormat: form.deliveryFormat,
            platformName: form.platformName,
            price: parseFloat(form.price || 0),
            dataDescription: form.dataDescription,
            agreementText: form.agreementText,
            effectiveDate: form.effectiveDate,
            sellerFullName: form.sellerFullName,
            sellerEntityType: form.sellerEntityType,
            sellerAddress: form.sellerAddress,
            buyerFullName: form.buyerFullName,
            buyerEntityType: form.buyerEntityType,
            buyerAddress: form.buyerAddress,
        };
        if (snippet) {
            data.termsFileName = snippet.name;
        }
        setPendingData(data);
        setShowSignature(true);
    };

    const submitWithSignature = async (signature) => {
        try {
            const payload = { ...pendingData, sellerSignature: signature };
            await api.post(`/api/contracts`, payload);
            setMessage("✅ Data contract submitted!");
            setForm({
                effectiveDate: "",
                sellerFullName: "",
                sellerEntityType: "",
                sellerAddress: "",
                buyerFullName: "",
                buyerEntityType: "",
                buyerAddress: "",
                deliveryDate: "",
                deliveryFormat: "",
                platformName: "",
                title: "",
                price: "",
                dataDescription: "",
                agreementText: defaultAgreement,
            });
            setSnippet(null);
        } catch (err) {
            setMessage("❌ Submission failed.");
            console.error(err);
        } finally {
            setShowSignature(false);
            setPendingData(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const fetchBids = async (contractId) => {
        const res = await api.get(`/api/contracts/${contractId}/bids`);
        return res.data;
    };

    const handleViewBids = async (contract) => {
        setSelectedContract(contract);
        setBidsFeedback("");
        setBidsLoading(true);
        try {
            const bids = await fetchBids(contract.id);
            setSelectedContractBids(bids);
            if (bids.length === 0) {
                setBidsFeedback("No bids yet.");
            }
        } catch (err) {
            console.error(err);
            setSelectedContractBids([]);
            setBidsFeedback("Failed to load bids.");
        } finally {
            setBidsLoading(false);
        }
    };

    const handleAcceptBid = async (contractId, bidId) => {
        try {
            setBidActionLoading(bidId);
            await api.post(`/api/contracts/${contractId}/bids/${bidId}/accept`);
            setMessage("✅ Bid accepted.");
            const updatedBids = await fetchBids(contractId);
            setSelectedContractBids(updatedBids);
            if (updatedBids.length === 0) {
                setBidsFeedback("No bids remaining for this contract.");
            } else {
                setBidsFeedback("");
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Failed to accept bid.");
        } finally {
            setBidActionLoading(null);
        }
    };

    return (
        <>
        <Layout onLogout={handleLogout}>
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6">Sell Your Data Contract</h1>
                    {message && <p className="mb-4">{message}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <div>
                    <label>Effective Date</label>
                    <input
                        type="date"
                        name="effectiveDate"
                        value={form.effectiveDate}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Seller Full Name</label>
                    <input
                        type="text"
                        name="sellerFullName"
                        value={form.sellerFullName}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Seller Entity Type</label>
                    <input
                        type="text"
                        name="sellerEntityType"
                        value={form.sellerEntityType}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Seller Address</label>
                    <input
                        type="text"
                        name="sellerAddress"
                        value={form.sellerAddress}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Buyer Full Name</label>
                    <input
                        type="text"
                        name="buyerFullName"
                        value={form.buyerFullName}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Buyer Entity Type</label>
                    <input
                        type="text"
                        name="buyerEntityType"
                        value={form.buyerEntityType}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Buyer Address</label>
                    <input
                        type="text"
                        name="buyerAddress"
                        value={form.buyerAddress}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Delivery Date</label>
                    <input
                        type="date"
                        name="deliveryDate"
                        value={form.deliveryDate}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Ask Price ($)</label>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Data Description</label>
                    <input
                        type="text"
                        name="dataDescription"
                        value={form.dataDescription}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Delivery Format</label>
                    <input
                        type="text"
                        name="deliveryFormat"
                        value={form.deliveryFormat}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Platform Name</label>
                    <input
                        type="text"
                        name="platformName"
                        value={form.platformName}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Data Purchase Agreement</label>
                    <textarea
                        name="agreementText"
                        value={form.agreementText}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        rows="10"
                    />
                </div>
                <div>
                    <label>Upload Data Snippet</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        accept=".csv,.json,.txt"
                    />
                </div>
                <Button type="submit" variant="success">
                    Submit Contract
                </Button>
            </form>

            <h2 className="text-2xl font-bold mt-10 mb-4">My Contracts</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <table className="w-[90%] mx-auto table-auto border border-collapse border-gray-700 bg-gray-800 text-white shadow rounded">
                <thead>
                    <tr className="bg-gray-700 text-left">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Buyer</th>
                        <th className="border p-2">Ask Price</th>
                        <th className="border p-2">Delivery</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {contracts.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-600">
                            <td className="border p-2">{c.title}</td>
                            <td className="border p-2">{c.buyerUsername || "-"}</td>
                            <td className="border p-2">${c.price}</td>
                            <td className="border p-2">{c.deliveryDate}</td>
                            <td className="border p-2">{c.status}</td>
                            <td className="border p-2">
                                <Button
                                    className="px-2 py-1"
                                    onClick={() => handleViewBids(c)}
                                >
                                    View Bids
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedContract && (
                <div className="w-[90%] mx-auto mt-6 bg-gray-800 border border-gray-700 rounded shadow p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <h3 className="text-xl font-semibold">
                            Bids for {selectedContract.title}
                        </h3>
                        <Button
                            variant="ghost"
                            className="px-3 py-1"
                            onClick={() => {
                                setSelectedContract(null);
                                setSelectedContractBids([]);
                                setBidsFeedback("");
                            }}
                        >
                            Close
                        </Button>
                    </div>
                    {bidsLoading ? (
                        <p>Loading bids...</p>
                    ) : selectedContractBids.length > 0 ? (
                        <table className="w-full table-auto border border-collapse border-gray-700">
                            <thead>
                                <tr className="bg-gray-700 text-left">
                                    <th className="border p-2">Bidder</th>
                                    <th className="border p-2">Amount</th>
                                    <th className="border p-2">Status</th>
                                    <th className="border p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedContractBids.map((bid) => {
                                    const isPending =
                                        (bid.status || "").toLowerCase() === "pending";
                                    return (
                                        <tr key={bid.id} className="hover:bg-gray-700">
                                            <td className="border p-2">{bid.bidderUsername}</td>
                                            <td className="border p-2">${bid.amount}</td>
                                            <td className="border p-2 uppercase">{bid.status}</td>
                                            <td className="border p-2">
                                                <Button
                                                    variant="success"
                                                    className="px-3 py-1"
                                                    disabled={!isPending || bidActionLoading === bid.id}
                                                    onClick={() =>
                                                        handleAcceptBid(selectedContract.id, bid.id)
                                                    }
                                                >
                                                    {bidActionLoading === bid.id ? "Accepting..." : "Accept"}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p>{bidsFeedback || "No bids yet."}</p>
                    )}
                    {!bidsLoading && bidsFeedback && selectedContractBids.length > 0 && (
                        <p className="mt-3 text-sm text-gray-300">{bidsFeedback}</p>
                    )}
                </div>
            )}
        </main>
        </Layout>
        {showSignature && (
            <SignatureModal
                onConfirm={submitWithSignature}
                onCancel={() => setShowSignature(false)}
            />
        )}
        </>
    );
};

export default Sell;
