Feature: UTM validation API returns expected statuses
  Scenario: Valid token returns 200 with price + business context
    When I call "GET /api/validate-utm?utm=<valid>"
    Then the response status is 200
    And the JSON includes "price" and "business_id"

  Scenario: Tampered token returns 4xx
    When I call "GET /api/validate-utm?utm=<tampered>"
    Then the response status is 400 or 401

  Scenario: Expired token returns 4xx
    When I call "GET /api/validate-utm?utm=<expired>"
    Then the response status is 400 or 401
