# AppStack Architecture

## Production SaaS & AI Systems Architecture

**Document:** Architecture Guide  
**Status:** Production Portfolio Documentation  
**Version:** 2.1

---

# 1. Purpose

AppStack is a production-deployed portfolio application designed to demonstrate how modern SaaS capabilities can be organized into a coherent software architecture.

The system combines:

- Authentication
- Authorization
- Persistent application state
- Deterministic business logic
- Cross-module workflows
- Event history
- Modeled job lifecycles
- Operational intelligence
- AI-assisted reasoning
- Subscription billing
- Entitlements
- Usage metering
- Production deployment

The purpose of this document is to explain how those capabilities are organized and how responsibility moves through the system.

The central architectural idea is:

> AppStack separates responsibilities before separating deployments.

---

# 2. Architectural Philosophy

AppStack is organized around explicit responsibilities.

The system asks:

```text
Who owns this behavior?

Where does this state belong?

Which layer should make this decision?

What information should persist?

What should remain deterministic?

What should AI be allowed to interpret?

Which provider owns infrastructure?

Which rules must remain owned by AppStack?
```

This produces an architecture centered on:

```text
Clear Boundaries
      +
Persistent Knowledge
      +
Deterministic Rules
      +
Observable State
      +
Controlled External Integrations
      +
Bounded AI
```

---

# 3. Architectural Style — Modular Monolith

AppStack uses a modular monolith architecture.

The application is deployed as one primary Next.js system while maintaining internal separation between responsibilities.

Conceptually:

```text
AppStack
│
├── Authentication
├── Dashboard
├── Workspace
├── Deal Analyzer
├── ReportForge
├── Jobs
├── Intelligence
├── Billing
├── Entitlements
├── Settings
└── Shared Services
```

These modules participate in one application deployment.

They are not independent microservices.

---

# 4. Why AppStack Is Not a Microservices System

AppStack does not currently require:

- Independent service deployment
- Service discovery
- Distributed transactions
- Network communication between internal modules
- Dedicated service-to-service authentication
- Independent scaling of internal services
- Distributed tracing across internal services

Introducing microservices would therefore add operational complexity without solving a current architectural requirement.

The design principle is:

> Separate responsibilities before separating deployments.

If future scale or organizational requirements justify service extraction, clear internal boundaries make that evolution easier.

---

# 5. High-Level System Architecture

```text
                         USER
                           │
                           ▼
                  PRESENTATION LAYER
                           │
                           ▼
                  APPLICATION MODULES
                           │
                           ▼
                     SERVICE LAYER
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        BUSINESS RULES  WORKFLOWS   ACCESS POLICY
              │            │            │
              └────────────┼────────────┘
                           ▼
                    PERSISTENCE LAYER
                           │
                           ▼
                 SUPABASE / POSTGRESQL
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
                  STATE         EVENTS
                    │             │
                    └──────┬──────┘
                           ▼
                DETERMINISTIC INTELLIGENCE
                           │
                           ▼
                  STRUCTURED AI CONTEXT
                           │
                           ▼
                       OPENAI
                           │
                           ▼
                     AI ADVISOR
                           │
                           ▼
                         USER
```

Billing operates as an external system boundary:

```text
AppStack
   ↓
Stripe
   ↓
Webhook
   ↓
AppStack Billing State
   ↓
Entitlements
```

---

# 6. Presentation Layer

The presentation layer is responsible for user interaction and visual representation.

It includes:

- Pages
- Forms
- Navigation
- Cards
- Lists
- Tables
- Status displays
- Loading states
- Empty states
- Error states
- Success states

The presentation layer should primarily answer:

```text
What should the user see?

What action did the user request?

What state should be displayed?
```

It should not become the primary owner of reusable business rules or persistence behavior.

---

# 7. Shared Component Layer

Reusable interface behavior is separated into shared components where appropriate.

This reduces duplicated presentation logic and improves consistency.

