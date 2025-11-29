# Unified Portal BDD Test Suite

This document defines a BDD-style test suite for the Unified Ops & Support Portal.

The tests are organized to focus **first on navigation** and then on **button-level functionality**, with the goal that **every button in the tool is explicitly exercised**.

---

## 1. Feature: Admin access control and navigation

```gherkin
Feature: Admin access control and navigation
  As an operations user
  I want protected admin routes and clear navigation
  So that only authorized staff can use the Unified Portal

  Background:
    Given the application is running

  Scenario: Anonymous user is redirected away from /admin
    Given I am not signed in
    When I navigate to "/admin/leads"
    Then I should be redirected to the login page

  Scenario: Authorized ops_admin sees admin navigation
    Given I am signed in as a user with role "ops_admin"
    When I navigate to "/admin/leads"
    Then I should see a navigation link labeled "Leads"
    And I should see a navigation link labeled "Pipeline"

  Scenario: Support user sees admin navigation
    Given I am signed in as a user with role "support"
    When I navigate to "/admin/leads"
    Then I should see a navigation link labeled "Leads"
    And I should see a navigation link labeled "Pipeline"

  Scenario: Navigate from Leads to Pipeline using nav button
    Given I am on the "Leads" admin page
    When I click the "Pipeline" navigation link
    Then I should be on the "Pipeline" admin page

  Scenario: Navigate from Pipeline back to Leads using nav button
    Given I am on the "Pipeline" admin page
    When I click the "Leads" navigation link
    Then I should be on the "Leads" admin page

  Scenario: Sign out via global control
    Given I am signed in and on any admin page
    When I click the "Sign out" button
    Then I should be redirected to the public site
    And I should no longer be authorized to access "/admin/leads"
```

---

## 2. Feature: Leads Master List navigation and selection

```gherkin
Feature: Leads Master List navigation and selection
  As an operations user
  I want to navigate and select leads from the Master List
  So that I can perform batch operations safely

  Background:
    Given I am signed in as a user with role "ops_admin"
    And I navigate to "/admin/leads"
    And the Master List shows at least one lead row

  Scenario: Open the leads page via nav
    When I click the "Leads" navigation link
    Then I should see the Master List of leads

  Scenario: Select a single lead using row checkbox
    When I click the checkbox for lead "Lead A"
    Then lead "Lead A" should be marked as selected
    And the selected count should be "1"

  Scenario: Toggle a selected lead off
    Given lead "Lead A" is selected
    When I click the checkbox for lead "Lead A" again
    Then lead "Lead A" should not be selected
    And the selected count should be "0"

  Scenario: Select all visible leads
    When I click the "Select all" checkbox
    Then all visible leads should be selected
    And the selected count should equal the number of visible leads

  Scenario: Deselect all via Select all checkbox
    Given all visible leads are selected
    When I click the "Select all" checkbox again
    Then no leads should be selected
    And the selected count should be "0"

  Scenario: Filter leads by search and apply filter button
    When I fill in "restaurant" into the "Search" field
    And I click the "Search" button
    Then the Master List should only show leads matching "restaurant"

  Scenario: Navigate to manual ingestion form
    When I click the "Add Manual Lead" button
    Then I should see the manual lead ingestion form
```

---

## 3. Feature: Batch Phase D generation from Master List

```gherkin
Feature: Batch Phase D generation from Master List
  As an operations user
  I want to trigger Phase D reports for selected leads
  So that I can generate premium reports in bulk

  Background:
    Given I am signed in as a user with role "ops_admin"
    And I am on the "Leads" admin page

  Scenario: Batch Phase D button disabled with no selection
    When no leads are selected
    Then the "Generate Premium Reports" button should be disabled

  Scenario: Batch Phase D button enabled when at least one lead is selected
    When I select lead "Lead A"
    Then the "Generate Premium Reports" button should be enabled

  Scenario: Trigger Phase D for fewer than 100 leads without confirm token
    Given 5 leads are selected
    When I click the "Generate Premium Reports" button
    Then I should not be prompted for a confirmation token
    And a batch Phase D workflow should be started for each eligible selected lead
    And I should see a success message indicating how many workflows were started

  Scenario: Prompt for confirmation token for large batch
    Given 150 leads are selected
    When I click the "Generate Premium Reports" button
    Then I should see a prompt asking me to type "CONFIRM" to proceed

  Scenario: Large batch cancelled when confirm token is incorrect
    Given 150 leads are selected
    And I click the "Generate Premium Reports" button
    And I type "CONF" into the confirmation input
    When I click the "Confirm" button in the dialog
    Then no workflows should be started
    And I should see a validation error about the incorrect token

  Scenario: Large batch proceeds when confirm token is correct
    Given 150 leads are selected
    And I click the "Generate Premium Reports" button
    And I type "CONFIRM" into the confirmation input
    When I click the "Confirm" button in the dialog
    Then a batch Phase D workflow should be started for each eligible selected lead
    And I should see a success message indicating how many workflows were started

  Scenario: Batch Phase D is idempotent for already-started leads
    Given leads "Lead A" and "Lead B" have already running Phase D workflows
    And those same leads are selected
    When I click the "Generate Premium Reports" button
    Then no duplicate workflows should be created
    And I should see a status message indicating those leads were already in progress
```

