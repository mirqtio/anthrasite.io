# Runbook: Handling US Privacy Requests (CPRA & State Analogs)

**Contact Email**: privacy@anthrasite.io
**Response SLA**: Acknowledge within 10 business days. Fulfill within 45 calendar days (with a possible 45-day extension).

---

## Process for Handling a Data Request

This runbook covers the manual process for fulfilling data access, export, and deletion requests as required by CCPA and GDPR.

### 1. Verification

1.  **Receive Request**: A request is received via the API or at `privacy@anthrasite.io`.
2.  **Acknowledge Receipt**: Send an automated or manual reply confirming receipt, providing the `trackingId`, and stating the 45-day fulfillment SLA.
3.  **Verify Identity**: To prevent unauthorized data access, verify the user's identity based on their relationship with us:
    - **For Purchasers**: Cross-reference the requestor's email with the `Purchase` table. If a match is found, they are verified.
    - **For Waitlist/Newsletter Users**: Send a one-time verification link to the requestor's email. If they click the link, they are verified.
    - **If Unverifiable**: If no record is found or the verification link is not used, reply stating that their identity could not be verified and no action can be taken. Document this denial.

### 2. Fulfillment

#### For Data Access/Export Requests

1.  **Query Data**: For the verified user's email, query the following tables:
    - `Purchase`: All records associated with the user.
    - `Business`: The business record linked to the purchase.
    - `UtmToken`: Any tokens associated with the business.
2.  **Compile Report**: Consolidate the queried data into a human-readable JSON or CSV file.
3.  **Deliver Report**: Email the compiled report to the verified user.

#### For Data Deletion Requests

1.  **Identify Records**: For the verified user's email, identify all associated records in all relevant tables (`Purchase`, `Business`, `WaitlistEntry`, etc.), excluding records that must be kept for legal reasons (e.g., payment records for 7 years).
2.  **Execute Deletion**: Perform a soft or hard delete based on the documented data retention policy. At a minimum, anonymize personally identifiable information (PII).
    - **Example SQL (Anonymization)**:
      ```sql
      UPDATE "Business"
      SET name = 'DELETED USER',
          "reportData" = jsonb_set("reportData", '{email}', '"deleted@example.com"')
      WHERE id IN (SELECT "businessId" FROM "Purchase" WHERE email = 'user@example.com');
      ```
3.  **Confirm Deletion**: Once the data is deleted/anonymized, reply to the user confirming that their request has been completed.

### 3. Denial and Extension

- **Denial**: If a request is denied (e.g., unverifiable, duplicate, data is exempt), send a denial notification explaining the reason.
- **Extension**: If fulfillment will take longer than 45 days, notify the user before the initial deadline that a 45-day extension is being invoked, and provide the new deadline.

### 3. Logging

- **Log the Request**: Record the date, type of request (access/deletion), and date of fulfillment in a secure internal log for compliance auditing.
