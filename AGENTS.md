# AGENTS.md --- Backend Project Instructions

This file defines the working rules for AI coding agents contributing to
the **backend** of the Project Submission and Review Dashboard.

## 1. Operating Rules

-   Work only on the backend unless the user explicitly asks for changes
    elsewhere.
-   Read the existing repository structure, `package.json`, TypeScript
    configuration, Prisma schema, environment examples, and relevant
    modules before changing anything.
-   Follow established project conventions when they exist. Do not
    replace working patterns just to introduce a preferred architecture.
-   **Do not invent requirements, fields, endpoints, dependencies,
    business rules, or infrastructure. Ask the user before making an
    assumption that materially changes behavior or scope.**
-   Ask before adding "robust" or complex solutions that were not
    requested, including queues, caching layers, event buses,
    microservices, refresh-token systems, audit infrastructure, or extra
    roles.
-   If a requirement is ambiguous and blocks implementation, ask a
    concise clarification question. If it does not block the task,
    preserve the ambiguity and point it out rather than silently
    deciding.
-   Do not claim a feature is implemented or tested unless it actually
    is.
-   Never expose secrets, tokens, passwords, or full sensitive
    environment values in logs, generated documentation, or responses.
-   Do not overwrite user changes or perform destructive database, Git,
    or filesystem operations without explicit permission.
-   Prefer small, focused changes. Explain important assumptions and
    list files changed when finishing a task.

## 2. Backend Technology

Use the following stack unless the repository already establishes a
different choice or the user explicitly changes it:

-   Language: TypeScript
-   HTTP framework: Express.js
-   Runtime/package manager: Bun
-   Database: PostgreSQL
-   ORM: Prisma
-   API style: REST
-   Authentication: JWT-based authentication and role-based access
    control (RBAC)

Use the versions and scripts already declared in the repository. Do not
upgrade dependencies or introduce a new library without a reason; ask
before introducing a material dependency or architectural change.

## 3. Architecture and File Organization

Use a **module-based structure**. Each feature owns its routes,
controller, service, and validation. Keep cross-cutting concerns
separate from feature modules.

A suggested structure is shown below. Treat it as guidance, not
permission to create every directory or file immediately. Adapt it to
the existing repository and add only what the current task requires.

``` text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── users/
│   │   │   ├── users.route.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.validation.ts
│   │   ├── projects/
│   │   │   ├── projects.route.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   └── projects.validation.ts
│   │   ├── submissions/
│   │   │   ├── submissions.route.ts
│   │   │   ├── submissions.controller.ts
│   │   │   ├── submissions.service.ts
│   │   │   └── submissions.validation.ts
│   │   ├── reviews/
│   │   │   ├── reviews.route.ts
│   │   │   ├── reviews.controller.ts
│   │   │   ├── reviews.service.ts
│   │   │   └── reviews.validation.ts
│   │   └── mentor/
│   │       ├── mentor.route.ts
│   │       ├── mentor.controller.ts
│   │       ├── mentor.service.ts
│   │       └── mentor.validation.ts
│   ├── middleware/
│   ├── functions/
│   ├── lib/
│   ├── utils/
│   ├── types/
│   └── constants/
├── tests/
├── .env.example
├── package.json
└── AGENTS.md
```

### Module responsibilities

-   `*.route.ts`: Declare endpoints, attach validation and
    authentication/authorization middleware, and call the relevant
    controller. Keep business logic out of routes.
-   `*.controller.ts`: Read validated request inputs, invoke services,
    and format successful responses through `sendResponse`. Avoid
    database queries and business rules here.
-   `*.service.ts`: Implement business logic and Prisma access. Keep
    logic testable and independent of Express request/response objects
    where practical.
-   `*.validation.ts`: Define request-body, parameter, and query
    validation using the validation library already installed. If none
    exists, ask before adding one.
-   `middleware/`: Shared Express middleware such as authentication,
    role authorization, request validation, rate limiting, not-found
    handling, and error handling.
-   `functions/`: Reusable application-level functions that do not
    belong to one feature module. Do not use this directory as a
    miscellaneous dumping ground.
