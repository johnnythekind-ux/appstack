# AppStack Engineering Decisions

## Architectural Choices, Tradeoffs & Technical Judgment

**Document:** Engineering Decisions  
**Status:** Production Portfolio Documentation  
**Version:** 2.0

---

# 1. Purpose

This document records the major engineering decisions that shaped AppStack.

The purpose is not to claim that every choice is universally correct.

The purpose is to explain:

- What decision was made
- What alternatives existed
- Why a particular approach was chosen
- What tradeoffs were accepted
- What conditions could justify revisiting the decision later

Architecture is rarely about finding one perfect answer.

It is about choosing the most appropriate answer for the current system, constraints, and goals.

AppStack was designed around that principle.

---

# 2. Decision Framework

Major decisions were evaluated against several questions:

```text
Does this reduce unnecessary complexity?

Does this preserve clear responsibility boundaries?

Does this improve maintainability?

Does this keep deterministic behavior deterministic?

Does this make production behavior easier to understand?

Does this introduce operational cost without enough value?

Does this make future change easier or harder?

Does this increase coupling?

Does this create a dependency that should remain replaceable?

Does this improve the system or merely make it look more sophisticated?
```

The goal was not to maximize the number of technologies or architectural patterns.

The goal was to apply enough architecture to make the system coherent without introducing complexity that the product did not require.

---

# 3. Decision 1 — Use a Modular Monolith

## Decision

AppStack uses a modular monolith rather than a microservices architecture.

---

## Context

The system contains multiple capabilities:

- Authentication
- Dashboard
- Workspace
- Deal Analyzer
- ReportForge
- Jobs
- Intelligence
- AI Advisor
- Billing
- Entitlements
- Settings

These capabilities require clear boundaries.

However, they do not require independent deployments.

---

## Alternatives Considered

### Traditional Monolith

One large application with minimal internal separation.

### Modular Monolith

One deployable application with explicit internal modules and services.

### Microservices

Multiple independently deployed services communicating across network boundaries.

---

## Decision Rationale

A modular monolith provides the architectural separation AppStack needs while avoiding distributed-system complexity.

It allows the application to maintain boundaries such as:

```text
Presentation
    ↓
Services
    ↓
Business Logic
    ↓
Persistence
```

while still operating as one primary deployment.

The governing principle is:

> Separate responsibilities before separating deployments.

---

## Benefits

- Lower deployment complexity
- Easier debugging
- Easier local development
- Shared type system
- Shared application contracts
- Straightforward cross-module workflows
- Reduced infrastructure overhead
- Fewer network failure modes

---

## Tradeoffs

A modular monolith does not provide the same level of independent scaling or deployment isolation as microservices.

That tradeoff is acceptable because AppStack does not currently require those characteristics.

---

## Revisit If

A future system develops conditions such as:

- Independently scaling workloads
- Large engineering teams owning separate domains
- Independent deployment requirements
- Strict failure-isolation requirements
- Significantly different infrastructure needs by module

---

# 4. Decision 2 — Keep Business Logic Out of Page Components

## Decision

Reusable business operations belong in services or dedicated logic modules rather than being implemented directly inside page components.

---

## Context

Modern frontend frameworks make it easy to place:

- UI
- Data fetching
- Validation
- Business rules
- Persistence
- Workflow logic

inside the same page.

That is convenient initially.

It becomes difficult to maintain as the system grows.

---

## Decision Rationale

Pages should primarily coordinate user interaction and presentation.

Reusable application operations should live behind explicit boundaries.

Conceptually:

```text
Page
  ↓
Service
  ↓
Business / Persistence Logic
```

rather than:

```text
Page
├── Render
├── Query Database
├── Apply Business Rules
├── Create Events
├── Calculate Intelligence
└── Update External Services
```

---

## Benefits

- Reduced duplication
- Better reuse
- Clearer responsibility boundaries
- Easier testing
- Easier refactoring
- Smaller page components
- More consistent behavior across modules

---

## Tradeoffs

More files and abstractions are introduced.

For extremely small features, a service abstraction may initially feel unnecessary.

The tradeoff becomes worthwhile when behavior is reused, business-critical, or likely to evolve.

---

# 5. Decision 3 — Centralize Shared Services

## Decision

Operations that belong to the same domain responsibility should be centralized in shared services.

---

## Context

Multiple modules need access to common behaviors such as:

- Workspace persistence
- Event creation
- Job creation
- Billing state
- Intelligence
- Recommendations

Duplicating those operations across modules would create inconsistent behavior.

---

## Decision Rationale

A shared service provides one implementation boundary.

Conceptually:

```text
Dashboard ─────┐
Workspace ─────┼──→ Shared Service
ReportForge ───┤
Jobs ──────────┘
```

The UI surfaces can differ while using consistent application behavior.

---

## Benefits

- Reuse
- Reduced duplication
- Centralized bug fixes
- More stable contracts
- Lower coupling to implementation details

---

## Tradeoffs

Poorly designed shared services can become overly broad.

A shared service should represent a cohesive responsibility rather than becoming a generic utility container.

---

# 6. Decision 4 — Establish Deterministic Business Rules Before AI

## Decision

Known business rules are implemented deterministically and are not delegated to an AI model.

---

## Context

AppStack includes AI.

That creates a temptation to use the model for any calculation or decision.

However, many application decisions are governed by explicit rules.

Example:

```text
MAO = ARV × 70% − Repairs
```

A language model is unnecessary for this calculation.

---

## Decision Rationale

Known rules should remain deterministic.

The same valid inputs should produce the same result.

The application establishes the fact first.

AI may later:

- Explain it
- Interpret it
- Discuss its implications

but should not own the rule.

The architectural flow is:

```text
Input
  ↓
Deterministic Rule
  ↓
Authoritative Result
  ↓
Structured Context
  ↓
AI Reasoning
```

---

## Benefits

- Predictability
- Explainability
- Easier testing
- Reduced hallucination risk
- Reduced model cost
- Provider independence
- Clearer responsibility boundaries

---

## Tradeoffs

Some domains contain rules that are difficult to formalize.