Conceptually:

```text
Feature Page
    ↓
Shared Component
    ↓
Reusable Presentation Behavior
```

Shared components may understand:

- Props
- Display state
- Interaction callbacks
- Reusable interface patterns

They should not become hidden business-service layers.

---

# 8. Application Modules

AppStack contains several primary application modules.

## Dashboard

Responsible for:

- High-level visibility
- Inventory summaries
- Operational status
- Executive briefing
- Recent activity
- Navigation into persisted objects

Primary responsibility:

```text
Observe + Navigate
```

---

## Workspace

Responsible for:

- Persisted object management
- Search
- Filtering
- Sorting
- Selection
- Duplication
- Deletion
- Bulk management
- Task management
- Relationship inspection
- Deep-link resolution

Primary responsibility:

```text
Inspect + Manage
```

---

## Deal Analyzer

Responsible for:

- Structured deal input
- Deterministic calculations
- Recommendation generation
- Persisting analysis results

---

## ReportForge

Responsible for:

- Loading analysis context
- Report generation
- Report persistence
- Analysis-to-report relationships
- Direct report-to-job handoff

---

## Jobs

Responsible for:

- Creating persisted job records
- Modeling job lifecycle state
- Representing operational progression
- Making job status observable
- Preserving report-to-job relationships

The current implementation models lifecycle progression such as:

```text
Queued
  ↓
Running
  ↓
Completed
```

This is a persisted application workflow.

It should not be confused with dedicated distributed queue or worker infrastructure.

---

## Intelligence

Responsible for:

- Interpreting persisted application state
- Evaluating progress
- Identifying operational concerns
- Producing priorities
- Producing structured decision-support information

---

## Billing

Responsible for:

- Subscription representation
- Stripe synchronization
- Billing-period information
- Cancellation state

---

## Entitlements

Responsible for:

- Plan capabilities
- Usage limits
- Feature-access policy
- Server-side enforcement

---

## Settings

Responsible for:

- User-controlled application preferences
- AI assistance preference
- Profile-related settings

---

# 9. Service Layer

The service layer separates reusable application operations from presentation components.

The preferred dependency direction is:

```text
Page / Component
       ↓
Service
       ↓
Business / Persistence Operation
```

rather than:

```text
Page
├── UI
├── Database Queries
├── Business Rules
├── Billing Policy
└── Intelligence
```

Services improve:

- Reuse
- Consistency
- Testability
- Maintainability
- Boundary clarity

The important architectural concept is the responsibility of the service, not the specific filename used to implement it.

---

# 10. Deterministic Business Logic

Business rules that must produce stable answers are implemented deterministically.

For example:

```text
MAO = ARV × 70% - Repairs
```

The same inputs should produce the same result.

The architecture is:

```text
Structured Input
      ↓
Business Rule
      ↓
Deterministic Result
```

AI is not required to calculate known rules.

---

# 11. Persistence Architecture

AppStack uses Supabase with PostgreSQL for persistent application state.

Persistence allows information to survive:

- Navigation
- Page refresh
- Browser sessions
- Cross-module handoffs
- Future user interactions

Conceptually:

```text
Application Operation
        ↓
Service
        ↓
Supabase
        ↓
PostgreSQL
        ↓
Persistent State
```

---

# 12. Workspace Object Model

Workspace represents several operational object types:

```text
Analysis
Report
Job
Task
```

These objects share the broader concept:

```text
Persisted Workspace Item
```

This allows Workspace to provide common management behavior while specialized modules remain responsible for specialized work.

---

# 13. Cross-Module Relationships

AppStack preserves relationships between objects.

A representative workflow is:

```text
Analysis
   ↓
Report
   ↓
Job
```

The system therefore knows more than:

```text
An analysis exists.
A report exists.
A job exists.
```

It can preserve the fact that:

```text
This report came from this analysis.

This job came from this report.
```

Relationships allow persisted information to become reusable workflow context.