-   `lib/`: Shared configured clients and integrations, such as the
    Prisma client. Keep initialization centralized.
-   `utils/`: Small generic helpers with no feature-specific business
    rules.
-   `config/`: Environment parsing and application configuration.
-   `types/`: Shared TypeScript types and Express request augmentation
    when needed.
-   `constants/`: Shared constants and fixed configuration values that
    are not secrets.
-   `prisma/`: Database schema, migrations, and seed logic.

Do not create overlapping abstractions. For example, do not duplicate
the same helper in both `functions/` and `utils/`; choose one location
based on the repository's established convention.

## 4. API Response Contract

Use the following response helper and response shape consistently for
normal API responses:

``` ts
export const sendResponse = <T>(
  res: Response,
  data: ResponseData<T>,
) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};
```

-   Preserve these response keys: `success`, `statusCode`, `message`,
    `data`, and `meta`.
-   Use the existing `ResponseData<T>` definition if it exists. If it
    does not, propose a minimal type consistent with the contract and
    ask before adding extra response fields or a more elaborate response
    framework.
-   Use `meta` for pagination or other response metadata when
    applicable. Do not invent metadata fields without a need.
-   Use meaningful HTTP status codes.
-   Keep error handling consistent with the repository's existing error
    middleware and error types. Do not silently introduce a second
    error-response format.
-   Do not send passwords, password hashes, JWT secrets, or other
    sensitive values in response data.
-   Avoid returning raw Prisma objects when they contain fields that
    should not be exposed. Select or map the fields appropriate for the
    API response.
-   The helper above does not define the error-handling contract by
    itself. Inspect the existing error handling and ask if a new error
    format is needed.

## 5. Confirmed Domain Model and Business Rules

Implement only the confirmed requirements below. If a schema detail or
behavior is not specified here or in the current repository, ask before
making a material decision.

### Roles and authentication

-   The system uses JWT authentication and role-based access control.
-   Public signup creates **student** accounts only. Users must not be
    able to assign themselves a privileged role through request data.
-   A mentor/admin account can be seeded directly in the database.
-   Whether the privileged account is represented as `ADMIN`, `MENTOR`,
    or both must follow the user's confirmed schema or be clarified
    before implementation.
-   Passwords must be stored as hashes, never plaintext.
-   Protected routes must verify authentication and enforce role
    permissions on the backend.

### Project identity

A student owns one project identity.

The project identity contains at least: - Project name - Repository
URL - Live demo URL - Student ownership

The student may change the repository URL and/or live demo URL when
resubmitting the project. URL changes are allowed only if the new URL
does not conflict with another project under the chosen uniqueness
rules.

Duplicate handling: - A student resubmitting their own project with the
same URLs is not a duplicate project. - A project must not be duplicated
by another student using a repository or live demo URL that is already
assigned to a different project, according to the agreed uniqueness
rules. - Normalize URLs consistently before comparing them. Do not
remove meaningful URL path, query, or other components without a
documented rule. - Enforce uniqueness in the database where the selected
schema can express the rule. If URL normalization or cross-field
uniqueness cannot be safely expressed with the current schema, explain
the limitation and ask before introducing a more complex design.

### Submission attempts

A project can have multiple submission attempts so that a student can
request another review.

Each attempt should preserve the details needed to understand what the
mentor reviewed at that time, including the project description and the
applicable repository/live URLs. Do not overwrite historical attempt
details when a new attempt is created.

Confirmed workflow defaults from the design discussion: - A new attempt
starts with `PENDING` status. - A student should not create another
attempt while the current attempt is still pending. - A resubmission is
intended for re-evaluation after a previous attempt has been reviewed
and needs changes. - An approved project is not automatically eligible
for resubmission; reopening an approved project requires an explicit
rule or authorization decision. - Previous reviews and their feedback
must remain available. - Use a unique attempt number per project if
attempt numbers are part of the schema.

The exact mapping between a review rating and the submission status must
be explicit. Do not assume that a quality rating automatically approves
or rejects a submission unless that behavior has been confirmed.

### Submission status

The proposed status enum is:

-   `PENDING`
-   `APPROVED`
-   `REJECTED`