Those cases may require probabilistic reasoning.

The distinction should be intentional rather than assumed.

---

# 7. Decision 5 — Build Intelligence Before AI Advisory

## Decision

AppStack builds deterministic operational intelligence before invoking the AI Advisor.

---

## Context

A simpler implementation could send raw database records directly to an LLM.

Conceptually:

```text
Database
   ↓
LLM
   ↓
Recommendation
```

This would reduce code.

It would also transfer too much application responsibility to the model.

---

## Decision Rationale

The preferred architecture is:

```text
Application State
      ↓
Deterministic Analysis
      ↓
Workspace Intelligence
      ↓
Priority / Forecast / Risk / Strategy / Insights
      ↓
Structured AI Context
      ↓
AI Advisor
```

The model reasons from knowledge the application has already established.

---

## Benefits

- Better grounding
- Greater explainability
- Easier debugging
- Reduced AI dependence
- Lower token usage
- Better model evaluation
- Provider portability

---

## Tradeoffs

The deterministic intelligence layer requires more engineering than sending raw data directly to the model.

That additional work is justified because the intelligence remains useful even when AI is unavailable.

---

# 8. Decision 6 — Treat AI as a Component, Not the System

## Decision

AI is integrated as one bounded subsystem inside AppStack.

It is not the owner of application state, authorization, billing, workflow, or business rules.

---

## Context

AI-enabled applications can become architecturally weak when model calls are treated as the central mechanism for everything.

That can produce systems where the model implicitly controls:

- Business decisions
- Data interpretation
- User permissions
- Application actions
- Workflow direction

---

## Decision Rationale

AppStack preserves deterministic application authority.

The AI model receives structured context and returns advisory output.

Conceptually:

```text
Application Control Plane
          ↓
Structured Context
          ↓
AI
          ↓
Advisory Output
```

The model operates inside boundaries established by the application.

---

## Benefits

- Safer architecture
- Better failure containment
- Easier provider replacement
- More predictable business behavior
- Stronger authorization boundaries

---

## Tradeoffs

The model receives less autonomy.

That is intentional.

Greater autonomy should only be introduced when additional policy, validation, observability, and tool controls exist.

---

# 9. Decision 7 — Preserve Application History With Events

## Decision

Meaningful application activity is recorded as events instead of relying only on current database state.

---

## Context

Current state can answer:

```text
Job Status = Completed
```

It cannot fully answer:

```text
When was the job created?
What happened before completion?
What workflow produced this state?
```

---

## Decision Rationale

Events preserve historical context.

The architecture distinguishes:

```text
STATE
What is true now?
```

from:

```text
EVENTS
What happened?
```

Both contribute to operational understanding.

---

## Benefits

- Activity timelines
- Workflow visibility
- Better observability
- Historical context
- Intelligence inputs
- Future auditability

---

## Tradeoffs

Events create additional records and require decisions about:

- Which actions deserve events
- Event structure
- Retention
- Relationships

Not every UI interaction should become an event.

Only meaningful system activity should.

---

# 10. Decision 8 — Make History an Intelligence Input

## Decision

Event history is not treated merely as a log.

It can contribute to the Intelligence system.

---

## Context

A system becomes more valuable when it can interpret what has happened over time.

Raw records describe inventory.

History adds temporal and behavioral context.

---

## Decision Rationale

The progression is:

```text
Action
  ↓
Event
  ↓
History
  ↓
Structured Interpretation
  ↓
Intelligence
```

This supports the principle:

> History becomes intelligence.

---

## Benefits

- Richer operational interpretation
- Better workflow understanding
- Stronger recommendations
- Better future extensibility

---

## Tradeoffs

History must remain structured enough to be useful.

Unstructured or inconsistent events can create more noise than intelligence.

---

# 11. Decision 9 — Build CRUD Before Intelligence

## Decision

Persistent operational workflows were established before higher-level intelligence was added.

---

## Context

It is tempting to build an impressive intelligence interface early.

But intelligence without reliable state is weak.

A system should first know:

- What objects exist
- How they are created
- How they change
- How they are deleted
- Who owns them
- How they relate

---

## Decision Rationale

The development progression was intentionally:

```text
CRUD
  ↓
Persistence
  ↓
Relationships
  ↓
Events
  ↓
Intelligence
```

rather than:

```text
AI / Intelligence
      ↓
Try to reconstruct missing application state
```

---

## Benefits

- Stable intelligence inputs
- Better testing
- Stronger data model
- More meaningful downstream reasoning

---

## Tradeoffs

The visually impressive parts of the system arrive later.

The architecture is stronger because the foundation exists first.

---

# 12. Decision 10 — Preserve Cross-Module Relationships

## Decision

Analyses, reports, and jobs preserve their workflow relationships.

---

## Context

Without relationships, AppStack could store:

```text
Analysis
Report
Job
```

as three unrelated records.

That would lose the meaning of the workflow.

---

## Decision Rationale

The system preserves the chain:

```text
Analysis
   ↓
Report
   ↓
Job
```

This allows the application to understand not only what exists but how work progressed.

---

## Benefits

- Workflow continuity
- Traceability
- Better intelligence
- Easier navigation
- Reuse of upstream data

---

## Tradeoffs

Relationships require consistent metadata or relational structures.

As the domain grows, more explicit relational modeling may eventually become appropriate.

---

# 13. Decision 11 — Reuse Data Instead of Requiring Re-entry

## Decision

Downstream modules reuse persisted upstream information.

---

## Context

A weak workflow would require the user to repeatedly enter the same information.

For example:

```text
Enter Deal Data
      ↓
Generate Analysis

Enter Same Data Again
      ↓
Generate Report

Enter Context Again
      ↓
Create Job
```

---

## Decision Rationale

AppStack instead follows:

```text
Input Once
   ↓
Persist
   ↓
Reuse
   ↓
Transform
   ↓
Reuse Again
```

---

## Benefits

- Better user experience
- Lower error risk
- Stronger workflow continuity
- More realistic system behavior

---

## Tradeoffs

Modules become dependent on stable contracts for persisted data.

That dependency is intentional and manageable.

