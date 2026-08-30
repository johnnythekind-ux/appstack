# AppStack Module Guide

## Module Responsibilities, Boundaries & System Relationships

**Document:** Module Guide  
**Status:** Production Portfolio Documentation  
**Version:** 2.0

---

# 1. Purpose

AppStack is organized around modules with explicit responsibilities.

Each module exists to solve a specific class of problem.

The purpose of this document is to define:

- What each module does
- What responsibility it owns
- What information it receives
- What information it produces
- Which services and systems it depends on
- Which other modules it collaborates with
- What responsibilities intentionally belong somewhere else

The central principle is:

> A module should have a clear reason to exist and a clear boundary around what it owns.

AppStack's modules collaborate through persistence, services, events, relationships, navigation, and structured contracts.

They should not become isolated applications, nor should every module attempt to own the entire workflow.

---

# 2. Module Map

The primary AppStack modules are:

```text
AppStack
│
├── Authentication
│
├── Dashboard
│
├── Workspace
│
├── Deal Analyzer
│
├── ReportForge
│
├── Jobs
│
├── Intelligence
│   ├── Director
│   ├── Forecast
│   ├── Risk
│   ├── Strategy
│   ├── Insights
│   └── Advisor
│
├── Billing & Entitlements
│
└── Settings
```

Supporting these modules are shared application systems:

```text
Shared Services
Persistence
Events
Business Rules
Authentication
Authorization
Usage Metering
AI Integration
External Providers
```

---

# 3. Responsibility Model

AppStack modules can be understood through a simple responsibility map.

| Module | Primary Responsibility |
|---|---|
| Authentication | Establish user identity |
| Dashboard | Observe and navigate |
| Workspace | Inspect and manage persisted work |
| Deal Analyzer | Create deterministic business analysis |
| ReportForge | Transform analysis into a report |
| Jobs | Represent operational processing |
| Intelligence | Interpret system state |
| Advisor | Provide AI-assisted reasoning |
| Billing | Represent subscription state |
| Entitlements | Enforce product access |
| Settings | Control user preferences |

These responsibilities intentionally differ.

For example:

```text
Dashboard
≠
Workspace

Workspace
≠
Deal Analyzer

Intelligence
≠
AI

Billing
≠
Entitlements

Authentication
≠
Authorization
```

Understanding those distinctions is essential to understanding the architecture.

---

# 4. Authentication

## Purpose

Authentication establishes the identity of the person using AppStack.

It answers:

> Who is making this request?

---

## Primary Responsibilities

Authentication is responsible for:

- User signup
- User login
- Session establishment
- Session-aware application access
- Logout
- Protected application entry

Supabase Authentication provides the underlying identity infrastructure.

---

## Inputs

```text
User Credentials
```

---

## Outputs

```text
Authenticated Identity
Authenticated Session
```

---

## Workflow

```text
User
  ↓
Signup / Login
  ↓
Supabase Auth
  ↓
Authenticated Session
  ↓
Protected AppStack
```

---

## Downstream Consumers

Authenticated identity is used by:

- Workspace
- Persistence services
- Row Level Security
- Billing
- Usage
- Settings
- AI access
- Entitlement enforcement

---

## Authentication Does Not Own

Authentication does not determine:

- Which subscription plan the user has
- How many analyses the user may create
- Whether AI usage remains
- What records another user owns
- What business rules mean
- What Intelligence recommends

Those responsibilities belong to other systems.

---

# 5. Dashboard

## Purpose

Dashboard provides a high-level operational view of AppStack.

It answers:

> What is happening across the platform?

Dashboard is an observation and navigation surface.

---

## Primary Responsibilities

Dashboard presents:

- Total persisted items
- Analysis count
- Report count
- Job count
- Task count
- Active job status
- Completed job status
- Executive briefing
- Workspace health
- Progress
- Priority information
- Recent platform activity

---

## Inputs

Dashboard consumes information from:

```text
Workspace State
      +
Job State
      +
Intelligence
      +
Recent Activity
```

---

## Outputs

Dashboard primarily produces:

```text
Operational Visibility
      +
Navigation Intent
```

It does not create authoritative business state simply by displaying it.

---

# 6. Dashboard Information Hierarchy

Dashboard separates different categories of information.

## Platform Inventory

Answers:

> What exists?

Examples:

```text
Total Items
Analyses
Reports
Jobs
Tasks
```

---

## Operational Status