Use these exact values unless the repository or user confirms a change.
The backend, not the client, determines the initial status and controls
permitted state transitions.

### Review history and rating

A review belongs to a particular submission attempt and should include
at least: - Submission attempt reference - Reviewing mentor reference -
Decision/rating - Creation timestamp

The proposed rating enum is:

-   `EXCELLENT` --- display label: "Excellent"
-   `VERY_GOOD` --- display label: "Very Good"
-   `GOOD` --- display label: "Good"
-   `NEEDS_IMPROVEMENT` --- display label: "Needs Improvement"
-   `UNSATISFACTORY` --- display label: "Unsatisfactory"

Use uppercase snake-case enum identifiers in code and database enums.
Keep display labels in the presentation layer or a shared, appropriate
mapping; do not store user-facing phrases with spaces as enum
identifiers.

Review feedback may be included, but whether it is optional or
required---especially for a negative rating---must follow a confirmed
requirement. Preserve each attempt's review rather than replacing the
project's entire review history.

### Mentor dashboard

The backend must support: - Listing project submissions for mentors. -
Server-side status filtering. - Server-side pagination. - Review actions
with role authorization. - Aggregate counts, including pending and
approved projects. Rejected and total counts may also be returned if
consistent with the dashboard. - Statistics that are global across all
submissions unless a different scope is explicitly requested; they
should not accidentally change merely because the table is filtered or
paginated.

Validate pagination parameters and constrain sorting to an explicit
allowlist. Do not fetch every record and paginate/filter in application
memory.

## 6. Database and Prisma Rules

-   Treat PostgreSQL constraints as part of correctness, not merely
    application-level checks.
-   Use Prisma relations and explicit referential actions consistent
    with the project's deletion policy. Ask before deciding whether
    user/project deletion cascades into historical reviews.
-   Use enums for the confirmed roles/statuses/ratings once their exact
    definitions are settled.
-   Add indexes that support demonstrated query patterns, especially
    submission status and ordering by submission time. Avoid
    indiscriminate indexing.
-   Use transactions when multiple database changes must succeed or fail
    together.
-   Protect review decisions from concurrent updates. A submission
    should not end up with two conflicting final decisions because two
    requests arrived at the same time.
-   Handle unique-constraint conflicts and known Prisma errors
    intentionally; do not expose raw database errors to clients.
-   Do not modify applied migrations destructively. Create a new
    migration for schema changes in an established database workflow.
-   Do not run destructive database commands or reset a database without
    explicit permission.
-   Keep seed logic repeatable where practical. Seed privileged
    credentials from environment variables or a documented local-only
    process; never commit real credentials.

### Schema-design note

The recommended conceptual separation is: 1. `User` --- account and
role. 2. `Project` --- one project identity per student, with current
repository/live URLs. 3. `ProjectSubmission` --- each submission
attempt, with a snapshot of the fields the mentor reviewed and its
status. 4. `ProjectReview` --- the rating and feedback for a particular
attempt.

This is a conceptual recommendation, not permission to rewrite an
existing schema without inspection. If the current schema differs,
compare it with these requirements and ask before a substantial
migration.

## 7. Validation, Security, and Abuse Prevention

-   Validate request bodies, path parameters, and query parameters at
    the API boundary.
-   Validate URLs as HTTP/HTTPS URLs and apply any GitHub-specific
    restriction only if confirmed.
-   Apply server-side length limits to project names and descriptions.
    Ask for exact limits if they are important to the requested task and
    not already defined.
-   Trim user text where appropriate and handle empty strings
    consistently.
-   Never trust student IDs, reviewer IDs, roles, or initial statuses
    supplied by a client when they can be derived from authenticated
    identity or server-side logic.
-   Enforce duplicate rules both in application logic and with database
    constraints where possible, so concurrent requests cannot bypass
    them.
-   Add configurable rate limits for submission attempts and login
    attempts. Ask before selecting a policy that materially affects
    users. If deployment uses multiple instances, do not assume
    in-memory rate limiting is globally effective.
-   Configure CORS with known frontend origins rather than allowing
    every origin by default.