---

# 14. Decision 12 — Model Jobs as Persistent State

## Decision

Operational work is represented as persistent job records with lifecycle states.

---

## Context

Some operations are conceptually asynchronous.

Treating all work as instantaneous hides important production behavior.

---

## Decision Rationale

Jobs follow a lifecycle:

```text
Queued
  ↓
Running
  ↓
Completed
```

The job becomes an observable object.

---

## Benefits

- Visible lifecycle
- Better operational modeling
- Stronger workflow state
- Better future queue compatibility
- Useful intelligence input

---

## Tradeoffs

The current AppStack implementation demonstrates job-state progression without requiring dedicated queue infrastructure.

This is intentional.

It models the architecture without pretending that full distributed worker infrastructure exists.

---

# 15. Decision 13 — Do Not Introduce a Real Queue Without Need

## Decision

AppStack models asynchronous job progression without introducing dedicated queue infrastructure.

---

## Context

A real production queue could involve technologies such as:

- Redis
- Message brokers
- Worker processes
- Retry infrastructure
- Dead-letter queues
- Independent worker deployments

Those systems are valuable when the workload requires them.

---

## Decision Rationale

AppStack's purpose is to demonstrate the workflow concept.

Adding full queue infrastructure would increase complexity without materially improving the architectural lesson at the current scale.

---

## Benefits

- Lower infrastructure overhead
- Easier deployment
- Clearer demonstration
- Honest system scope

---

## Tradeoffs

The Jobs module does not claim full distributed background-processing guarantees.

A larger production workload could justify replacing the current progression model with a real job queue.

---

# 16. Decision 14 — Use Workspace as the Operational Management Surface

## Decision

Workspace owns persisted-object management.

---

## Context

Multiple application surfaces could potentially manage objects.

If Dashboard, Intelligence, and feature modules all implemented independent CRUD behavior, responsibility would become unclear.

---

## Decision Rationale

The boundary is:

```text
Dashboard
Observe + Navigate
      ↓
Workspace
Inspect + Manage
      ↓
Feature Modules
Perform Specialized Work
```

Workspace owns:

- Search
- Filtering
- Sorting
- Selection
- Duplication
- Deletion
- Bulk management
- Task management
- Operational inspection

---

## Benefits

- Clear ownership
- Reduced duplicate CRUD interfaces
- Cleaner Dashboard
- Better mental model

---

## Tradeoffs

Users sometimes navigate through Workspace before reaching specialized operations.

That is acceptable because the responsibility boundary remains clear.

---

# 17. Decision 15 — Keep Dashboard Focused on Visibility

## Decision

Dashboard is an executive overview and navigation surface, not a second Workspace.

---

## Context

Dashboards often accumulate too many responsibilities.

They can become:

- CRUD interfaces
- Analytics screens
- Navigation hubs
- Workflow engines
- Configuration screens

all at once.

---

## Decision Rationale

AppStack keeps Dashboard focused on:

- Inventory
- Operational status
- Executive briefing
- Recent activity
- Deep-link navigation

It observes.

It does not become the primary management surface.

---

## Benefits

- Cleaner hierarchy
- Lower cognitive load
- Clear separation from Workspace
- Better executive readability

---

## Tradeoffs

Some operations require navigating to Workspace or a specialized module.

That is preferable to duplicating management behavior.

---

# 18. Decision 16 — Use Deep Links to Preserve Object Identity

## Decision

Dashboard activity links into exact Workspace objects rather than only routing to the Workspace page generically.

---

## Context

A generic route such as:

```text
/dashboard
    ↓
/workspace
```

loses the context of which object the user selected.

---

## Decision Rationale

AppStack preserves identity through:

```text
Dashboard Activity Item
        ↓
Workspace Deep Link
        ↓
Exact Persisted Object
```

Workspace then loads and reveals the requested object.

---

## Benefits

- Better continuity
- Less user searching
- Clearer navigation
- Stronger relationship between overview and management

---

## Tradeoffs

Deep links introduce URL state that must be handled carefully when records are deleted or unavailable.

---

# 19. Decision 17 — Clear Stale Deep-Link State

## Decision

If a deep-linked Workspace object no longer exists, the stale URL state is cleared.

---

## Context

A user may:

```text
Open Deep Link
      ↓
Delete Object
      ↓
Refresh Browser
```

If the original item identifier remains in the URL, the application can repeatedly request an object that no longer exists.

---

## Decision Rationale

The system clears stale deep-link state when appropriate.

This keeps:

- Browser state
- UI state
- Persistence state

consistent.

---

## Benefits

- Cleaner UX
- Reduced false error states
- Better navigation integrity

---

## Tradeoffs

URL state becomes part of lifecycle management and must be considered during deletion workflows.

---

# 20. Decision 18 — Include Tasks in Operational State

## Decision

Tasks are treated as real Workspace objects and participate in operational state.

---

## Context

Tasks could have been treated as a minor UI feature.

However, pending manual work affects whether the workspace is truly complete.

---

## Decision Rationale

Tasks participate in:

- Workspace inventory
- Management
- Progress
- Intelligence

This ensures that manual outstanding work is not invisible to the system.

---

## Benefits

- More accurate operational state
- More meaningful progress
- Better intelligence

---

## Tradeoffs

Task semantics must remain consistent with the Intelligence rules.

Presentation changes should not silently alter those semantics.

---

# 21. Decision 19 — Separate Presentation Changes From Intelligence Semantics

## Decision

Changes to UI presentation should not automatically change Intelligence behavior.

---

## Context

A UI count can be wrong while the underlying Intelligence logic is correct.

Changing both simultaneously can introduce unnecessary regressions.

---

## Decision Rationale

The principle is:

```text
Presentation Problem?
      ↓
Fix Presentation

Intelligence Problem?
      ↓
Prove It
      ↓
Then Change Intelligence
```

This keeps the blast radius small.

---

## Benefits

- Safer debugging
- Lower regression risk
- Clearer root-cause analysis
- Better change discipline

---

# 22. Decision 20 — Use Supabase for Persistence and Authentication

## Decision