---

# 14. Event Architecture

Persistent state describes what is currently true.

Events preserve meaningful activity.

```text
STATE
What is true now?

EVENT
What happened?
```

Representative events can describe actions such as:

- Object creation
- Report generation
- Job activity
- Workflow changes
- Other meaningful application actions

The event layer provides historical context that can support:

- Activity timelines
- Debugging
- Operational visibility
- Intelligence

---

# 15. Information Progression

AppStack follows a broader information progression:

```text
DATA
  ↓
INFORMATION
  ↓
KNOWLEDGE
  ↓
INTELLIGENCE
  ↓
ADVISORY
```

For example:

```text
Raw Deal Inputs
      ↓
Calculated Analysis
      ↓
Persisted Workspace Knowledge
      ↓
Deterministic Workspace Intelligence
      ↓
AI-Assisted Advisory
```

Each layer should add meaning without destroying the reliability of the layer below it.

---

# 16. Deterministic Intelligence Architecture

AppStack's Intelligence layer exists before AI.

It interprets application truth using deterministic rules and structured relationships.

Representative outputs include:

- Health
- Progress
- Bottleneck
- Recommended action
- Priority actions
- Director guidance
- Forecast
- Risk
- Strategy
- Insights

Conceptually:

```text
Persisted State
      +
Workflow Relationships
      +
Relevant Historical Context
      +
Deterministic Rules
      ↓
Operational Intelligence
```

The exact inputs used by an individual intelligence capability may differ.

The architectural invariant is that the system establishes structured knowledge before asking AI to reason over it.

---

# 17. AI Architecture

AI sits downstream of deterministic application knowledge.

```text
Application Truth
      ↓
Deterministic Intelligence
      ↓
Structured Context
      ↓
AI Model
      ↓
Advisory Output
```

The AI model is therefore a reasoning component.

It is not the database.

It is not the business-rules engine.

It is not the authorization system.

It is not the source of subscription truth.

---

# 18. AI Control Boundary

Before AI is invoked, AppStack can evaluate deterministic controls such as:

```text
Authenticated?
      ↓
AI Assistance Enabled?
      ↓
Entitled?
      ↓
Usage Available?
      ↓
Model Invocation
```

The precise internal evaluation order is an implementation detail.

The architectural rule is more important:

> Application policy is evaluated outside the model.

The model does not decide whether it is authorized to run.

---

# 19. Authentication Architecture

Supabase Auth provides user identity.

Conceptually:

```text
Credentials
    ↓
Supabase Auth
    ↓
Authenticated Session
    ↓
AppStack
```

Authentication answers:

> Who is the user?

It does not independently answer:

> Which application records may the user access?

---

# 20. Authorization & Row Level Security

Authorization determines what an authenticated user may access.

AppStack combines authenticated identity with user-scoped persistence and Supabase Row Level Security.

```text
Authenticated User
      ↓
Database Request
      ↓
RLS Policy
      ↓
Authorized Records
```

This prevents the interface from becoming the only data-security boundary.

---

# 21. Secret Management

Privileged credentials remain on the server side.

Examples include credentials used for:

- Stripe
- OpenAI
- Privileged database operations
- Webhook verification

The browser should never receive a privileged credential simply because it initiates an operation that requires one.

The pattern is:

```text
Browser
   ↓
Server Boundary
   ↓
Secret
   ↓
External Provider
```

---

# 22. Billing Architecture

AppStack integrates with Stripe for subscription billing.

The deployed portfolio system uses Stripe's sandbox/test-mode environment.

The billing flow is:

```text
AppStack
   ↓
Stripe Checkout
   ↓
Subscription
   ↓
Stripe Event
   ↓
Webhook
   ↓
AppStack Subscription State
```

AppStack does not treat a browser redirect as the authoritative billing synchronization mechanism.

---

# 23. Webhook Architecture

Stripe can change subscription state independently of an active AppStack browser session.