Answers:

> What is happening with operational work?

Examples:

```text
Active Jobs
Completed Jobs
```

---

## Executive Briefing

Answers:

> What does the current system state mean at a high level?

Examples:

```text
Health
Progress
Priority Actions
```

---

## Platform Activity

Answers:

> What happened recently?

This separation prevents unrelated concepts from appearing as though they belong to the same count or hierarchy.

---

# 7. Dashboard Navigation

Dashboard activity items can navigate to exact persisted Workspace objects.

```text
Dashboard Activity
       ↓
Workspace Deep Link
       ↓
Exact Object
```

This preserves object identity across navigation.

The responsibility model is:

```text
Dashboard
Observe + Navigate
      ↓
Workspace
Inspect + Manage
```

---

## Dashboard Does Not Own

Dashboard does not own:

- Full CRUD management
- Bulk deletion
- Business calculations
- Report generation
- Job lifecycle logic
- Intelligence calculations
- Subscription synchronization

Those responsibilities remain elsewhere.

---

# 8. Workspace

## Purpose

Workspace is AppStack's central operational management surface.

It answers:

> What persisted work exists, and how can I inspect or manage it?

---

## Primary Responsibilities

Workspace manages:

- Analyses
- Reports
- Jobs
- Tasks
- Search
- Filtering
- Sorting
- Selection
- Duplication
- Deletion
- Bulk deletion
- Task creation
- Event history
- Cross-module relationships
- Deep-linked object selection

---

## Workspace Object Model

Conceptually:

```text
Workspace Item
      │
      ├── Analysis
      ├── Report
      ├── Job
      └── Task
```

This shared representation allows multiple object types to participate in common management behavior.

---

# 9. Workspace Inputs

Workspace consumes:

```text
Authenticated User
      ↓
User-Scoped Persisted Objects
      +
Events
      +
Relationship Metadata
```

---

## Workspace Outputs

Workspace can produce:

```text
Object Selection
Object Updates
Object Duplication
Object Deletion
Task Creation
Workflow Navigation
```

State changes can then affect downstream Intelligence.

---

# 10. Workspace Search, Filter & Sort

Workspace allows persisted objects to be explored through:

- Search
- Type filtering
- Sorting

Supported object categories include:

```text
All
Analyses
Reports
Jobs
Tasks
```

These capabilities belong in Workspace because Workspace owns operational inspection and management.

---

# 11. Workspace Selection

A selected Workspace item can expose:

- Object details
- Type
- Status
- Metadata
- Related events
- Available actions

Selection creates an operational context around one persisted object.

---

# 12. Workspace Deep Linking

Workspace can accept a request for an exact persisted object.

Conceptually:

```text
/workspace?itemId=<id>
```

The module:

```text
Reads Requested Identity
       ↓
Loads User-Scoped Items
       ↓
Finds Exact Object
       ↓
Selects Object
       ↓
Reveals Object
```

If the object no longer exists, stale URL state is removed.

This keeps:

```text
URL State
UI State
Persistence State
```

consistent.

---

# 13. Workspace Bulk Operations

Workspace owns multi-object management.

Conceptually:

```text
Select Multiple Objects
        ↓
Bulk Action
        ↓
Persistence Operations
        ↓
Workspace Refresh
```

Bulk management does not belong on Dashboard because Dashboard is not the system's primary management surface.

---

# 14. Workspace and Intelligence

Workspace state is a major input to Intelligence.

Conceptually:

```text
Analyses
   +
Reports
   +
Jobs
   +
Tasks
   +
Events
   +
Relationships
   ↓
Intelligence Pipeline
```

Workspace does not need to calculate every Intelligence output itself.

It provides the operational state from which Intelligence can be derived.

---

## Workspace Does Not Own

Workspace does not own:

- MAO business rules
- Report generation logic
- Job lifecycle rules
- Subscription billing
- AI model reasoning
- Authentication infrastructure

Workspace coordinates persisted operational work.

---

# 15. Deal Analyzer

## Purpose

Deal Analyzer transforms structured property information into deterministic business analysis.

It answers:

> Given these known inputs and business rules, what is the calculated deal position?

---

## Primary Responsibilities

Deal Analyzer handles:

- Structured property input
- Input validation
- Deterministic calculations
- Recommendation generation
- Analysis persistence

---

## Inputs

Representative inputs include:

```text
Purchase Price
After-Repair Value
Repair Cost
```