Supabase provides the primary database and authentication infrastructure.

---

## Context

AppStack required:

- PostgreSQL persistence
- Authentication
- User ownership
- Row Level Security
- Server-side data operations

---

## Decision Rationale

Supabase provides these capabilities in an integrated platform while allowing AppStack to retain application-level service boundaries.

---

## Benefits

- PostgreSQL foundation
- Authentication
- Row Level Security
- Reduced infrastructure setup
- Strong fit for the project scale

---

## Tradeoffs

The application becomes dependent on Supabase-specific infrastructure.

The impact is reduced by keeping business rules and higher-level application responsibilities outside provider-specific UI code.

---

# 23. Decision 21 — Enforce User Isolation at the Database Layer

## Decision

User data isolation is reinforced through Row Level Security.

---

## Context

Filtering data in the UI is not sufficient security.

A user should not gain access to another user's records by manipulating a request or interface state.

---

## Decision Rationale

Authorization should extend below the presentation layer.

Conceptually:

```text
Authenticated User
      ↓
Application Query
      ↓
Row Level Security
      ↓
Authorized Records
```

---

## Benefits

- Stronger data isolation
- Defense in depth
- Reduced reliance on UI correctness

---

## Tradeoffs

RLS policies add database configuration complexity and require careful testing.

That complexity is justified because access control is a security boundary.

---

# 24. Decision 22 — Keep Privileged Credentials Server-Side

## Decision

Sensitive credentials remain in server-controlled environments.

---

## Context

Integrated services require secrets such as:

- Database privileged keys
- Stripe secret keys
- Stripe webhook secrets
- AI provider credentials

These must never become browser-accessible.

---

## Decision Rationale

Browser code requests capabilities.

Server code uses privileged credentials when necessary.

```text
Browser
   ↓
Server Boundary
   ↓
Privileged Service
```

---

## Benefits

- Reduced credential exposure
- Better security boundaries
- Clear separation of public and private configuration

---

## Tradeoffs

Some operations require server routes or server-side logic instead of direct browser access.

That is the correct tradeoff for privileged capabilities.

---

# 25. Decision 23 — Use Stripe as the External Billing System

## Decision

Stripe manages subscription billing while AppStack manages product access.

---

## Context

AppStack required realistic SaaS billing capabilities such as:

- Checkout
- Subscription lifecycle
- Customer billing management
- Billing events

Implementing payment infrastructure directly would add unnecessary risk and complexity.

---

## Decision Rationale

Stripe owns payment and subscription infrastructure.

AppStack translates external billing state into internal product state.

```text
Stripe
   ↓
Subscription State
   ↓
AppStack
   ↓
Entitlements
```

---

## Benefits

- Mature billing infrastructure
- Checkout
- Customer Portal
- Subscription lifecycle
- Webhooks

---

## Tradeoffs

AppStack depends on an external billing provider and must synchronize external state correctly.

---

# 26. Decision 24 — Use Webhooks as Billing Truth Synchronization

## Decision

Billing state is synchronized through Stripe webhooks rather than relying only on browser redirects.

---

## Context

Subscription state can change outside the user's current session.

Examples include:

- Subscription creation
- Updates
- Cancellation
- Customer Portal actions

A browser success page cannot reliably observe all of these changes.

---

## Decision Rationale

The workflow is:

```text
Stripe Event
    ↓
Webhook
    ↓
Verification
    ↓
Subscription Sync
    ↓
Application State
```

---

## Benefits

- Better billing reliability
- Supports out-of-band changes
- More accurate subscription state
- Decoupled from browser session

---

## Tradeoffs

Webhook systems introduce:

- Signature verification
- Event handling
- Idempotency concerns
- Version compatibility
- Debugging complexity

Those are appropriate costs for reliable billing synchronization.

---

# 27. Decision 25 — Preserve Exact Cancellation Semantics

## Decision

Explicit cancellation dates and period-end cancellation state are represented separately.

---

## Context

Billing providers can distinguish between:

```text
Cancel at a specific timestamp
```

and:

```text
Cancel at the end of the current billing period
```

Collapsing these into one field creates semantic ambiguity.

---

## Decision Rationale

Application state should preserve the distinction provided by the billing system.

Billing models should represent the external state accurately rather than forcing different meanings into one field.

---

## Benefits

- More accurate billing state
- Clearer UI
- Better synchronization
- Lower semantic ambiguity

---

## Tradeoffs

The subscription model becomes slightly more detailed.

That is preferable to incorrect billing interpretation.

---

# 28. Decision 26 — Separate Subscription State From Entitlements

## Decision

A subscription record is not itself the final authorization decision.

---

## Context

A user may have:

- A plan
- A billing status
- Feature limits
- Usage consumption

Feature access depends on more than simply checking whether a subscription exists.

---

## Decision Rationale

The architecture follows:

```text
Subscription
     ↓
Plan
     ↓
Entitlements
     ↓
Usage
     ↓
Allowed Operation
```

---

## Benefits

- Flexible product rules
- Easier Free/Pro differentiation
- Better usage controls
- Clearer policy boundary

---

## Tradeoffs

Additional application logic is required beyond reading Stripe state.

That separation is valuable because product policy belongs to AppStack, not Stripe.

---

# 29. Decision 27 — Enforce Entitlements Server-Side

## Decision

Feature limits are enforced on the server.

---

## Context

A UI can disable a button.

That does not prevent a user from attempting the underlying request directly.

---

## Decision Rationale

The interface communicates policy.

The server enforces policy.

```text
UI
Shows Limit
    ↓
Server
Validates Limit
    ↓
Operation Allowed or Rejected
```

---

## Benefits

- Stronger enforcement
- Reduced client bypass risk
- Consistent policy

---

## Tradeoffs

Every protected operation requires entitlement-aware server logic.

That is appropriate because product access is an application boundary.

---

# 30. Decision 28 — Meter Usage by Capability

## Decision

Metered product features maintain usage accounting.

---

## Context

Free and Pro plans can support different usage limits for capabilities such as:

- Analyses
- Reports
- Jobs
- AI

---

## Decision Rationale