Webhooks therefore synchronize provider-side changes into application state.

```text
Stripe
   ↓
Signed Event
   ↓
Webhook Endpoint
   ↓
Signature Verification
   ↓
Event Handling
   ↓
Database Synchronization
```

Relevant subscription events include creation, updates, deletion, and Checkout completion.

---

# 24. Entitlement Architecture

Billing state and application access are separate responsibilities.

```text
Stripe Subscription
       ↓
AppStack Plan
       ↓
Entitlements
       ↓
Usage Policy
       ↓
Permitted Operation
```

Stripe owns billing infrastructure.

AppStack owns product policy.

---

# 25. Usage Metering

Some capabilities are limited according to application plan.

AppStack therefore needs to understand usage within the relevant billing context.

Usage may be represented or derived according to the capability being enforced.

The important architecture is:

```text
User
  +
Plan
  +
Current Usage
      ↓
Entitlement Decision
      ↓
Operation Allowed / Blocked
```

AI usage is tracked explicitly because model invocation represents a directly metered external capability.

---

# 26. Workflow Orchestration

AppStack coordinates multiple modules without collapsing them into one feature.

A representative workflow is:

```text
Deal Analyzer
      ↓
Persist Analysis
      ↓
ReportForge
      ↓
Persist Report
      ↓
Jobs
      ↓
Persist Job State
      ↓
Workspace
      ↓
Intelligence
      ↓
Advisor
```

Each module retains its responsibility while participating in a larger system flow.

---

# 27. Navigation as an Architectural Boundary

Navigation can preserve object identity and responsibility.

For example:

```text
Dashboard Activity
      ↓
Workspace?itemId=<id>
      ↓
Exact Persisted Object
```

Dashboard remains responsible for visibility.

Workspace remains responsible for management.

The URL becomes a transport mechanism for object identity.

---

# 28. State vs. Events

State and events should not be confused.

```text
STATE
Job = Completed
```

```text
EVENT
Job progressed through meaningful activity
```

State supports current application behavior.

Events provide historical context.

Both can contribute to operational understanding.

---

# 29. Immediate Operations vs. Modeled Job Lifecycles

AppStack contains operations that complete immediately and workflows whose progression is represented through persisted job state.

### Immediate Operation

Example:

```text
Request
  ↓
Deterministic Calculation
  ↓
Response
```

### Modeled Job Lifecycle

```text
Job Created
   ↓
Queued
   ↓
Running
   ↓
Completed
```

The current Jobs implementation demonstrates lifecycle state, persistence, and observability.

It does **not** claim:

```text
Dedicated Queue Infrastructure
Independent Worker Processes
Distributed Retry Processing
Dead-Letter Queues
Worker Concurrency
```

Those capabilities would be appropriate only when real processing requirements justify them.

This distinction keeps the architecture technically accurate while preserving the job-lifecycle concept.

---

# 30. External System Boundaries

AppStack integrates with several external platforms.

## Supabase

Provides:

- PostgreSQL
- Authentication
- Row Level Security
- Managed backend infrastructure

## Stripe

Provides:

- Checkout
- Subscription infrastructure
- Customer billing management
- Billing events
- Webhooks

The current AppStack deployment uses Stripe sandbox/test mode.

## OpenAI

Provides:

- Probabilistic language-model reasoning used by the Advisor

## Vercel

Provides:

- Production deployment
- Hosting
- Environment configuration
- Git-integrated delivery

Each provider has a bounded responsibility.

---

# 31. Dependency Direction

A healthy dependency direction looks like:

```text
Presentation
     ↓
Application Service
     ↓
Domain / Business Logic
     ↓
Persistence / External Boundary
```

Higher-level interface concerns should not become foundational dependencies of lower-level business behavior.

This helps reduce coupling.

---

# 32. Information Hiding

A module should expose what other modules need without exposing every internal detail.

For example:

```text
Consumer
   ↓
Service Contract
   ↓
Internal Implementation
```

The consumer should not need to know every database operation required to fulfill the request.

This allows implementation details to evolve behind stable responsibilities.

---

# 33. Separation of Concerns

AppStack separates concerns such as:

```text
Presentation
Persistence
Business Rules
Events
Intelligence
AI
Authentication
Authorization
Billing
Entitlements
Usage
Deployment
```

The goal is not separation for its own sake.

The goal is to prevent unrelated responsibilities from becoming inseparable.

---

# 34. Observability

AppStack exposes operational state through mechanisms such as:

- Workspace state
- Events
- Job status
- Billing state
- Usage information
- Intelligence outputs
- Progress
- Priority actions
- Server-side diagnostic logging where appropriate

This helps make the system understandable during both normal operation and debugging.

---

# 35. Error Boundaries & Failure Thinking

External dependencies can fail.

Examples include:

```text
Database
Authentication
Stripe
Webhook Delivery
OpenAI
Deployment Configuration
```

The architecture should avoid turning every provider failure into total application failure.

For example:

```text
OpenAI Unavailable
      ↓
Advisor Affected
```

does not inherently require:

```text
Workspace Unavailable
Intelligence Unavailable
Business Rules Unavailable
```

This is one benefit of keeping deterministic application capabilities independent of AI.

---

# 36. Production Deployment Architecture

The delivery flow is:

```text
Local Development
      ↓
Git
      ↓
GitHub
      ↓
Vercel
      ↓
Production Deployment
```

Environment-specific configuration is managed outside source code.

Privileged credentials are not committed to the repository.

---

# 37. Production Verification

Deployment is not proof of correctness.

After deployment, important workflows are manually verified in the production environment.

Representative verification includes:

```text
Authentication
      ↓
Deal Analysis
      ↓
Persistence
      ↓
Report Generation
      ↓
Job Creation
      ↓
Modeled Job Progression
      ↓
Workspace Relationships
      ↓
Intelligence
      ↓
AI Advisor
```

Billing and entitlement scenarios are also verified through their relevant production-deployed sandbox flows.

The distinction is important:

```text
Successful Build
≠
Successful Deployment
≠
Verified Runtime Behavior
```

---

# 38. Maintainability

Maintainability is supported through:

- Clear module responsibilities
- Shared services
- Typed contracts
- Centralized business rules
- Explicit provider boundaries
- Documentation
- Limited infrastructure complexity
- Small change blast radius where practical

The architecture should help future developers answer:

> Where should this change be made?

---

# 39. Extensibility

AppStack is designed to allow additional capabilities without requiring complete architectural replacement.

Potential future extensions could include:

- Dedicated job workers
- Queue infrastructure
- Expanded observability
- Additional AI providers
- Agent tools
- More explicit relational models
- Additional billing plans
- Additional intelligence capabilities

These are extension paths.

They are not claims about the current implementation.

---

# 40. Scalability

Scalability has multiple dimensions.

AppStack currently emphasizes:

```text
Architectural Scalability
```

meaning that responsibilities are separated well enough to evolve.

If usage eventually required greater infrastructure scale, specific components could be reconsidered.

Examples:

```text
Modeled Job Lifecycle
      ↓
Dedicated Queue + Workers

Single Application Deployment
      ↓
Selective Service Extraction

Current Observability
      ↓
Centralized Metrics / Tracing
```

Infrastructure should scale when requirements demand it.

---

# 41. Architectural Tradeoffs

Every architecture contains tradeoffs.

## Modular Monolith

Benefits:

- Simpler deployment
- Easier local development
- Clear shared contracts
- Lower operational overhead

Tradeoff:

- Internal modules are not independently deployable

---

## Metadata-Based Relationships

Benefits:

- Flexible
- Lightweight
- Useful for current workflow relationships

Tradeoff:

- A larger commercial domain may eventually justify stronger relational modeling

---

## Modeled Job Progression