---

# 16. Deal Analyzer Business Rule

A central deterministic calculation is:

```text
MAO = ARV × 70% − Repairs
```

This calculation belongs to application logic.

It does not belong to AI.

---

## Processing

```text
User Input
     ↓
Validation
     ↓
Deterministic Rule
     ↓
Calculated Result
     ↓
Recommendation
```

---

## Outputs

Deal Analyzer can produce:

```text
Calculated MAO
Recommendation
Persisted Analysis
Workspace Item
Related Event
```

---

# 17. Deal Analyzer Role in the Larger Workflow

Deal Analyzer begins one of AppStack's primary workflow chains.

```text
Deal Analyzer
      ↓
Analysis
      ↓
ReportForge
      ↓
Report
      ↓
Jobs
```

The analysis becomes reusable system knowledge rather than remaining temporary interface state.

---

## Deal Analyzer Does Not Own

Deal Analyzer does not own:

- Report generation
- Job processing
- Workspace management
- AI advisory
- Billing
- Subscription policy

Its responsibility ends with creating and persisting authoritative analysis knowledge.

---

# 18. ReportForge

## Purpose

ReportForge transforms persisted analysis knowledge into a reusable report artifact.

It answers:

> How can an existing analysis become a structured downstream deliverable?

---

## Primary Responsibilities

ReportForge handles:

- Loading analysis context
- Generating report content
- Persisting reports
- Preserving source-analysis relationships
- Reopening saved reports
- Handing persisted reports into Jobs

---

## Inputs

```text
Persisted Analysis
      +
Analysis Relationship Context
```

---

## Processing

```text
Analysis
   ↓
Load Context
   ↓
Generate Report
   ↓
Persist Report
```

---

## Outputs

```text
Investor Report
Persisted Report
Workspace Item
Analysis → Report Relationship
Related Event
```

---

# 19. Report Persistence

Generated content becomes more valuable when it survives the current interaction.

```text
Generated Report
      ↓
Save
      ↓
Persistent Report
```

A saved report can then:

- Appear in Workspace
- Be reopened
- Participate in history
- Become the source for a processing job
- Contribute to Intelligence

---

# 20. Analysis-to-Report Relationship

ReportForge preserves the report's source context.

```text
Analysis
   ↓
Report
```

This prevents the report from becoming an unrelated artifact.

The system can understand that it represents a later stage of the same workflow.

---

# 21. ReportForge-to-Jobs Handoff

Once a report is persisted, ReportForge can hand it directly into Jobs.

```text
Persisted Report
      ↓
Create Processing Job
      ↓
Jobs
```

The handoff preserves:

- Report identity
- Report title
- Workflow context

This is an example of cross-module orchestration.

ReportForge does not become the Jobs module.

It hands responsibility to it.

---

## ReportForge Does Not Own

ReportForge does not own:

- Original business calculations
- Workspace CRUD
- Job lifecycle progression
- Intelligence calculations
- Billing
- AI entitlement policy

---

# 22. Jobs

## Purpose

Jobs represents operational work that progresses through a lifecycle.

It answers:

> What processing work exists, and what state is that work currently in?

---

## Primary Responsibilities

Jobs handles:

- Job creation
- Job persistence
- Job status
- Lifecycle progression
- Saved job visibility
- Report-to-job context

---

## Job Lifecycle

AppStack models:

```text
Queued
  ↓
Running
  ↓
Completed
```

This makes operational progression visible to the application.

---

# 23. Jobs Inputs

Jobs can receive context from ReportForge.

```text
Report ID
Report Title
```

That context identifies the upstream artifact responsible for the work.

---

## Jobs Outputs

```text
Persisted Job
Job Status
Workspace Item
Report → Job Relationship
Related Events
```

---

# 24. Jobs and Asynchronous Architecture

Jobs demonstrates asynchronous workflow concepts.

The current implementation models lifecycle progression without claiming dedicated distributed worker infrastructure.

This distinction is intentional.

```text
Current AppStack

Persistent Job
     ↓
Queued
     ↓
Running
     ↓
Completed
```

A larger production system could later introduce:

```text
Queue
Workers
Retries
Dead-Letter Handling
Independent Processing
```

if the workload required them.

---

## Jobs Does Not Own

Jobs does not own:

- Report generation
- Business calculations
- Workspace CRUD
- Intelligence strategy
- Billing
- AI reasoning