The application evaluates:

```text
Plan
  +
Current Usage
  +
Limit
  ↓
Allowed?
```

This creates a realistic SaaS entitlement model.

---

## Benefits

- Supports tiered plans
- Enables usage visibility
- Controls AI cost
- Provides realistic product architecture

---

## Tradeoffs

Usage records must remain consistent with subscription periods and application operations.

---

# 31. Decision 29 — Scope Usage to the Billing Period

## Decision

Usage accounting is evaluated against the relevant subscription period.

---

## Context

Lifetime usage would make recurring plan limits inaccurate.

If usage resets with billing cycles, the application needs a period boundary.

---

## Decision Rationale

Usage is interpreted in the context of:

```text
Current Period Start
        ↓
Current Usage Window
        ↓
Current Period End
```

---

## Benefits

- More realistic subscription metering
- Better limit accuracy
- Cleaner billing semantics

---

## Tradeoffs

Billing dates and timezones must be handled consistently.

---

# 32. Decision 30 — Make AI Preference a Real Server Control

## Decision

The AI assistance setting affects actual server behavior.

---

## Context

A visual toggle that only hides the Advisor would not be a meaningful control.

A disabled feature should prevent the protected operation itself.

---

## Decision Rationale

The flow is:

```text
Persisted AI Setting
        ↓
AI Request
        ↓
Server Validation
        ↓
Enabled?
```

If disabled, the model is not invoked and usage is not recorded.

---

## Benefits

- Real feature control
- Better user preference enforcement
- Reduced unnecessary AI cost
- Clearer product behavior

---

## Tradeoffs

Settings become part of the server authorization path for AI.

That is appropriate because they control actual functionality.

---

# 33. Decision 31 — Meter AI Separately

## Decision

AI usage is measured as a distinct application capability.

---

## Context

AI calls have variable provider cost and product value.

Treating AI like an unlimited ordinary UI action would make it difficult to:

- Enforce plan limits
- Understand consumption
- Control cost

---

## Decision Rationale

AI follows:

```text
Request
  ↓
Entitlement
  ↓
Usage Check
  ↓
Model Call
  ↓
Usage Record
```

---

## Benefits

- Cost awareness
- Plan differentiation
- Better operational control
- Clear product boundary

---

## Tradeoffs

AI requests require additional accounting and enforcement logic.

---

# 34. Decision 32 — Keep AI Provider Replaceable

## Decision

Core application intelligence does not depend on one specific model provider.

---

## Context

Model providers can change:

- Pricing
- APIs
- Reliability
- Capabilities
- Terms

A system becomes fragile when its business rules depend directly on provider-specific model behavior.

---

## Decision Rationale

The model sits behind a conceptual boundary:

```text
Structured App Context
        ↓
AI Provider
        ↓
Advisory Output
```

The deterministic intelligence exists independently.

---

## Benefits

- Lower vendor lock-in
- Easier provider changes
- Better resilience
- Clearer architecture

---

## Tradeoffs

Provider-specific capabilities may require adapter logic if multiple providers are supported later.

---

# 35. Decision 33 — Do Not Make AI Failure a Platform Failure

## Decision

AppStack remains useful when the AI provider is unavailable.

---

## Context

External providers fail.

If AI were the only source of intelligence, an outage could eliminate the application's understanding of its own operational state.

---

## Decision Rationale

The architecture preserves:

```text
State
  ↓
Deterministic Intelligence
  ↓
Still Available
```

even if:

```text
AI Advisor
  ↓
Unavailable
```

---

## Benefits

- Smaller blast radius
- Better reliability
- Lower external dependency risk

---

## Tradeoffs

Some advisory functionality may temporarily disappear.

Core workflow and intelligence remain intact.

---

# 36. Decision 34 — Prefer Progressive Intelligence Over One Giant Function

## Decision

Intelligence is divided into specialized services rather than one monolithic calculation.

---

## Context

A single service could calculate:

- Health
- Priorities
- Forecast
- Risk
- Strategy
- Advisor context

That would create a large dependency surface.

---

## Decision Rationale

The pipeline uses specialized responsibilities.

Conceptually:

```text
Workspace Analysis
      ↓
Workspace Intelligence
      ↓
Priority
      ↓
Director
      ↓
Forecast
      ↓
Risk
      ↓
Strategy
      ↓
Advisor
```

---

## Benefits

- Easier debugging
- Lower coupling
- Easier testing
- More focused services
- Easier future extension

---

## Tradeoffs

More service boundaries exist.

The additional structure is justified because each layer represents a distinct kind of interpretation.

---

# 37. Decision 35 — Recalculate Intelligence From State

## Decision

Intelligence should respond to operational changes.

---

## Context

Static intelligence labels create the appearance of intelligence without actual dependency on system state.

---

## Decision Rationale

The expected behavior is:

```text
State Changes
     ↓
Intelligence Recalculates
     ↓
Presentation Changes
```

---

## Benefits

- More trustworthy system behavior
- Better explainability
- Real operational relevance

---

## Tradeoffs

Changes to state can trigger additional computation.

For AppStack's scale, deterministic recalculation is appropriate.

---

# 38. Decision 36 — Prefer Evidence-Based Intelligence

## Decision

Intelligence outputs should be traceable to system evidence where practical.

---

## Context

Labels such as:

```text
High Risk
Needs Attention
Priority
```

have little value if the system cannot explain why they exist.

---

## Decision Rationale

The preferred relationship is:

```text
Evidence
  ↓
Rule
  ↓
Intelligence Output
```

For AI:

```text
Evidence
  ↓
Deterministic Intelligence
  ↓
Structured Context
  ↓
Advisory Output
```

---

## Benefits

- Explainability
- Better debugging
- Greater trust
- Easier testing

---

# 39. Decision 37 — Treat Documentation as Part of Engineering

## Decision

Architecture and engineering decisions are documented alongside the application.

---

## Context

Code reveals implementation.

It does not always reveal:

- Why an approach was selected
- Which alternatives were rejected
- Which tradeoffs were accepted
- Which boundaries are intentional
- Which future changes are expected

---