-   Keep secrets in environment variables and provide placeholder
    names---not real values---in `.env.example`.
-   Use parameterized Prisma operations. Avoid unsafe raw SQL,
    especially with user-controlled values.
-   Do not add external URL fetching to check whether submitted links
    are reachable unless explicitly requested. If link fetching is
    introduced later, it requires separate SSRF protections.

## 8. Error Handling and Logging

-   Use the project's established centralized error-handling approach.
-   Distinguish validation errors, authentication errors, authorization
    errors, not-found errors, conflicts, rate-limit errors, and
    unexpected server errors.
-   Use `409 Conflict` for duplicate project URLs or invalid conflicting
    state transitions when appropriate.
-   Use `401 Unauthorized` for missing/invalid authentication,
    `403 Forbidden` for insufficient permission, and
    `429 Too Many Requests` for rate-limit violations.
-   Do not expose stack traces, SQL details, credentials, tokens, or
    password hashes in production responses or logs.
-   Log unexpected errors with enough context to diagnose the issue,
    without logging sensitive request data.

## 9. Testing Expectations

Use the test framework already present in the repository. Ask before
introducing a new testing framework if none exists.

Prioritize tests for: - Student signup cannot assign a privileged
role. - Login and JWT verification. - Student access to mentor-only
routes is denied. - A student can create one project identity. - Another
project cannot claim a conflicting repository/live URL under the
configured uniqueness rules. - The owner can change their project's URLs
during an allowed resubmission if the new URLs do not conflict. -
Resubmission creates a new attempt and preserves prior attempt/review
history. - A pending attempt cannot be duplicated by a second submission
attempt. - Only authorized mentors can review. - A submission cannot
receive conflicting final decisions through concurrent requests. -
Server-side filters return only matching statuses. - Pagination metadata
and aggregate statistics are correct. - Validation and rate-limit
failures use the established response/error contract.

Do not claim tests pass unless they have been run and their results are
known.

## 10. Implementation Workflow for the Agent

For each task:

1.  Inspect the relevant existing files and conventions.
2.  Summarize the intended change briefly if it spans multiple files or
    affects the schema.
3.  Identify any ambiguity that changes business behavior, data
    integrity, security, dependencies, or deployment.
4.  Ask the user before implementing a material unresolved assumption or
    adding an unrequested complex solution.
5.  Implement the smallest complete change that satisfies the confirmed
    requirement.
6.  Update Prisma schema/migrations and tests when required.
7.  Run relevant formatting, type-checking, tests, and build scripts
    that exist in the repository.
8.  Report what changed, what was tested, any failures, and any
    remaining decisions.

Do not pause for approval on trivial implementation details already
established by the codebase. Do pause for decisions that change product
behavior or create a lasting data-model commitment.

## 11. Decisions That Must Not Be Silently Invented

Ask the user before finalizing any of these if the repository or user
has not already resolved them:

-   Whether the privileged role is `ADMIN`, `MENTOR`, or both.
-   Exact rules for reopening approved projects.
-   Whether review feedback is required for any or all ratings.
-   Whether every review rating maps to approval/rejection in a fixed
    way.
-   Whether repository URLs must specifically belong to GitHub.
-   Exact rate-limit thresholds and windows.
-   Exact project-name/description length limits if product-specific
    values are required.
-   Whether repository and live URLs must be unique independently across
    all projects, or whether only the pair must be unique.
-   Whether project records and historical reviews can be deleted, and
    their retention policy.
-   Whether students can edit project details outside the resubmission
    flow.
-   Whether additional dependencies, external services, or deployment
    infrastructure should be introduced.

When asking, offer a concise recommendation and explain the consequence
of the choice. Do not turn every minor coding choice into a question.

## 12. Definition of Done

A backend task is complete when: - The implementation matches confirmed
requirements and existing conventions. - Validation and authorization
are enforced on the server. - Database changes preserve submission and
review history. - The response contract remains consistent. - Relevant
checks have been run, or any unrun checks are clearly disclosed. - No
secrets or unrelated files were added. - Any unresolved business
decision is clearly reported rather than silently assumed.