Jobs owns operational lifecycle state.

---

# 25. Tasks

## Purpose

Tasks represent manual operational work.

They answer:

> What work remains that requires user attention?

Tasks are managed through Workspace rather than existing as a separate top-level module.

---

## Primary Responsibilities

Tasks participate in:

- Workspace inventory
- Operational state
- Manual work tracking
- Intelligence calculations

---

## Inputs

```text
User-Defined Work
```

---

## Outputs

```text
Persisted Task
Pending / Completed Work Context
Intelligence Signal
```

---

# 26. Tasks and Intelligence

Tasks are important because manual work can affect whether the system is operationally complete.

```text
Pending Task
     ↓
Outstanding Work
     ↓
Intelligence
     ↓
Health / Progress / Priority Impact
```

Removing or completing relevant work can cause Intelligence to recalculate.

---

# 27. Event System

## Purpose

The Event system preserves meaningful application history.

It answers:

> What happened?

---

## Primary Responsibilities

Events can represent meaningful actions such as:

- Analysis creation
- Report generation
- Job creation
- Job progression
- Workflow activity

---

## Event Model

```text
Application Action
       ↓
State Change
       +
Event
```

State and events provide different information.

```text
STATE
What is true now?

EVENT
What happened?
```

---

# 28. Event Inputs

Events can receive:

```text
User Identity
Workspace Item
Event Type
Event Metadata
Timestamp
```

---

## Event Outputs

```text
Historical Context
Activity Timeline
Intelligence Input
Operational Evidence
```

---

## Event System Does Not Own

Events do not determine:

- Current business truth
- User permissions
- Subscription policy
- AI reasoning

Events preserve history.

Other systems interpret that history.

---

# 29. Intelligence

## Purpose

Intelligence interprets persisted operational state.

It answers:

> What does the current state of the system mean?

---

## Primary Responsibilities

The Intelligence system can produce:

- Workspace health
- Progress
- Bottleneck identification
- Recommended actions
- Priority actions
- Director plan
- Forecast
- Risk
- Strategy
- Insights

---

## Inputs

```text
Workspace Items
      +
Statuses
      +
Relationships
      +
Events
      +
Deterministic Rules
```

---

## Outputs

```text
Workspace Intelligence
Priority Actions
Director Plan
Forecast
Risk
Strategy
Insights
```

---

# 30. Intelligence Pipeline

Conceptually:

```text
Workspace State
      ↓
Event Analysis
      ↓
Workspace Analysis
      ↓
Workspace Intelligence
      ↓
Priority Actions
      ↓
Director
      ↓
Forecast
      ↓
Risk
      ↓
Strategy
      ↓
Insights
```

Each stage adds a different kind of interpretation.

---

# 31. Intelligence Responsibility Boundary

Intelligence does not create the facts it evaluates.

It consumes application knowledge.

For example:

```text
Job Completed
```

is established by job state.

Intelligence may interpret that fact as evidence of workflow progress.

Likewise:

```text
Task Pending
```

is established by Workspace state.

Intelligence may interpret it as outstanding work.

---

## Intelligence Does Not Own

Intelligence does not own:

- Authentication
- Data ownership
- Billing
- Business calculations
- AI model access
- Persistence truth

It interprets information established by those systems.

---

# 32. Director

## Purpose

Director organizes multiple intelligence signals into operational direction.

It answers:

> What should the system focus on now?

---

## Inputs

```text
Workspace Intelligence
        +
Priority Actions
```

---

## Outputs

Potential Director outputs include:

```text
Primary Objective
Current Focus
Operational Direction
Recommended Next Step
```

---

## Director Boundary

Director is deterministic orchestration.

It is not an autonomous AI agent.

It organizes known intelligence rather than independently executing actions.

---

# 33. Forecast

## Purpose

Forecast evaluates likely operational direction based on current state.

It answers:

> Given the current conditions, where does the workflow appear to be heading?

---

## Inputs

```text
Current State
Progress
Workflow Signals
```

---

## Outputs

```text
Expected Operational Direction
```

Forecast remains grounded in application state rather than attempting unrestricted prediction.

---

# 34. Risk

## Purpose

Risk identifies conditions that may threaten progress or require attention.

It answers:

> What conditions should concern the user?

---

## Inputs

```text
Operational State
Outstanding Work
Workflow Conditions
```

---

## Outputs

```text
Risk Level
Risk Conditions
Supporting Evidence
```

