# Feature Specification: Identity and User Accounts

**Feature Branch**: `001-user-auth`

**Created**: 2026-09-07

**Status**: Ready for Review

**Input**: User description: "Specify the Identity and User Accounts context of go-agree. Objective: Allow a person to register and log in so they can create, save, and resume contract generations. Scope: Registration and login with email/password. Login with Google (\"Continue with Google\"). Session persistence: an authenticated user remains identified across visits until they log out or the token expires. Every contract generation (answers, questionnaire state, and final document) is associated with the user who created it. Protected routes: the questionnaire and dashboard are only accessible to authenticated users; the landing page is public. Out of Scope: Multiple roles or permissions. Enterprise authentication (SSO/SAML). Advanced password recovery beyond what Supabase Auth provides natively. Two-factor authentication (2FA). Acceptance Criteria: A new user can register with email/password or with Google and is taken to the dashboard in an authenticated state. A user who closes the browser and returns later remains authenticated (or can log in again) and can see their previous contract generations. An unauthenticated user who attempts to access the questionnaire or dashboard is redirected to the login page."

## Clarifications

### Session 2026-09-07

- Q: How should the system handle a user signing in with "Continuar con Google" when an account already exists with the same email registered via email/password? → A: Automatically link the Google provider to the existing account and log the user in directly.
- Q: What should be the default idle session duration before an authenticated session expires and requires re-login? → A: 30 days of inactivity (sliding window renewed on each active visit).
- Q: Should the login interface include a self-service password reset link ("¿Olvidaste tu contraseña?") that triggers a standard email recovery link? → A: Include a "¿Olvidaste tu contraseña?" link on the login form that sends a standard platform password reset email.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Email and Password Registration & Authentication (Priority: P1)

As a new or returning visitor, I want to create an account or log in using my email address and password so that I can establish a private, authenticated identity within the application and immediately access my dashboard.

**Why this priority**: This is the foundational identity mechanism that allows any user with an email address to self-register, securely authenticate, and access protected application services independently of third-party identity providers.

**Independent Test**: Can be fully verified by registering a fresh email/password account, verifying immediate redirect to the dashboard, logging out, and successfully logging back in with the same credentials.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor on the registration interface, **When** they submit a valid email address and a password that meets security criteria, **Then** a new user account is created, an authenticated session is established, and the user is redirected to their dashboard.
2. **Given** a registered user on the login interface, **When** they submit their registered email and correct password, **Then** the user is authenticated and redirected to the dashboard.
3. **Given** an unauthenticated visitor on the registration interface, **When** they attempt to register with an email address that is already registered, **Then** registration is prevented and an inline error message in Spanish clearly notifies the user that the account already exists.
4. **Given** an unauthenticated visitor on the login interface, **When** they enter an unregistered email or an incorrect password, **Then** access is denied and a generic security-conscious error message in Spanish informs them that the credentials are invalid without revealing whether the email exists.
5. **Given** an unauthenticated visitor on the registration interface, **When** they enter a malformed email or a password failing minimum complexity requirements, **Then** client-side and server-side validation highlights the invalid fields with descriptive Spanish error messages before any account is created.
6. **Given** a registered user on the login interface who forgot their password, **When** they select "¿Olvidaste tu contraseña?" and enter their registered email address, **Then** the system sends a standard platform password reset email and displays a confirmation message in Spanish instructing them to check their inbox.

---

### User Story 2 - Protected Route Access & Redirection (Priority: P1)

As an unauthenticated visitor, when I attempt to access restricted application areas (such as the contract questionnaire or user dashboard), I am automatically redirected to the login interface, and upon successful authentication, I am redirected back to the destination I originally requested.

**Why this priority**: Essential security enforcement preventing unauthorized access to private user data, questionnaire workflows, and document generation tools, while providing a seamless navigation recovery flow.

