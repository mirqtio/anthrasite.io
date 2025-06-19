Use TDD and BDD with browser based e2e tests for validation that requirements are met.
Proper CI/CD should be configured and used with each feature fully tests, issues resolved, and merged to main before moving on to the next feature.
Final dev acceptance includes a full assessment of the codebase against requirements to ensure successfull deliver, running of the comprehensive test suite including browser based e2e test for all features and functions, and confirmation that everything runs green.
Ask if there are any unclear or ambiguous points. Do not make assumptions. Do not work around requirements.
Contniue until the entire plan is completed and verified to be working as expected.
When a CI failure occurs, download the complete log archive and save it to /CI_logs in the root of the project folder. Then review every log, document every issue, create a plan to resolve every issue, and implement that plan.
Use pre-commit hooks to catch most CI test issues.
Ensure the local Docker test environment matches CI exectly.
Use the local Docker test environment before merging to main.
If tests pass locally, but fail in CI, then local or CI needs to be modified because they are not precisely aligned.