---

## Risk Boundary

Risk should remain evidence-based.

It should not produce dramatic labels without a traceable operational reason.

---

# 35. Strategy

## Purpose

Strategy combines intelligence signals into broader operational direction.

It answers:

> Given the current state, what general approach makes sense?

---

## Inputs

```text
Workspace Intelligence
Priority Actions
Forecast
Risk
```

---

## Outputs

```text
Strategic Direction
Recommended Focus
```

Strategy is broader than a single priority.

---

# 36. Insights

## Purpose

Insights surface meaningful observations from system state and history.

They answer:

> What important patterns or conditions can be observed?

---

## Inputs

```text
State
History
Progress
Priority
Forecast
Risk
Strategy
```

---

## Outputs

```text
Structured Observations
Supporting Evidence
Advisor Context
```

Insights are particularly useful as evidence for AI-assisted reasoning.

---

# 37. AI Advisor

## Purpose

Advisor provides conversational reasoning over structured AppStack intelligence.

It answers:

> Given what the system already knows, what higher-level guidance can be offered?

---

## Primary Responsibilities

Advisor handles:

- Structured context consumption
- AI model invocation
- Advisory reasoning
- User-facing AI responses

---

## Advisor Inputs

The model can receive structured information such as:

```text
Workspace Intelligence
Director
Forecast
Risk
Strategy
Insights
```

---

## Advisor Processing

```text
Deterministic Intelligence
          ↓
Structured Context
          ↓
Entitlement / Setting Check
          ↓
AI Model
          ↓
Advisory Response
```

---

# 38. Advisor Output

Advisor can provide:

- Explanations
- Prioritization guidance
- Operational interpretation
- Recommended focus
- Evidence-aware advisory responses

The output is probabilistic.

It is therefore treated differently from deterministic application state.

---

# 39. Advisor Responsibility Boundary

Advisor does not determine:

- MAO
- User identity
- Record ownership
- Subscription status
- Job status
- Usage limits
- Entitlements
- Workspace progress rules

The application establishes those facts.

Advisor reasons about them.

The central boundary is:

```text
APPLICATION TRUTH
       ↓
DETERMINISTIC INTELLIGENCE
       ↓
AI ADVISORY
```

---

# 40. Billing

## Purpose

Billing provides visibility and workflows around subscription state.

It answers:

> What commercial subscription state applies to this user?

Stripe provides the external billing infrastructure.

AppStack maintains the internal representation needed for product behavior.

---

## Primary Responsibilities

Billing supports:

- Plan visibility
- Subscription status
- Billing-period visibility
- Cancellation-state visibility
- Upgrade flow
- Customer billing management
- Usage visibility

---

## Inputs

```text
Authenticated User
      +
AppStack Subscription State
      +
Stripe Billing State
      +
Usage
```

---

## Outputs

```text
Billing UI
Upgrade Flow
Portal Flow
Subscription Visibility
```

---

# 41. Billing Synchronization

Stripe can change subscription state outside the active AppStack session.

Webhooks synchronize those changes.

```text
Stripe
  ↓
Webhook Event
  ↓
Signature Verification
  ↓
Subscription Synchronization
  ↓
AppStack Billing State
```

Supported subscription-related workflows include events for:

```text
Checkout Completion
Subscription Creation
Subscription Update
Subscription Deletion
```

---

## Billing Does Not Own

Billing does not independently decide:

- Whether an analysis operation is allowed
- Whether a report operation is allowed
- Whether AI usage remains
- Which Workspace records belong to the user

Those decisions belong to entitlement and authorization systems.

---

# 42. Entitlements

## Purpose

Entitlements translate product policy into application access.

They answer:

> Given this user's plan and usage, is this operation allowed?

---

## Primary Responsibilities

Entitlements enforce limits for capabilities such as:

- Analyses
- Reports
- Jobs
- AI usage

---

## Inputs

```text
User
  +
Plan
  +
Subscription State
  +
Current Usage
  +
Feature Policy
```

---

## Processing

```text
Requested Operation
       ↓
Plan Lookup
       ↓
Usage Lookup
       ↓
Limit Evaluation
       ↓
Allowed / Rejected
```

---

## Outputs

```text
Permission to Execute
```

or:

```text
Controlled Rejection
```

---

# 43. Server-Side Entitlement Enforcement

Entitlements are enforced on the server.

The UI may communicate limits.

