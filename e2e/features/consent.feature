Feature: Cookie consent basic behavior
  Scenario: First visit shows banner; accepting hides it
    Given I visit "/"
    Then I see the consent banner
    When I click "Accept all"
    Then the consent banner is not visible