Benefits:

- Demonstrates job lifecycle state
- Makes operational progression observable
- Avoids unnecessary infrastructure
- Preserves a path toward future queue-backed processing

Tradeoff:

- Does not provide distributed background-processing guarantees

---

## Managed Infrastructure

Benefits:

- Faster implementation
- Mature provider capabilities
- Lower infrastructure-management burden

Tradeoff:

- Provider dependency

---

## Deterministic Intelligence

Benefits:

- Explainability
- Repeatability
- Stable application knowledge
- Reduced AI dependency

Tradeoff:

- Rules must be explicitly designed and maintained

---

# 42. Architectural Invariants

Several principles should remain true even if implementation details change.

### Invariant 1

Business rules that require deterministic answers remain deterministic.

### Invariant 2

User ownership is enforced below the presentation layer.

### Invariant 3

AI does not become the authoritative source of application truth.

### Invariant 4

Billing state and application entitlements remain separate concepts.

### Invariant 5

Persistent objects preserve meaningful workflow relationships.

### Invariant 6

External providers remain behind recognizable responsibility boundaries.

### Invariant 7

A UI restriction is not treated as sufficient policy enforcement.

### Invariant 8

Current capabilities are described accurately without implying infrastructure that does not exist.

---

# 43. Architecture Through Change

The architecture is designed to survive implementation changes.

For example:

```text
OpenAI
   ↓
Alternative Model Provider
```

should not require redefining MAO.

```text
Current Job Lifecycle
   ↓
Future Queue Infrastructure
```

should not require redefining what a Job represents.

```text
Stripe
   ↓
Alternative Billing Provider
```

would require integration work but should not redefine the concept of an AppStack entitlement.

The architectural responsibility should remain more stable than the provider implementing part of it.

---

# 44. Architecture Success Criteria

The architecture is successful when:

- Modules have recognizable responsibilities
- Business logic is not unnecessarily duplicated
- Persistent state remains reusable
- User ownership is enforced
- Relationships survive module boundaries
- Events preserve meaningful history
- Intelligence derives from application truth
- AI remains bounded
- Billing state synchronizes correctly
- Entitlements are enforced server-side
- External providers remain replaceable in principle
- Failure in one provider does not unnecessarily destroy unrelated capabilities
- Production behavior can be verified
- Future complexity can be introduced without pretending it already exists

---

# 45. Architectural Summary

AppStack can be summarized as:

```text
USER
 ↓
PRESENTATION
 ↓
APPLICATION MODULE
 ↓
SERVICE
 ↓
DETERMINISTIC RULES / POLICY
 ↓
PERSISTENCE
 ↓
STATE + HISTORY
 ↓
DETERMINISTIC INTELLIGENCE
 ↓
STRUCTURED AI CONTEXT
 ↓
AI ADVISOR
 ↓
HUMAN DECISION
```

Cross-cutting boundaries include:

```text
Authentication
Authorization
Billing
Entitlements
Usage
Security
Observability
Deployment
```

The result is a system in which individual capabilities participate in one architecture without requiring every responsibility to become its own deployment.

---

# Closing Perspective

AppStack's architecture is not defined by the number of technologies it uses.

It is defined by the boundaries between responsibilities.

The system establishes identity before access.

It establishes deterministic rules before AI.

It persists information before attempting to interpret it.

It preserves relationships so information can move through workflows.

It distinguishes current state from historical activity.

It separates subscription state from application policy.

It models operational job progression without pretending to operate infrastructure that has not been built.

It keeps probabilistic reasoning downstream of deterministic application knowledge.

And it treats production verification as something that occurs after deployment, not something guaranteed by deployment.

The transformation from features into a system occurs when those responsibilities become explicit and coordinated.

That is the central architectural story of AppStack:

> **A coherent system is created not by accumulating features, but by defining what each capability owns, how information moves between them, and which boundaries must remain trustworthy as the application evolves.**