**Independent Test**: Directly request a protected URL (e.g., `/dashboard` or `/questionnaire`) while unauthenticated; confirm redirection to login with the intended destination recorded. Authenticate and confirm automatic navigation to the requested resource.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they attempt to directly navigate to the dashboard or the questionnaire, **Then** the system intercepts the request and redirects them to the login interface, preserving the target destination in the navigation state.
2. **Given** an unauthenticated visitor who was intercepted and redirected to login while attempting to access a protected page, **When** they successfully authenticate (via email/password or Google), **Then** the system redirects them directly to the preserved target destination rather than a default page.
3. **Given** any visitor (authenticated or unauthenticated), **When** they navigate to the public landing page or public informational pages, **Then** access is granted immediately without prompting for authentication.
4. **Given** an already authenticated user, **When** they visit the landing page, **Then** the primary navigation offers a clear shortcut to their dashboard and replaces "Iniciar sesión" / "Registrarse" with account status and a link to the dashboard.

---

### User Story 3 - Third-Party Authentication with Google (Priority: P2)

As a visitor, I want to authenticate using my existing Google account ("Continuar con Google") so that I can sign up or log in with a single interaction without having to remember a separate password.

**Why this priority**: Significantly reduces onboarding friction and form-fill fatigue, offering a fast, widely trusted authentication alternative for users.

**Independent Test**: Click "Continuar con Google", authorize via Google consent, and verify that a new account is provisioned (or matched to existing identity) and the user arrives at the dashboard authenticated.

**Acceptance Scenarios**:

1. **Given** a new visitor on the authentication interface, **When** they select "Continuar con Google" and complete authorization with Google, **Then** an account is provisioned with their verified email identity, an authenticated session is established, and they are routed to the dashboard.
2. **Given** an existing user who previously registered via Google, **When** they select "Continuar con Google" on subsequent visits, **Then** their identity is recognized and they are logged into their existing account and dashboard.
3. **Given** a visitor who initiates Google authentication, **When** they cancel or decline authorization on the Google consent screen, **Then** they are returned to the login interface with a clear Spanish status message indicating that authentication was cancelled, without crashing or freezing.

---

### User Story 4 - Session Persistence and Explicit Logout (Priority: P2)

As an authenticated user, I want my session to persist across browser tabs and browser restarts so that I do not need to re-enter credentials repeatedly, and I want an accessible option to explicitly log out to terminate my session whenever I choose.

**Why this priority**: Critical for usability during extended contract drafting sessions while ensuring users can securely end sessions when using shared or public workstations.

**Independent Test**: Authenticate, close browser window, reopen application to verify session continuity. Then trigger "Cerrar sesión" and verify that cached session credentials are invalidated and protected routes become inaccessible.

**Acceptance Scenarios**:

1. **Given** an authenticated user who is working within the application, **When** they refresh the page, open a new tab, or close and reopen the browser, **Then** their authenticated state is retained seamlessly without re-prompting for credentials.
2. **Given** an authenticated user on any protected view, **When** they activate the "Cerrar sesión" control, **Then** the current session is invalidated, all client-side authentication tokens are purged, and the user is redirected to the public landing page.
3. **Given** a user who has logged out, **When** they use the browser's "Back" button to return to a previously viewed dashboard or questionnaire page, **Then** the application detects the invalidated session and redirects them to the login screen without displaying stale private data.

---

### User Story 5 - Association of Contract Generations with User Account (Priority: P3)

As an authenticated user, I want all contract generations that I create (including answers, questionnaire progress, and generated documents) to be strictly associated with my user account so that I can review, resume, and manage my contracts on my dashboard without cross-user interference.

**Why this priority**: Connects user identity to core business value (contract generation and drafting workflow), fulfilling the goal of multi-session drafting and private contract storage.

**Independent Test**: Log in as User A and create an in-progress contract generation. Log in as User B and verify that User B's dashboard does not list User A's contract. Log back in as User A and verify the contract generation can be resumed.