It is not trusted as the final enforcement boundary.

```text
UI
 ↓
Request
 ↓
Server Entitlement Check
 ↓
Allowed?
```

This protects product policy even if client behavior is manipulated.

---

# 44. Usage Metering

## Purpose

Usage metering records consumption of limited capabilities.

It answers:

> How much of this capability has the user consumed during the relevant period?

---

## Metered Capabilities

Examples include:

```text
Analyses
Reports
Jobs
AI
```

---

## Workflow

```text
Operation Requested
       ↓
Entitlement Check
       ↓
Operation Succeeds
       ↓
Usage Recorded
```

Usage is interpreted within the relevant subscription period.

---

# 45. Settings

## Purpose

Settings manages user-controlled application preferences.

It answers:

> How has this user configured supported application behavior?

---

## Primary Responsibilities

Settings supports persisted preferences such as:

- Profile information
- AI assistance preference

---

## Inputs

```text
Authenticated User
      +
User Preference Changes
```

---

## Outputs

```text
Persisted Settings
```

---

# 46. AI Assistance Setting

The AI preference controls real application behavior.

```text
AI Assistance Enabled?
       ↓
Yes / No
       ↓
Server Enforcement
```

If AI assistance is disabled:

```text
Advisor Request
      ↓
Blocked
      ↓
No Model Invocation
      ↓
No AI Usage Consumed
```

The setting is therefore functional rather than cosmetic.

---

## Settings Does Not Own

Settings does not own:

- Model reasoning
- Entitlement policy
- Subscription state
- Authentication
- Intelligence calculations

It stores user preferences consumed by those systems.

---

# 47. Shared Services

## Purpose

Shared services centralize reusable application operations.

Representative responsibilities include:

```text
workspaceService
eventService
analysisService
jobService
billingService
billingUsageService
recommendationService
workspaceIntelligenceService
workspacePriorityService
workspaceDirectorService
workspaceForecastService
workspaceRiskService
workspaceStrategyService
workspaceAdvisorService
decisionService
```

---

# 48. Service Responsibility Pattern

A service should generally represent a cohesive application responsibility.

```text
Module
  ↓
Service Contract
  ↓
Application Operation
  ↓
Persistence / External System
```

This keeps modules from directly owning every implementation detail.

---

# 49. Persistence Layer

## Purpose

Persistence stores application state that must survive beyond the current interaction.

Supabase/PostgreSQL provides the primary persistence infrastructure.

---

## Persisted Concepts

AppStack stores concepts including:

- Workspace items
- Events
- Subscription state
- Usage
- Settings
- Relationship metadata

---

## Persistence Boundary

Persistence answers:

> What must survive?

It does not decide:

> What does this information mean?

That interpretation belongs to business logic and Intelligence.

---

# 50. Authorization & Row Level Security

## Purpose

Authorization ensures authenticated users access only permitted data.

Supabase Row Level Security reinforces user ownership at the database layer.

---

## Workflow

```text
Authenticated Identity
       ↓
User-Scoped Query
       ↓
RLS Policy
       ↓
Authorized Data
```

---

## Responsibility Boundary

Authentication answers:

```text
Who are you?
```

Authorization answers:

```text
What may you access?
```

These are separate responsibilities.

---

# 51. External Provider Boundaries

AppStack integrates with several external platforms.

## Supabase

Provides:

```text
PostgreSQL
Authentication
Row Level Security
Data Infrastructure
```

## Stripe

Provides:

```text
Checkout
Subscriptions
Customer Billing Management
Billing Events
```

## OpenAI

Provides:

```text
Probabilistic Reasoning
AI Advisory Generation
```

## Vercel

Provides:

```text
Hosting
Deployment
Production Environment
```

---

# 52. Provider Responsibility Principle

External providers supply capabilities.

They do not own AppStack's conceptual architecture.

For example:

```text
Stripe
owns payment infrastructure

AppStack
owns entitlement policy
```

```text
OpenAI
provides model reasoning

AppStack
owns deterministic intelligence
```

```text
Supabase
provides authentication infrastructure

AppStack
owns application workflow
```

This keeps provider responsibilities explicit.

---

# 53. Module Collaboration

Modules collaborate without losing ownership.

A representative flow is:

```text
Authentication
      ↓
Deal Analyzer
      ↓
Analysis
      ↓
Workspace
      ↓
ReportForge
      ↓
Report
      ↓
Jobs
      ↓
Events
      ↓
Intelligence
      ↓
Advisor
      ↓
Dashboard
```

