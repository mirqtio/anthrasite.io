Feature: Homepage is reachable and renders core content
  Scenario: Homepage loads
    When I visit "/"
    Then the page has title
    And I see the primary hero content