---

## 4. Feature: Per-lead premium report controls

```gherkin
Feature: Per-lead premium report controls
  As an operations user
  I want per-lead buttons for Phase D
  So that I can manage individual reports and repairs

  Background:
    Given I am signed in as a user with role "ops_admin"
    And I am on the "Leads" admin page
    And the Lead Control Panel is visible for lead "Lead A"

  Scenario: Generate Premium Report button enabled when memo is available
    Given lead "Lead A" has a latest run with a memo
    When I view the Lead Control Panel for "Lead A"
    Then the "Generate Premium Report" button should be enabled

  Scenario: Generate Premium Report starts workflow
    Given lead "Lead A" has a latest run with a memo
    When I click the "Generate Premium Report" button
    Then a Phase D workflow should be started for "Lead A"
    And the UI should show that Phase D is running for lead "Lead A"

  Scenario: Generate Premium Report gracefully handles existing workflow
    Given Phase D is already running for lead "Lead A"
    When I click the "Generate Premium Report" button
    Then no duplicate workflow should be started
    And I should see that Phase D is already running for lead "Lead A"

  Scenario: Regenerate PDF Only button triggers repair workflow
    Given lead "Lead A" has a completed Phase D with an existing memo
    When I click the "Regenerate PDF Only" button
    Then a repair workflow should be started for "Lead A"
    And the UI should indicate that a repair is in progress

  Scenario: Buttons disabled when no eligible run exists
    Given lead "Lead B" has no run with a memo
    When I view the Lead Control Panel for "Lead B"
    Then the "Generate Premium Report" button should be disabled
    And the "Regenerate PDF Only" button should be disabled
```

---

## 5. Feature: Manual lead ingestion form

```gherkin
Feature: Manual lead ingestion form
  As an operations user
  I want to add new leads manually
  So that I can ingest off-platform leads into the system

  Background:
    Given I am signed in as a user with role "ops_admin"
    And I am on the manual ingestion form

  Scenario: Submit button disabled with missing required fields
    When I leave all required fields blank
    Then the "Submit" button should be disabled or show validation errors

  Scenario: Successful manual lead ingestion
    When I fill in a valid URL in the "Website" field
    And I fill in required fields like "Business name"
    And I click the "Submit" button
    Then a new lead should be created
    And I should be redirected back to "/admin/leads"
    And I should see the new lead in the Master List

  Scenario: Dupe guard prevents duplicate lead
    Given a lead already exists for "https://example.com"
    When I enter "https://example.com" into the "Website" field
    And I click the "Submit" button
    Then the lead should not be duplicated
    And I should see an error message explaining the duplicate

  Scenario: Cancel button returns to Master List without creating lead
    When I click the "Cancel" button
    Then I should be redirected back to "/admin/leads"
    And no new lead should be created
```

---

## 6. Feature: Pipeline monitoring and controls

```gherkin
Feature: Pipeline monitoring and controls
  As an operations user
  I want to see worker health and refresh pipeline information
  So that I know whether Phase D can be safely triggered

  Background:
    Given I am signed in as a user with role "ops_admin"
    And I navigate to "/admin/pipeline"

  Scenario: Worker status beacon shows ONLINE
    Given the Temporal worker is healthy
    When I view the pipeline page
    Then the Worker status indicator should display "ONLINE"

  Scenario: Worker status beacon shows OFFLINE
    Given the Temporal worker is not reachable
    When I view the pipeline page
    Then the Worker status indicator should display "OFFLINE"

  Scenario: Manual refresh button reloads pipeline state
    When I click the "Refresh" button
    Then the worker status and pipeline metrics should be updated
```

---

## 7. Button coverage checklist

Use this checklist to ensure every button/CTA in the Unified Portal is covered by at least one scenario above. Update the list as new buttons are added.

