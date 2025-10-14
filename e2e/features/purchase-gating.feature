Feature: Purchase page requires valid UTM
  Scenario: Valid UTM shows purchase page
    When I visit "/purchase?utm=<valid>"
    Then I see purchase content
    And I see a checkout button

  Scenario: Missing UTM redirects to homepage
    When I visit "/purchase"
    Then I am on "/"

  Scenario: Tampered UTM redirects to homepage
    When I visit "/purchase?utm=<tampered>"
    Then I am on "/"

  Scenario: Expired UTM redirects to homepage
    When I visit "/purchase?utm=<expired>"
    Then I am on "/"