## Decision Rationale

Documentation records engineering intent.

This helps distinguish:

```text
Accidental Implementation
```

from:

```text
Deliberate Architecture
```

---

## Benefits

- Easier onboarding
- Better maintenance
- Better architectural continuity
- Clearer portfolio communication

---

## Tradeoffs

Documentation requires maintenance.

Outdated documentation can be harmful.

Canonical documents therefore need to evolve with the application.

---

# 40. Decision 38 — Consolidate Documentation Rather Than Accumulate It

## Decision

Overlapping architecture documents should be consolidated into a smaller canonical set.

---

## Context

Long-running projects naturally accumulate:

- Drafts
- Transfer documents
- Early architecture notes
- Temporary design files
- Earlier versions of decisions

Keeping every document as equal authority creates ambiguity.

---

## Decision Rationale

The final documentation structure favors a curated set of canonical documents.

Examples:

```text
README.md
ARCHITECTURE.md
SYSTEM_WORKFLOW.md
INTELLIGENCE_PIPELINE.md
ENGINEERING_DECISIONS.md
MODULE_GUIDE.md
TECHNOLOGY_STACK.md
LESSONS_LEARNED.md
```

---

## Benefits

- Clear source of truth
- Easier reviewer navigation
- Reduced contradiction
- Lower maintenance cost

---

## Tradeoffs

Some historical material may be archived or removed.

That is preferable to maintaining multiple conflicting explanations of the same system.

---

# 41. Decision 39 — Remove Features That Do Not Have Real System Support

## Decision

A feature should not remain simply because it looks good in the interface.

---

## Context

A notification preference was removed because AppStack did not have a real notification system behind it.

Leaving the toggle would create a false implication that working functionality existed.

---

## Decision Rationale

The principle is:

> The interface should represent capabilities the system actually supports.

A fake configuration control creates misleading product behavior.

---

## Benefits

- More truthful UI
- Lower complexity
- Better product integrity

---

## Tradeoffs

The interface may contain fewer features.

That is preferable to displaying unsupported ones.

---

# 42. Decision 40 — Simplify Dashboard Information Hierarchy

## Decision

Dashboard cards were refined when their visual arrangement created misleading interpretations.

---

## Context

Displaying:

```text
Total Items = 10
Jobs = 3
Completed Jobs = 3
```

at the same visual hierarchy could imply that completed jobs were additional inventory rather than a breakdown of the three jobs.

---

## Decision Rationale

Operational job status was separated conceptually from inventory.

The hierarchy became:

```text
PLATFORM INVENTORY

Total
Analyses
Reports
Jobs
Tasks

OPERATIONAL STATUS

Active Jobs
Completed Jobs
```

---

## Benefits

- Clearer information architecture
- Reduced ambiguity
- Better executive readability

---

## Tradeoffs

Some information was removed or moved to avoid duplication.

Clarity was prioritized over card count.

---

# 43. Decision 41 — Remove Redundant Dashboard Information

## Decision

Latest Analysis was removed from Operational Status when the Platform Activity section already provided recent activity.

---

## Context

Two separate sections were communicating overlapping recency information.

---

## Decision Rationale

Each Dashboard section should have a distinct purpose.

```text
Inventory
What exists?

Operational Status
What is running or complete?

Platform Activity
What happened recently?
```

---

## Benefits

- Cleaner UI
- Less duplication
- Stronger information hierarchy

---

# 44. Decision 42 — Preserve a Small Curated Production Dataset

## Decision

Development and test records were removed from the primary portfolio user while a backup was retained.

---

## Context

Long-running testing had created a large number of:

- Analyses
- Reports
- Jobs
- Tasks

A cluttered production demo could make the portfolio application appear messy and obscure meaningful workflows.

---

## Decision Rationale

A curated set of representative workflow records was preserved.

A backup was created before cleanup.

This balanced:

```text
Clean Portfolio Presentation
        +
Recoverability
```

---

## Benefits

- Cleaner production demo
- Easier workflow inspection
- Reduced visual noise
- Safe cleanup process

---

## Tradeoffs

The primary demo dataset no longer reflects the full history of development testing.

That history was intentionally separated from the portfolio presentation.

---

# 45. Decision 43 — Audit Foreign Keys Before Destructive Cleanup

## Decision

Database relationships were inspected before deleting large numbers of test records.

---

## Context

Bulk deletion without understanding relational behavior can cause:

- Orphaned data
- Unexpected cascading deletes
- Foreign-key failures
- Broken workflows

---

## Decision Rationale

The cleanup process first established:

- Relevant foreign keys
- Cascade behavior
- Metadata relationships
- Backup coverage

Only then were test records removed.

---

## Benefits

- Lower data-loss risk
- Better change confidence
- More disciplined production maintenance

---

# 46. Decision 44 — Prefer Root-Cause Fixes Over Cosmetic Workarounds

## Decision

When system behavior is incorrect, AppStack debugging favors identifying the actual ownership boundary rather than hiding the symptom.

---

## Context

A problem can often be hidden quickly through UI logic.

That does not mean the underlying system is correct.

---

## Decision Rationale

The preferred debugging sequence is:

```text
Observe Symptom
     ↓
Identify Responsible Layer
     ↓
Find Root Cause
     ↓
Fix Responsible Boundary
     ↓
Regression Test
```

---

## Benefits

- More durable fixes
- Lower recurrence
- Better architectural understanding

---

# 47. Decision 45 — Keep Change Blast Radius Small

## Decision

Changes should affect the smallest appropriate responsibility.

---

## Context

A bug in one area does not automatically justify modifying neighboring systems.

For example:

```text
Task count presentation issue
```

does not automatically imply:

```text
Intelligence semantics are wrong
```

---

## Decision Rationale

The principle is:

> Change the layer that owns the problem.

---

## Benefits

- Reduced regressions
- Easier verification
- Better system stability

---

# 48. Decision 46 — Verify Features in Production

## Decision

A successful local build or development test is not treated as final proof.

---

## Context

Features can behave differently in production because of:

- Environment variables
- Authentication configuration
- External integrations
- Deployment behavior
- Webhook endpoints
- Build behavior