- **Admin layout**

  - **Leads nav link** → covered by: Admin access Feature, "Navigate from Pipeline back to Leads"; Master List Feature, "Open the leads page via nav".
  - **Pipeline nav link** → covered by: Admin access Feature, "Navigate from Leads to Pipeline using nav button".
  - **Sign out** → covered by: Admin access Feature, "Sign out via global control".

- **Master List page**

  - **Row checkbox** → covered by: Master List Feature, "Select a single lead using row checkbox" and "Toggle a selected lead off".
  - **Select all** → covered by: Master List Feature, "Select all visible leads" and "Deselect all via Select all checkbox".
  - **Search / Filter button** → covered by: Master List Feature, "Filter leads by search and apply filter button".
  - **Add Manual Lead** → covered by: Master List Feature, "Navigate to manual ingestion form".
  - **Generate Premium Reports (batch)** → covered by: Batch Feature, all scenarios.

- **Lead Control Panel**

  - **Generate Premium Report** → covered by: Per-lead Feature, "Generate Premium Report button enabled when memo is available", "Generate Premium Report starts workflow", "Generate Premium Report gracefully handles existing workflow".
  - **Regenerate PDF Only** → covered by: Per-lead Feature, "Regenerate PDF Only button triggers repair workflow".

- **Manual Ingestion form**

  - **Submit** → covered by: Manual ingestion Feature, "Successful manual lead ingestion" and "Dupe guard prevents duplicate lead".
  - **Cancel** → covered by: Manual ingestion Feature, "Cancel button returns to Master List without creating lead".

- **Pipeline / Observability**
  - **Refresh** → covered by: Pipeline Feature, "Manual refresh button reloads pipeline state".

Update the scenarios and this checklist as the UI evolves to keep the "every button is tested" requirement true over time.

---

## 8. Feature: Unified Pipeline Actions Toolbar

```gherkin
Feature: Unified Pipeline Actions Toolbar
  As an operations user
  I want a single toolbar for lead actions
  So that I know exactly what step to take next

  Scenario: New Lead shows "Run Assessment"
    Given a lead in "New" state
    When I view the lead detail
    Then I should see the "Run Assessment" button as the primary action

  Scenario: Assessed Lead shows "Generate Report"
    Given a lead with "Phase C" completed
    When I view the lead detail
    Then I should see the "Generate Premium Report" button as the primary action

  Scenario: Completed Lead shows "View Report"
    Given a lead with "Phase D" completed
    When I view the lead detail
    Then I should see the "View Report" button as the primary action
    And I should see the "Regenerate" button as a secondary action
```

## 9. Feature: Bulk Ingestion Modal

```gherkin
Feature: Bulk Ingestion Modal
  As an operations user
  I want to paste a list of leads
  So that I can ingest multiple companies at once

  Scenario: Switch to Bulk Tab
    Given I am on the Ingest Modal
    When I click the "Bulk Paste" tab
    Then I should see a text area for CSV input

  Scenario: Submit Bulk List
    Given I have pasted 5 valid CSV lines
    When I click "Ingest Leads"
    Then 5 leads should be created
    And I should see a summary of successes and failures
```

## 10. Feature: Master List View Options

````gherkin
Feature: Master List View Options
  As an operations user
  I want to sort and filter the list
  So that I can find relevant leads quickly

  Scenario: Sort by Status
    When I click the "Status" column header
    Then the list should be sorted by status

  Scenario: Load More Leads
    Given there are 100 leads in the database
    And 50 are currently displayed
    When I click "Load More"
    Then I should see 100 leads in the list

## 11. Feature: Authentication Flow
```gherkin
Feature: Authentication Flow
  As a user
  I want to log in to the admin portal
  So that I can access protected resources

  Scenario: Successful Login
    Given I am on the login page
    When I enter valid credentials
    And I click "Sign In"
    Then I should be redirected to "/admin"
````

## 12. Feature: Repair Actions (Email Resend)

```gherkin
Feature: Repair Actions (Email Resend)
  As a support user
  I want to resend the report email
  So that I can help customers who missed the original email

  Scenario: Resend Email
    Given I am on the Lead Details page
    When I click "Resend Email"
    Then the email should be queued for sending
    And I should see a success toast
```

## 13. Feature: Bulk Assessment Trigger

```gherkin
Feature: Bulk Assessment Trigger
  As an ops user
  I want to trigger assessments for multiple leads
  So that I can process batches efficiently

  Scenario: Bulk Run Assessment
    Given I have selected 5 leads in the Master List
    When I click "Run Assessment" in the bulk toolbar
    Then a batch assessment workflow should be started
    And I should see a success message
```

```

```
