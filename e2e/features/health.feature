Feature: Site health
  Scenario: Health endpoint returns 200
    When I call "GET /api/health"
    Then the response status is 200

  Scenario: Homepage has no severe console errors
    When I open "/"
    Then there are no severe console errors
