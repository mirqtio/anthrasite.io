# Anthrasite Admin Portal Guide

Welcome to the Anthrasite Admin Portal. This guide covers the essential workflows for managing leads, users, and system operations.

## 1. Access & Authentication

### Logging In

1.  Navigate to the portal URL (e.g., `https://anthrasite.io/login`).
2.  Enter your email and password.
3.  Click **Sign In**.

### Resetting Your Password

If you forget your password:

1.  Click the **"Forgot Password?"** link on the login page.
2.  Enter your email address and click **Send Reset Link**.
3.  Check your email for a "Reset Password" link.
4.  Click the link to set a new password (must be at least 8 characters).

### Setting Up a New Account

If you receive an invite email:

1.  Click the **"Accept Invite"** link in the email.
2.  You will be directed to a page to set your password.
3.  Enter your desired password (min 8 chars) and confirm it.
4.  You will be automatically logged in.

---

## 2. Dashboard Overview

Upon logging in, you will see the **Admin Dashboard**. This provides a high-level view of the system's status.

- **Navigation Bar**: Use the side menu to access different sections:
  - **Leads**: The master list of all leads.
  - **Pipeline**: Visual view of lead stages (if enabled).
  - **Settings**: System configuration (if enabled).
- **User Menu**: Click your avatar in the bottom left to **Sign Out**.

---

## 3. Managing Leads

The **Leads** section is the core of the portal.

### The Master List

- **View All**: See a paginated list of all leads.
- **Search**: Use the search bar to find leads by name, address, or ID.
- **Filter**: Use the filter dropdowns to narrow results by Status, City, State, or NAICS code.
- **Sort**: Click column headers to sort by Date, Status, etc.

### Adding a Lead

1.  Click the **"+ Add Lead"** button in the top right.
2.  Fill in the required fields:
    - **Business Name**
    - **Address** (Street, City, State, Zip)
    - **NAICS Code**
    - **Contact Info** (Optional but recommended)
3.  Click **Save**. The system will check for duplicates before creating the lead.

### Editing a Lead

1.  Click on any lead in the list to open the **Lead Details** view.
2.  Click the **"Edit"** button (pencil icon) next to the section you want to change.
3.  Update the information and click **Save**.

### Deleting a Lead

1.  In the Master List, click the **Actions** menu (three dots) for a lead.
2.  Select **Delete**.
3.  Confirm the deletion in the modal. **This action cannot be undone.**

### Bulk Actions

1.  Select multiple leads using the checkboxes on the left.
2.  A **Bulk Actions Toolbar** will appear at the bottom.
3.  Choose an action (e.g., "Delete", "Change Status").
4.  Confirm the action.

---

## 4. Lead Workflow & Reports

### Running Assessments

To generate a report for a lead:

1.  Open the **Lead Details** view.
2.  Click the **"Run Assessment"** or **"Generate Report"** button.
3.  The system will process the lead (this may take a few minutes).
4.  Once complete, the status will update to `REPORT_GENERATED`.

### Viewing Reports

1.  In the Lead Details view, look for the **"View Report"** button.
2.  Click it to open the generated PDF report in a new tab.

### Resending Emails

If a client didn't receive their report:

1.  Select the lead(s) in the Master List.
2.  Use the Bulk Actions toolbar to select **"Resend Email"**.

---

## 5. Troubleshooting

- **"System Offline"**: If you see this message, the backend processing system (Temporal) might be down. You can still view and edit leads, but new reports won't be generated until it's back online. Contact engineering support.
- **Login Issues**: Ensure you are using the correct email. If issues persist, use the "Forgot Password" flow.

---

_For further assistance, please contact the engineering team._
