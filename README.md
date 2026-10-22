# ProjectReview Hub

A full-stack project submission and review dashboard where students
submit projects for evaluation and mentors review submissions, assign
quality ratings, and provide feedback.

## Overview

ProjectReview Hub provides a structured workflow for project submission,
review, and resubmission. Each student owns one project identity, while
each resubmission creates a new attempt so previous reviews and feedback
remain available.

### Core features

-   Student signup and login using JWT-based authentication.
-   Role-based access control for students and mentors.
-   Project submission with repository URL, live demo URL, and
    description.
-   Duplicate project URL prevention.
-   Resubmission with updated repository or live demo URLs when they do
    not conflict with another project.
-   Preserved submission attempts and review history.
-   Mentor dashboard with server-side filtering and pagination.
-   Review ratings and optional feedback.
-   Aggregate submission statistics.
-   Request validation and rate limiting.

## Technology Stack

-   **Language:** TypeScript
-   **Frontend:** Next.js, Tailwind CSS, ShadCN UI
-   **Backend:** Express.js
-   **Database:** PostgreSQL
-   **ORM:** Prisma
-   **Authentication:** JWT and role-based access control
-   **Runtime/package manager:** Bun

The frontend and backend are separate application concerns. The backend
is responsible for authentication, authorization, validation, business
rules, database operations, and server-side filtering.

## Roles

### Student

-   Create an account and sign in.
-   Submit a project with its repository URL, live demo URL, and
    description.
-   View their submission status and review feedback.
-   Resubmit a reviewed project when resubmission is permitted.
-   Update repository and live demo URLs during resubmission, provided
    the new URLs do not conflict with another project.

### Mentor

-   View project submissions.
-   Filter submissions by review status.
-   Navigate submissions using server-side pagination.
-   Review a submission and assign a quality rating.
-   Approve or reject a submission.
-   View dashboard statistics.

A privileged mentor account is seeded for evaluation or development.
Public signup must not allow a user to assign themselves a privileged
role.

## Submission and Review Workflow

1.  A student creates a project and submits it for review.
2.  The backend creates the first submission attempt with `PENDING`
    status.
3.  A mentor reviews the attempt, records a rating and any feedback, and
    approves or rejects it.
4.  If another attempt is permitted, the student resubmits the project.
5.  The backend creates a new attempt and preserves the earlier
    submission and review history.

A student should not create another attempt while the current attempt is
pending. Reopening an approved project requires an explicit
authorization rule.

### Submission statuses

  Status       Meaning
  ------------ -------------------------------------
  `PENDING`    Awaiting mentor review
  `APPROVED`   Accepted by a mentor
  `REJECTED`   Not accepted in the current attempt

### Review ratings

  Enum                  Display label
  --------------------- -------------------
  `EXCELLENT`           Excellent
  `VERY_GOOD`           Very Good
  `GOOD`                Good
  `NEEDS_IMPROVEMENT`   Needs Improvement
  `UNSATISFACTORY`      Unsatisfactory

A review rating and a submission status are separate concepts. The
status records the formal outcome; the rating describes project quality.

## Data Model

The recommended conceptual model contains four main entities. Adapt this
description to the actual Prisma schema as it evolves.

### `User`

Stores account details and the user's role.

Typical fields: - `id` - `name` - `email` - `passwordHash` - `role` -
`createdAt` - `updatedAt`

### `Project`

Represents a student's project identity. A student owns one project.

Typical fields: - `id` - `studentId` - `projectName` - `repositoryUrl` -
`liveUrl` - `createdAt` - `updatedAt`

Repository and live demo URLs can be changed during an allowed
resubmission. Duplicate checks should distinguish a project owner's own
resubmission from another project claiming the same URL.

### `ProjectSubmission`

Represents an individual submission attempt.

Typical fields: - `id` - `projectId` - `attemptNumber` - `description` -
`repositoryUrl` snapshot - `liveUrl` snapshot - `status` - `submittedAt`

Store the relevant URL and description snapshots on each attempt so the
historical record reflects what the mentor reviewed at that time.

### `ProjectReview`

Stores the review for a specific submission attempt.

Typical fields: - `id` - `submissionId` - `mentorId` - `decision` -
`feedback` - `createdAt`

A review must reference a specific submission attempt. Do not overwrite
old review records when a new attempt is created.

> The fields above describe the intended model, not a guarantee that
> every field is already implemented. The Prisma schema is the source of
> truth for the current database structure.

## API Overview

The following is a suggested REST API surface. Update it to match the
actual routes implemented in the repository.

  -----------------------------------------------------------------------------------------------
  Method            Endpoint                               Access            Purpose
  ----------------- -------------------------------------- ----------------- --------------------
  `POST`            `/api/auth/signup`                     Public            Register a student

  `POST`            `/api/auth/login`                      Public            Authenticate a user

  `GET`             `/api/auth/me`                         Authenticated     Retrieve the current
                                                                             user

  `POST`            `/api/submissions`                     Student           Create a submission
                                                                             or permitted attempt

  `GET`             `/api/submissions/me`                  Student           View the student's
                                                                             own
                                                                             project/submission

  `GET`             `/api/mentor/submissions`              Mentor            List, filter, and
                                                                             paginate submissions

  `GET`             `/api/mentor/submissions/:id`          Mentor            Retrieve submission
                                                                             details

  `PATCH`           `/api/mentor/submissions/:id/review`   Mentor            Record a review
                                                                             decision

  `GET`             `/api/mentor/statistics`               Mentor            Retrieve aggregate
                                                                             counts
  -----------------------------------------------------------------------------------------------

### Filtering and pagination