**Acceptance Scenarios**:

1. **Given** an authenticated user starting a new questionnaire session, **When** the contract generation is initiated and answers are recorded, **Then** the contract generation aggregate is permanently tagged with the user's unique account identifier.
2. **Given** an authenticated user accessing their dashboard, **When** the dashboard loads, **Then** it displays a list of all contract generations belonging to that user (displaying contract title, status, and last modified date).
3. **Given** an authenticated user on their dashboard, **When** they select an existing contract generation, **Then** the application loads the specific questionnaire state or generated document associated with that record.
4. **Given** an authenticated user, **When** they attempt to access or resume a contract generation owned by a different user account, **Then** the system rejects the request with an access denied response and redirects to the user's own dashboard.

---

### Edge Cases

- **Duplicate Account Resolution (Email vs Google)**: If a user who originally registered with an email and password attempts to authenticate via "Continuar con Google" using the same verified email address, the system automatically links the Google identity to the existing account and logs the user in directly without prompting for password re-verification.
- **Session Expiration During Questionnaire Interaction**: If an authenticated session expires while the user is actively filling out the questionnaire, the system captures the latest form inputs in local transient state, presents a non-destructive re-authentication prompt, and restores the questionnaire state upon successful re-login without losing unpersisted answers.
- **Concurrent Session Termination**: If a user logs out in one browser tab, other open tabs for the same browser profile detect session termination on the next user action or route transition and redirect to the login interface.
- **Network Interruption During Authentication**: If network connectivity drops while submitting credentials or processing an OAuth callback, a clear Spanish alert notification appears ("Error de conexión. Por favor, verifica tu conexión a internet e inténtalo nuevamente.") allowing immediate retry without page reload.
- **Password Complexity and Length Boundaries**: The system enforces a minimum password length of 8 characters and prevents submission of excessively long strings (>128 characters) or control characters, giving clear real-time feedback.
- **Rapid Repeated Submissions & Rate Limiting**: Authentication action buttons ("Iniciar sesión", "Registrarse", "Continuar con Google") must be disabled immediately upon trigger with a visible loading state to prevent race conditions. The backend identity service enforces a rate limit threshold (maximum 5 failed attempts per minute per IP/account), returning an HTTP 429 response with a localized Spanish cooldown notice ("Demasiados intentos. Por favor, espera un minuto antes de reintentar.").
- **Password Reset for Unregistered Email**: If a visitor submits an unregistered email on the password reset form, the system displays the same standard confirmation notice in Spanish to prevent email enumeration attacks.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an account registration interface allowing users to register using an email address and a password.
- **FR-002**: System MUST validate that email addresses conform to standard email syntax and are unique across the system before creating an account.
- **FR-003**: System MUST enforce password requirements (minimum 8 characters) and reject blank or whitespace-only passwords.
- **FR-004**: System MUST provide an authentication interface allowing registered users to log in using their email and password.
- **FR-005**: System MUST provide a third-party authentication option via Google OAuth ("Continuar con Google") allowing users to register and log in with their Google credentials, automatically linking the Google identity to any existing account sharing that verified email address.
- **FR-006**: System MUST securely authenticate credentials through the platform's identity service and issue an authenticated session token upon successful validation.
- **FR-007**: System MUST persist the authenticated session on the client device across page reloads, tab navigation, and browser restarts for up to 30 days of inactivity using a sliding expiration window renewed on each active visit, until explicit logout or session expiration.
- **FR-008**: System MUST provide an accessible "Cerrar sesión" (Log Out) action in the user navigation that terminates the active session, invalidates stored credentials, and returns the user to the public landing page.
- **FR-009**: System MUST protect restricted application routes (including the dashboard and the contract questionnaire), restricting access exclusively to authenticated users.
- **FR-010**: System MUST redirect unauthenticated requests to protected routes to the login page, capturing the intended return destination so the user is returned to their target route upon successful login.
- **FR-011**: System MUST ensure the landing page and public marketing/legal pages remain publicly accessible to all visitors without requiring authentication.
- **FR-012**: System MUST associate every contract generation (including questionnaire progress, submitted answers, and generated document artifacts) with the unique account identifier of the user who created it.
- **FR-013**: System MUST provide an authenticated dashboard interface displaying the user's previously created contract generations and allowing the user to resume an in-progress generation or view completed contracts.
- **FR-014**: System MUST strictly isolate contract generations between users, ensuring no user can view, edit, or resume contract records belonging to another user.
- **FR-015**: System MUST render all user-facing interface copy, labels, form instructions, buttons, and error messages in Spanish (`es`) in accordance with the project constitution.
- **FR-016**: System MUST ensure all authentication forms and interactive elements comply with WCAG 2.1 AA accessibility criteria, including full keyboard navigability, visible focus indicators, explicit accessible form labels, screen-reader friendly validation errors (`role="alert"`), and minimum 4.5:1 color contrast.
- **FR-017**: System MUST provide a "¿Olvidaste tu contraseña?" (Forgot password) action on the login interface allowing users to submit their email address to trigger a standard platform password reset recovery email.