---

## Decision Rationale

The workflow is:

```text
Implement
   ↓
Local Verify
   ↓
Build
   ↓
Deploy
   ↓
Production Verify
```

---

## Benefits

- Higher confidence
- Detection of deployment-specific issues
- Better operational discipline

---

## Tradeoffs

Production verification requires additional time.

That cost is justified for important workflows.

---

# 49. Decision 47 — Use End-to-End Smoke Tests for Critical Workflows

## Decision

Major AppStack workflows are verified across module boundaries rather than testing only individual screens.

---

## Context

A module can work independently while the full workflow is broken.

For example:

```text
Analysis Works
Report Works
Jobs Work
```

does not automatically prove:

```text
Analysis → Report → Job
```

works correctly.

---

## Decision Rationale

Representative smoke tests exercise the actual chain.

```text
Authenticate
   ↓
Analyze
   ↓
Persist
   ↓
Generate Report
   ↓
Persist Report
   ↓
Create Job
   ↓
Complete Job
   ↓
Verify Relationships
   ↓
Verify Intelligence
   ↓
Verify Advisor
```

---

## Benefits

- Tests system integration
- Reveals cross-module defects
- Better production confidence

---

# 50. Decision 48 — Test Billing Independently as a Critical Boundary

## Decision

Billing synchronization and entitlement enforcement receive focused verification.

---

## Context

Billing failures affect:

- Revenue logic
- Access control
- Usage
- Subscription state

They have a larger blast radius than many ordinary UI defects.

---

## Decision Rationale

Billing is treated as a separate critical system boundary requiring dedicated verification.

---

## Benefits

- Better subscription reliability
- Better entitlement confidence
- Lower risk of silent access errors

---

# 51. Decision 49 — Preserve Correct Terminology

## Decision

Documentation and UI language should accurately describe what the system actually implements.

---

## Context

Terminology can accidentally overstate architecture.

Examples include calling simulated job progression a full distributed queue or describing a model suggestion as authoritative intelligence.

---

## Decision Rationale

AppStack distinguishes concepts carefully:

```text
Job Lifecycle
≠
Full Distributed Queue Infrastructure

AI Advisor
≠
Authoritative Business Logic

Dashboard
≠
Workspace

Authentication
≠
Authorization
```

---

## Benefits

- More credible documentation
- Better engineering communication
- Reduced architectural confusion

---

# 52. Decision 50 — Avoid Complexity for Portfolio Theater

## Decision

Technologies and patterns are not added merely to make the project appear more advanced.

---

## Context

A portfolio project can be tempted to add:

- Microservices
- Kubernetes
- Redis
- Kafka
- Multiple databases
- Agent frameworks
- Vector databases
- Complex queues

without a real system requirement.

---

## Decision Rationale

Complexity must earn its place.

The question is:

> What problem does this technology solve in this system?

If the answer is primarily:

> It looks impressive

then the architecture has probably become weaker rather than stronger.

---

## Benefits

- More credible engineering judgment
- Lower maintenance burden
- Easier explanation
- Better alignment between architecture and requirements

---

# 53. Decision 51 — Prefer Clear Boundaries Over Clever Code

## Decision

Architectural clarity is prioritized over compact or clever implementations.

---

## Context

A highly compressed implementation can reduce line count while increasing cognitive load.

Portfolio value comes from understandable engineering decisions, not code golf.

---

## Decision Rationale

A developer should be able to answer:

```text
Where does this responsibility live?

What depends on it?

What happens if it changes?

What should not know about it?
```

Clear answers are more valuable than clever syntax.

---

# 54. Decision 52 — Treat Maintainability as a First-Class Quality

## Decision

Maintainability influences architectural decisions during development rather than being postponed until after feature completion.

---

## Context

Software that works today but cannot be safely changed tomorrow has limited value.

---

## Decision Rationale

AppStack favors:

- Shared services
- Clear ownership
- Explicit contracts
- Consistent terminology
- Small blast radius
- Documentation
- Modular organization

---

## Benefits

- Easier future changes
- Faster debugging
- Better onboarding
- Lower regression risk

---

# 55. Decision 53 — Design for Change, Not Prediction

## Decision

AppStack avoids trying to predict every future requirement.

Instead, it preserves boundaries that make reasonable future changes manageable.

---

## Context

Overengineering often comes from trying to anticipate every possible future use case.

That can produce unnecessary abstractions.

---

## Decision Rationale

The better question is:

> If this responsibility changes, can it change locally?

The architecture favors local change over speculative infrastructure.

---

## Benefits

- Lower unnecessary complexity
- Better adaptability
- More practical extensibility

---

# 56. Decision 54 — Keep External Providers Behind Boundaries

## Decision

External providers supply capabilities without becoming the application's conceptual architecture.

---

## Context

AppStack uses:

- Supabase
- Stripe
- OpenAI
- Vercel

These are implementation choices.

They should not define the application's business responsibilities.

---

## Decision Rationale

Conceptually:

```text
AppStack Responsibility
        ↓
Provider Boundary
        ↓
External Service
```

If a provider changes, the responsibility should remain recognizable.

---

## Benefits

- Reduced vendor coupling
- Better architectural durability
- Easier future migration

---

# 57. Decision 55 — Let the System Tell the Truth About Its Capabilities

## Decision

AppStack does not intentionally present features as more complete or sophisticated than they are.

---

## Context

Production-oriented software documentation should distinguish among:

- Implemented capability
- Simulated architectural concept
- Future possibility

---

## Decision Rationale

Examples:

```text
Implemented:
Stripe subscription synchronization

Implemented:
Row Level Security

Implemented:
AI usage metering

Modeled:
Job lifecycle progression

Future possibility:
Dedicated distributed queue infrastructure

Future possibility:
Authorized agentic actions
```

---

## Benefits

- Technical credibility
- Better reviewer trust
- More accurate architectural communication

---

# 58. Decision 56 — Keep Human Judgment in the Advisory Loop

## Decision

The AI Advisor provides recommendations rather than autonomously executing significant application actions.

---

## Context