Supporting the flow:

```text
Billing
Entitlements
Settings
Authorization
Usage
```

operate as cross-cutting platform capabilities.

---

# 54. Primary Business Workflow

The central business workflow is:

```text
Structured Input
      ↓
Deal Analyzer
      ↓
Deterministic Analysis
      ↓
Persisted Analysis
      ↓
ReportForge
      ↓
Persisted Report
      ↓
Jobs
      ↓
Completed Operational Work
```

Each stage owns a distinct transformation.

---

# 55. Operational Knowledge Workflow

The operational knowledge workflow is:

```text
Workspace Items
      +
Events
      +
Relationships
      ↓
Workspace Intelligence
      ↓
Priorities
      ↓
Director
      ↓
Forecast
      ↓
Risk
      ↓
Strategy
      ↓
Insights
```

---

# 56. AI Workflow

The AI workflow is:

```text
Deterministic Intelligence
        ↓
Structured Advisor Context
        ↓
AI Setting Check
        ↓
Entitlement Check
        ↓
Usage Check
        ↓
OpenAI
        ↓
Advisory Response
        ↓
Usage Record
```

This keeps AI downstream of application-controlled state.

---

# 57. SaaS Access Workflow

The commercial-access workflow is:

```text
User
 ↓
Stripe Checkout
 ↓
Subscription
 ↓
Webhook
 ↓
AppStack Subscription State
 ↓
Plan
 ↓
Entitlements
 ↓
Feature Access
```

This separates payment infrastructure from product policy.

---

# 58. Module Dependency Principles

Module dependencies should follow several rules.

## Rule 1

Presentation can depend on application services.

## Rule 2

Business rules should not depend on presentation.

## Rule 3

Intelligence can depend on application state.

## Rule 4

Application truth should not depend on AI output.

## Rule 5

Product access can depend on subscription and usage.

## Rule 6

Security should not depend solely on the UI.

## Rule 7

External providers should remain behind application-controlled boundaries.

---

# 59. Responsibility Matrix

| Capability | Owns | Does Not Own |
|---|---|---|
| Authentication | Identity | Product permissions |
| Dashboard | Visibility | CRUD management |
| Workspace | Persisted-object management | Domain calculations |
| Deal Analyzer | Business analysis | Reports |
| ReportForge | Report generation | Job lifecycle |
| Jobs | Operational lifecycle | Report generation |
| Tasks | Manual work state | Intelligence rules |
| Events | History | Current business truth |
| Intelligence | Deterministic interpretation | Source facts |
| Advisor | Probabilistic advisory | Authoritative state |
| Billing | Subscription visibility/sync | Feature authorization |
| Entitlements | Product access policy | Payment processing |
| Usage | Consumption accounting | Subscription billing |
| Settings | User preferences | AI reasoning |

---

# 60. Why Responsibility Boundaries Matter

Without explicit boundaries, a system can gradually become:

```text
Dashboard
├── Billing Logic
├── Intelligence Logic
├── CRUD Logic
├── AI Calls
├── Job Processing
└── Settings
```

or:

```text
Workspace
├── Everything
```

That creates high coupling.

AppStack instead aims for:

```text
Module
  ↓
Clear Responsibility
  ↓
Stable Contract
  ↓
Collaboration
```

The system becomes easier to understand because each major capability has an architectural home.

---

# 61. Module Failure Isolation

Clear module boundaries also help contain failures.

For example:

```text
AI Provider Failure
```

should not mean:

```text
Authentication Failure
Database Failure
Billing Failure
Deterministic Intelligence Failure
```

Likewise:

```text
Report Generation Failure
```

should not corrupt an existing analysis.

Boundaries help reduce blast radius.

---

# 62. Module Evolution

A module can evolve without requiring the entire system to be redesigned.

Examples:

```text
Jobs
Current lifecycle simulation
      ↓
Future queue infrastructure
```

```text
Advisor
Current human-in-the-loop advisory
      ↓
Future authorized agent tools
```

```text
Relationships
Current metadata relationships
      ↓
Future explicit relational model
```

The responsibility remains recognizable even if the implementation changes.

---

# 63. Adding a New Module

A new AppStack module should answer several questions before implementation.