### Key Entities *(include if feature involves data)*

- **UserAccount**: Represents an individual registered person within the application.
  - *Attributes*: `id` (unique identifier), `email` (unique verified email string), `authProviders` (array of linked identity providers, e.g., email_password, google), `createdAt` (timestamp), `lastLoginAt` (timestamp).
- **UserSession**: Represents an active authenticated session for an identified user.
  - *Attributes*: `sessionId` (identifier), `userId` (reference to UserAccount), `expiresAt` (timestamp, set to 30 days from last activity), `isValid` (boolean status flag).
- **ContractGeneration**: Represents a contract creation process belonging to a user.
  - *Attributes*: `id` (unique identifier), `userId` (foreign reference to UserAccount owner), `title` (contract display name, e.g., "Mi Contrato 1"), `status` (e.g., in_progress, completed), `currentQuestionIndex` (questionnaire progress indicator), `updatedAt` (timestamp).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can complete the entire registration flow and arrive at their dashboard in under 30 seconds.
- **SC-002**: Returning users can log in via email/password or "Continuar con Google" and access their dashboard in under 10 seconds.
- **SC-003**: 100% of unauthenticated navigation attempts to protected routes (dashboard, questionnaire) are intercepted and redirected to the login interface.
- **SC-004**: Upon logging in after a route redirection, 100% of users are accurately redirected to the specific protected page they originally attempted to visit.
- **SC-005**: 100% of created contract generations are strictly isolated so that 0% of users can view or access contracts owned by other users.
- **SC-006**: Returning users whose session has been active within the last 30 days achieve a 0-click resumption of their authenticated state upon reopening the application.
- **SC-007**: 100% of authentication error states display clear, accessible error messages in Spanish with proper screen reader announcements.
- **SC-008**: All authentication pages achieve 100% compliance with automated WCAG 2.1 AA accessibility evaluations with zero violations.

## Assumptions

- **Authentication Provider**: The underlying identity service manages secure credential validation, token generation, Google OAuth credential exchange, and basic email password recovery flows.
- **No Complex RBAC Needed**: The system operates with a single uniform user role; all authenticated users have equivalent permissions to manage their own contracts.
- **Immediate Dashboard Access**: In accordance with user acceptance criteria, upon successful registration (email/password or Google), users are directly granted an authenticated session and navigated to the dashboard without mandatory initial email confirmation blocking the workflow.
- **Browser Storage Availability**: Standard secure client storage (such as HTTP-only secure cookies or local storage managed by the authentication client) is available in the user's browser environment for session token persistence.
- **Email as Primary Identity**: The user's email address serves as the canonical identifier across authentication methods.