Moving from:

```text
Recommendation
```

to:

```text
Autonomous Action
```

introduces additional engineering requirements.

These include:

- Authorization
- Tool controls
- Validation
- Idempotency
- Audit history
- Error recovery
- Human approval

---

## Decision Rationale

The current architecture is:

```text
System Knowledge
      ↓
AI Advisory
      ↓
Human Judgment
      ↓
Application Action
```

---

## Benefits

- Lower operational risk
- Clearer control boundary
- Easier evaluation
- Better user agency

---

## Tradeoffs

The system is less autonomous.

That is appropriate for the current architecture.

---

# 59. Decision 57 — Make Future Agentic Behavior Build on Existing Controls

## Decision

If AppStack evolves toward agents, agentic behavior should sit downstream of the current deterministic control plane.

---

## Context

An agent is not simply an Advisor with a stronger prompt.

An agent introduces action.

---

## Decision Rationale

A future architecture should resemble:

```text
Deterministic Knowledge
        ↓
Intelligence
        ↓
Policy
        ↓
Agent Plan
        ↓
Authorized Tool
        ↓
Validation
        ↓
Action
        ↓
Event
```

rather than:

```text
AI
 ↓
Do Whatever It Wants
```

---

## Benefits

- Preserves security
- Preserves auditability
- Builds on existing architecture
- Reduces autonomous blast radius

---

# 60. Decision Categories

The major AppStack decisions can be grouped into several themes.

## Architecture

- Modular monolith
- Shared services
- Clear boundaries
- Small blast radius
- Provider abstraction

## Data

- Persistence before intelligence
- User ownership
- Row Level Security
- Relationships
- Events

## Workflow

- Analysis → Report → Job
- Workspace management
- Job lifecycle modeling
- Deep-link identity

## Intelligence

- Deterministic interpretation
- Progressive intelligence
- Evidence-based outputs
- Recalculation from state

## AI

- AI downstream of knowledge
- Structured context
- Server-controlled access
- Usage metering
- Human-in-the-loop advisory

## SaaS

- Stripe billing
- Webhook synchronization
- Subscription semantics
- Entitlements
- Usage limits

## Production Engineering

- Manual production verification
- Manual end-to-end smoke testing
- Safe cleanup
- Root-cause debugging
- Accurate documentation

---

# 61. Architectural Decision Pattern

A useful summary pattern for AppStack is:

```text
Requirement
    ↓
Identify Responsibility
    ↓
Evaluate Alternatives
    ↓
Choose Simplest Sufficient Design
    ↓
Define Boundary
    ↓
Implement
    ↓
Verify
    ↓
Observe Tradeoffs
    ↓
Revisit Only When Conditions Change
```

This prevents architecture from becoming technology selection without reasoning.

---

# 62. What Would Cause These Decisions to Change?

Engineering decisions are not permanent laws.

They are contextual choices.

Examples:

## Microservices

Revisit if independent scale, deployment, ownership, or reliability requirements emerge.

## Real Queue Infrastructure

Revisit if jobs become long-running, high-volume, retry-sensitive, or independently processed.

## More Explicit Relational Modeling

Revisit if workflow relationships become numerous, complex, or heavily queried.

## Agentic Automation

Revisit if the system needs authorized autonomous actions and the required safety controls exist.

## Additional Observability Infrastructure

Revisit if operational scale requires centralized logs, tracing, metrics, or alerting.

A good architecture allows decisions to evolve without pretending that future requirements are already known.

---

# 63. Engineering Judgment Over Pattern Collection

AppStack intentionally does not attempt to demonstrate every popular architecture pattern.

A project can contain many advanced technologies and still exhibit poor engineering judgment.

The more meaningful questions are:

```text
Was the problem understood?

Was responsibility assigned correctly?

Was complexity justified?

Were tradeoffs recognized?

Were security boundaries respected?

Was production behavior verified?

Can the architecture be explained?

Can the system evolve?
```

Those questions guided the decisions documented here.

---

# 64. Decision-Making Principles

Several recurring principles appear across these decisions.

### Principle 1

Use the simplest architecture that satisfies the actual system requirements.

### Principle 2

Separate responsibilities before separating infrastructure.

### Principle 3

Keep deterministic truth outside probabilistic systems.

### Principle 4

Persist knowledge before building intelligence from it.

### Principle 5

Preserve meaningful history.

### Principle 6

Enforce security and entitlements below the UI.

### Principle 7

Treat external providers as dependencies, not architecture owners.

### Principle 8

Keep change blast radius small.

### Principle 9

Verify production behavior.

### Principle 10

Do not add complexity for appearances.

---

# 65. Engineering Decisions Summary

The major architectural story of AppStack can be reduced to this sequence:

```text
Use a modular monolith
        ↓
Separate responsibilities
        ↓
Centralize reusable operations
        ↓
Persist domain state
        ↓
Preserve relationships
        ↓
Record meaningful events
        ↓
Build CRUD before intelligence
        ↓
Build deterministic intelligence
        ↓
Place AI downstream
        ↓
Control AI with settings and entitlements
        ↓
Synchronize billing through webhooks
        ↓
Enforce policy server-side
        ↓
Protect data with authentication + RLS
        ↓
Verify the whole workflow in production
```

These decisions reinforce one another.

They are not independent technical tricks.

Together they define the system.

---

# Closing Perspective

The defining engineering decision behind AppStack was not the choice of Next.js, Supabase, Stripe, OpenAI, or Vercel.

Those are technologies.

The deeper decisions were about responsibility.

Which system owns truth?

Which system owns history?

Which layer owns business rules?

Which layer owns user access?

Which layer owns billing state?

Which layer owns product policy?

Which layer interprets operational state?

Where does AI belong?

What should remain deterministic?

What complexity is justified?

What complexity should be rejected?

How can a feature fail without breaking unrelated parts of the system?

Those questions shaped AppStack more than any individual framework.

The result is an architecture built around a consistent principle:

> **Choose boundaries intentionally, keep authoritative behavior deterministic, introduce complexity only when it solves a real problem, and make every major dependency earn its place in the system.**