```text
What responsibility does it own?

What problem does it solve?

What information does it consume?

What information does it produce?

Which services does it require?

What persists?

What events should exist?

Does it affect Intelligence?

Does it require an entitlement?

What other module owns adjacent responsibilities?

What should this module explicitly NOT own?
```

If these questions cannot be answered clearly, the module boundary may not yet be well defined.

---

# 64. Module Design Template

Future modules can follow this pattern.

```text
MODULE NAME

Purpose
    ↓
Primary Responsibility

Inputs
    ↓
Required Knowledge

Processing
    ↓
Business / Application Behavior

Outputs
    ↓
Persistent State / Events / Artifacts

Dependencies
    ↓
Services / External Systems

Downstream Consumers
    ↓
Other Modules

Does Not Own
    ↓
Explicit Boundary
```

This keeps module design consistent with the rest of AppStack.

---

# 65. Complete Module Relationship Map

```text
                         USER
                           │
                           ▼
                   AUTHENTICATION
                           │
                           ▼
                     APPSTACK SHELL
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    DASHBOARD          WORKSPACE         DEAL ANALYZER
        │                  │                  │
        │                  │                  ▼
        │                  │              ANALYSIS
        │                  │                  │
        │                  │                  ▼
        │                  └─────────── REPORTFORGE
        │                                     │
        │                                     ▼
        │                                   REPORT
        │                                     │
        │                                     ▼
        │                                    JOBS
        │                                     │
        │                                     ▼
        │                                   EVENTS
        │                                     │
        │                                     ▼
        │                              INTELLIGENCE
        │                                     │
        │                      ┌──────────────┼──────────────┐
        │                      │              │              │
        │                      ▼              ▼              ▼
        │                  DIRECTOR       FORECAST          RISK
        │                      │              │              │
        │                      └──────┬───────┴──────┬───────┘
        │                             │              │
        │                             ▼              ▼
        │                          STRATEGY        INSIGHTS
        │                             │              │
        │                             └──────┬───────┘
        │                                    ▼
        │                                 ADVISOR
        │                                    │
        └────────────────────────────────────┘
                           │
                           ▼
                     USER ACTION


CROSS-CUTTING PLATFORM SYSTEMS

Authentication
Authorization / RLS
Billing
Entitlements
Usage Metering
Settings
Shared Services
Persistence
```

---

# 66. Module Architecture Summary

The module system can be summarized through eight responsibility statements.

```text
AUTHENTICATION
establishes identity.

DASHBOARD
observes the system.

WORKSPACE
manages persisted work.

DEAL ANALYZER
creates deterministic business knowledge.

REPORTFORGE
turns knowledge into an artifact.

JOBS
turn artifacts into operational work.

INTELLIGENCE
interprets operational state.

ADVISOR
reasons conversationally over structured intelligence.
```

Supporting them:

```text
EVENTS
preserve history.

BILLING
tracks subscription state.

ENTITLEMENTS
enforce product policy.

USAGE
measures consumption.

SETTINGS
preserve user preferences.

RLS
protects user-owned data.
```

---

# 67. Module Success Criteria

The AppStack module architecture is successful when:

- Each major capability has identifiable ownership
- Modules collaborate through explicit information
- Business rules are not duplicated across pages
- Persisted state can move between workflows
- Relationships survive module transitions
- Dashboard does not become Workspace
- Workspace does not become every feature module
- Intelligence does not become persistence
- AI does not become business logic
- Billing does not become authorization
- Authentication does not become entitlement policy
- External providers remain bounded dependencies
- Individual modules can evolve without unnecessary system-wide rewrites

---

# Closing Perspective

AppStack's modules are not simply pages in a navigation menu.

Each represents a responsibility inside a larger system.

The Deal Analyzer establishes business knowledge.

ReportForge transforms that knowledge into an artifact.

Jobs turns artifacts into operational work.

Workspace manages the persisted objects produced by those workflows.

Events preserve what happened.

Intelligence interprets what the accumulated state means.

Advisor extends that intelligence with probabilistic reasoning.

Dashboard provides system-level visibility.

Authentication establishes identity.

Row Level Security protects ownership.

Billing synchronizes commercial state.

Entitlements translate commercial state into product access.

Usage tracks consumption.

Settings preserve user-controlled behavior.

Each capability remains useful individually.

Their greater value comes from the way they collaborate without surrendering their boundaries.

That is the purpose of AppStack's module architecture:

> **Build specialized capabilities with clear ownership, then connect them into a coherent system.**