The mentor listing endpoint should support validated query parameters
such as:

-   `page` --- page number
-   `limit` --- page size
-   `status` --- optional submission status
-   `sortBy` --- an allowed sort field
-   `order` --- `asc` or `desc`

Filtering, sorting, and pagination must be applied by the
backend/database rather than by downloading all submissions and
filtering them in the frontend.

Statistics should represent global counts across submissions unless the
product requirements explicitly define a different scope.

## API Response Format

Normal API responses use the following structure:

``` json
{
  "success": true,
  "statusCode": 200,
  "message": "Request completed successfully",
  "data": {},
  "meta": null
}
```

-   `success`: whether the request succeeded.
-   `statusCode`: HTTP status code.
-   `message`: human-readable result.
-   `data`: returned resource or result.
-   `meta`: optional metadata, such as pagination information.

The exact response and error handling should follow the shared backend
response helper and centralized error middleware.

## Getting Started

> Setup commands and scripts can vary depending on the repository. Check
> the root and application `package.json` files before running commands.
> The examples below are typical Bun/Prisma commands.

### Prerequisites

-   Bun
-   PostgreSQL
-   Node.js compatibility as required by the selected Bun and Next.js
    versions
-   Git

### 1. Clone the repository

``` bash
git clone <repository-url>
cd <repository-directory>
```

Replace the placeholders with the actual repository URL and directory
name.

### 2. Install dependencies

For a single backend application:

``` bash
bun install
```

If the repository is a monorepo, run the command from the workspace root
and follow the repository's package-manager configuration.

### 3. Configure environment variables

Create a local `.env` file based on `.env.example`, if provided. Do not
commit `.env` or real secrets.

Typical configuration may include:

``` env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="15m"
```

These names are examples, not a guarantee of the current implementation.
Confirm the exact environment variable names and expiry format from the
backend configuration before running the application.

If the project uses separate environment files for the frontend and
backend, configure each application independently.

### 4. Generate Prisma Client and apply migrations

Use the scripts already defined in `package.json`. Typical commands are:

``` bash
bunx prisma generate
bunx prisma migrate dev
```

Run migrations only against the intended development database. Do not
reset or delete a database to resolve migration issues without explicit
approval.

### 5. Seed the privileged account

If a Prisma seed script is configured, use the repository's documented
seed command. For example, a project may expose a `db:seed` script.

Seed credentials should be supplied through environment variables or a
documented local-only process. Never commit real passwords. Confirm the
seeded role and account setup from the seed implementation.

### 6. Start the backend

Use the actual scripts defined in the backend `package.json`. Common
script names include:

``` bash
bun run dev
```

The server's address and port depend on the application's configuration.

### 7. Start the frontend

If the frontend is in a separate workspace, navigate to its directory
and use its documented development script, commonly:

``` bash
bun run dev
```

Check the frontend configuration for the expected backend API base URL
and configure it accordingly.

## Validation and Security

The backend should:

-   Hash passwords rather than storing plaintext passwords.
-   Validate request bodies, query parameters, and route parameters.
-   Verify JWTs and enforce role permissions on every protected
    endpoint.
-   Prevent public signup from assigning privileged roles.
-   Enforce project ownership and URL uniqueness rules on the server.
-   Use database constraints to protect against concurrent duplicate
    submissions.
-   Prevent conflicting decisions on the same submission attempt.
-   Apply rate limits to sensitive endpoints such as login and
    submission.
-   Keep secrets in environment variables.
-   Avoid returning internal errors, password hashes, or authentication
    secrets to clients.
-   Configure CORS for trusted frontend origins.
-   Use transactions where multiple database operations must succeed
    together.

## Testing

Use the testing framework and scripts already configured in the
repository. Important cases include:

-   Student signup and login.
-   Attempts to assign a privileged role during signup.
-   Unauthorized access to mentor endpoints.
-   Duplicate project and URL handling.
-   URL changes during resubmission.
-   Preservation of earlier attempts and reviews.
-   Prevention of duplicate pending attempts.
-   Review authorization and conflicting concurrent decisions.
-   Server-side status filtering and pagination.
-   Accurate aggregate statistics.
-   Validation errors and rate-limit responses.

Run the available type-check, test, lint, and build scripts before
submitting changes. Report checks that could not be run.

## Deployment Checklist

-   [ ] Configure production environment variables and secrets.
-   [ ] Provision PostgreSQL and verify network access.
-   [ ] Apply production migrations using the deployment workflow.
-   [ ] Seed the privileged account securely.
-   [ ] Configure frontend API URL, CORS, and authentication cookie
    settings if applicable.
-   [ ] Verify authentication and role restrictions in the deployed
    environment.
-   [ ] Test submission, resubmission, review, filtering, pagination,
    and statistics.
-   [ ] Verify the repository URL and required repository visibility
    after the assignment deadline.
-   [ ] Confirm that no secrets or local environment files are
    committed.

## Project Assumptions

The following behavior is part of the current design unless explicitly
changed:

-   One project identity per student.
-   A project can have multiple submission attempts.
-   Resubmission may change the repository URL and live demo URL if the
    new URLs do not conflict with another project.
-   Each attempt retains its own submission details and review history.
-   A new attempt starts in `PENDING`.
-   A pending attempt cannot be resubmitted.
-   Review ratings are separate from approval status.
-   Only authorized mentors can review submissions.
-   Filtering and pagination are performed server-side.

Any unresolved behavior---such as reopening approved projects, mandatory
feedback, exact rate-limit thresholds, or URL uniqueness across the two
URL fields---should be confirmed before implementation rather than
silently assumed.

## License

No license has been specified. Add a license only after choosing the
intended terms.
