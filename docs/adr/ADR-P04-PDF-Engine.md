# ADR-P04: PDF Engine - Playwright Print-to-PDF (MVP)

**Status**: Decided

**Context**:
The final deliverable for the customer is a PDF report. We need a way to generate this PDF programmatically. Options include dedicated services like DocRaptor or using existing in-house tools.

**Decision**:
For the Minimum Viable Product (MVP), we will use **Playwright's built-in print-to-PDF** functionality. The `LeadShop` worker already has Playwright installed and configured for other tasks.

**Consequences**:

- **Pros**:
  - **No new dependencies**: Leverages existing infrastructure, reducing complexity and cost for the MVP.
  - **Fast to implement**: We can create a simple service wrapper around Playwright's PDF generation function quickly.
- **Cons**:
  - **Limited features**: May not handle complex layouts, page breaks, or advanced PDF features as well as a dedicated service.
  - **Scalability**: May become a bottleneck at high volume. We will plan to migrate to a service like DocRaptor if volume or feature requirements demand it.
