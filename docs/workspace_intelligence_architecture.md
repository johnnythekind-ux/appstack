# Workspace Intelligence Architecture

---

# Purpose

The Workspace Intelligence Architecture defines how AppStack transforms raw workspace activity into understandable operational insight and actionable planning.

Its goals are to:

- Separate responsibilities cleanly.
- Prevent duplicate calculations.
- Build intelligence in layers.
- Keep the UI independent of the internal architecture.
- Create a professional, explainable architecture suitable for production software.

Every service should transform one well-defined input into one well-defined output.

---

# Core Philosophy

AppStack separates three different questions:

1. **What happened?**
2. **What does it mean?**
3. **What should happen next?**

Those questions belong to different services.

No service should answer all three.

---

# Intelligence Layers

```text
Reality
    ↓
Events
    ↓
History
    ↓
Metrics
    ↓
Knowledge
    ↓
Operational Intelligence
    ↓
Planning Intelligence
    ↓
Presentation
```

Each layer adds value.

Each layer has one responsibility.

---

# Item Intelligence

Item Intelligence reasons about a single workspace item.

Pipeline:

```text
Workspace Item
        +
Item Events
        ↓
WorkspaceAnalysis
        ↓
Recommendation
```

Primary Services:

- analysisService
- recommendationService

## analysisService

Responsible for determining:

- stage
- health
- event count
- last activity

It describes one workspace item.

It does **not** manage the workspace.

---

## recommendationService

Receives one WorkspaceAnalysis.

Produces:

- Generate report
- Create follow-up job
- Continue execution
- Review item
- No action needed

It recommends the next action for one item only.

---

# Historical Intelligence

Historical Intelligence studies workspace activity over time.

Pipeline:

```text
Events
    ↓
WorkspaceHistory
    ↓
WorkspaceMetrics
    ↓
WorkspaceKnowledge
```

---

## workspaceHistoryService

Responsible for factual history.

Owns:

- total events
- first event
- last event
- history span
- event counts
- recent activity
- previous activity
- activity trend

Answers:

> What happened?

It never answers:

- Is it healthy?
- Is it risky?
- What should happen next?

History is factual only.

---

## workspaceMetricsService

Converts history into measurements.

Owns:

- events per day
- analyses per day
- reports per day
- jobs per day
- report/analysis ratio
- job/report ratio
- recent activity share
- velocity

Answers:

> How much activity exists?

It does **not** determine:

- health
- priority
- strategy
- recommendations

Metrics are measurements only.

---

## workspaceKnowledgeService

Transforms measurements into interpretation.

Owns:

- focus
- activity status
- production status
- execution status
- recent activity status
- summary

Knowledge explains what the measurements mean.

Knowledge must never invent facts that the data cannot prove.

Example:

Correct:

> More reports than analyses have been recorded.

Incorrect:

> Some analyses failed to produce reports.

Knowledge interprets evidence.

It does not invent lineage.

# Operational Intelligence

Operational Intelligence studies the **current condition** of the workspace.

Unlike Historical Intelligence, it is not concerned with trends over time.

It answers:

- What condition is the workspace in right now?
- Where is work blocked?
- How much work remains?
- What is the current operational health?

Pipeline:

```text
Workspace Items
        +
Grouped Events
        ↓
WorkspaceAnalysis[]
        ↓
WorkspaceIntelligence
```

---

## WorkspaceAnalysis

Each workspace item is analyzed independently.

The result is one WorkspaceAnalysis object per item.

WorkspaceAnalysis describes:

- stage
- health
- event history
- current operational state

This collection becomes the input for Workspace Intelligence.

---

## workspaceIntelligenceService

Responsible for aggregating all WorkspaceAnalysis objects into a single workspace diagnosis.

Owns:

- totalItems
- healthyItems
- unknownItems
- needsReports
- needsJobs
- workspaceHealth
- primaryBottleneck
- progressPercent
- recommendedWorkspaceAction

Answers:

> What condition is the workspace currently in?

Workspace Intelligence diagnoses.

It does not:

- rebuild event history
- calculate metrics
- determine strategy
- forecast the future

---

# Relationship Between Historical and Operational Intelligence

Historical Intelligence and Operational Intelligence are parallel systems.

Historical Intelligence answers:

> What has happened?

Operational Intelligence answers:

> What exists right now?

Neither replaces the other.

Architecture:

```text
Historical Branch

Events
   ↓
History
   ↓
Metrics
   ↓
Knowledge



Operational Branch

Workspace Items
       +
Grouped Events
        ↓
WorkspaceAnalysis[]
        ↓
WorkspaceIntelligence
```

Planning Intelligence consumes both.

---

# Planning Intelligence

Planning Intelligence decides what should happen next.

It should consume prepared intelligence instead of repeatedly examining raw data.

Pipeline:

```text
Knowledge
      +
Workspace Intelligence
      +
Item Recommendations
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

Every planning service should consume only the inputs required for its responsibility.

Dependencies follow responsibility.

Not visual order.

---

## workspacePriorityService

Responsible for determining:

- highest-value actions
- ordered action list

Typical outputs:

- Generate report
- Create job
- Review item

Answers:

> What should be worked on first?

Priority determines importance.

It does not build execution plans.

---

## workspaceDirectorService

Responsible for converting priorities into execution.

Produces:

- next best action
- ordered work plan
- estimated time
- execution summary

Answers:

> How should the work be executed?

Director coordinates execution.

It does not rebuild Intelligence.

---

## workspaceForecastService

Responsible for estimating future workspace state.

Produces:

- projected health
- projected progress
- projected improvement
- forecast confidence
- prediction summary

Answers:

> What is likely to happen if today's plan is completed?

Forecast consumes operational information.

Forecast should never rebuild:

- History
- Metrics
- Knowledge
- Priorities

Those inputs should already exist.

---

## workspaceRiskService

Responsible for identifying threats to progress.

Examples:

- unresolved work
- unknown items
- declining activity
- execution backlog
- forecast uncertainty

Answers:

> What could prevent success?

Risk identifies problems.

Risk does not decide strategy.

---

## workspaceStrategyService

Responsible for determining the overall operational approach.

Examples:

- focus on reporting
- reduce backlog
- stabilize workspace
- improve execution

Answers:

> What overall direction should the workspace take?

Strategy is broader than a single action.

---

## workspaceAdvisorService

Responsible for communicating the combined intelligence.

Advisor combines:

- Knowledge
- Workspace Intelligence
- Forecast
- Risk
- Strategy

Answers:

> What does the user most need to understand right now?

Advisor communicates.

It should not recalculate the underlying services.

# Workspace Intelligence Coordinator

The Workspace Intelligence Coordinator is the orchestration layer.

It does not own business logic.

It coordinates the execution of all intelligence services.

Pipeline:

```text
Workspace Items + Events
            │
            ├──────── Historical Branch
            │
            │   Events
            │     ↓
            │  WorkspaceHistory
            │     ↓
            │  WorkspaceMetrics
            │     ↓
            │  WorkspaceKnowledge
            │
            └──────── Operational Branch
                 Workspace Items
                        +
                 Grouped Events
                        ↓
                 WorkspaceAnalysis[]
                        ↓
                 WorkspaceIntelligence
                          │
                          ▼
                  Planning Intelligence
                          │
                          ▼
                    Composite Result
```

The Coordinator is responsible for:

- Loading workspace items.
- Loading events.
- Grouping events by workspace item.
- Building historical intelligence.
- Building operational intelligence.
- Executing planning services.
- Returning one unified intelligence object to the UI.

The Coordinator should never become a dumping ground for business rules.

---

# UI Architecture

One of the most important architectural rules in AppStack is:

```text
Architectural Service
        ≠
UI Section
```

Adding a new service does **not** automatically justify adding another card, panel, or page.

Internal architecture and user interface are independent concerns.

Many specialized services may support a small number of polished UI experiences.

The Workspace should eventually evolve toward something like:

```text
Workspace

├── Summary
├── Mission Control
├── Workspace Intelligence
│     ├── Overview
│     ├── History
│     ├── Planning
│     └── Advisor
├── Recent Work
└── Selected Item
```

The user should interact with decisions and insights—not individual architectural services.

---

# Dependency Rules

## Rule 1

Always consume the highest appropriate layer.

Example:

```text
Risk
    ↓
Consumes Knowledge

NOT

Risk
    ↓
Recalculates Metrics
```

---

## Rule 2

Dependencies follow responsibility.

Not visual order.

Example:

Forecast may consume:

- Workspace Intelligence
- Priority Actions
- Director Plan
- Workspace Knowledge

It does **not** consume Risk simply because Risk appears nearby in the architecture.

---

## Rule 3

Avoid duplicate calculations.

Historical counts belong in History.

Rates belong in Metrics.

Interpretation belongs in Knowledge.

Operational diagnosis belongs in Workspace Intelligence.

Planning belongs in Planning Intelligence.

Every calculation should have exactly one home whenever practical.

---

## Rule 4

Separate diagnosis from planning.

Diagnosis answers:

> What condition exists?

Planning answers:

> What should happen next?

Those are different responsibilities.

---

## Rule 5

Do not invent information.

Aggregate measurements cannot justify item-level conclusions.

For example:

Correct:

> More reports than analyses have been recorded.

Incorrect:

> Some analyses failed to generate reports.

Unless item lineage exists, the architecture should avoid causal statements.

---

# Design Philosophy

AppStack becomes intelligent because each layer specializes.

Not because every service knows everything.

Each layer should answer one class of question exceptionally well.

That creates:

- cleaner code
- easier testing
- fewer duplicated calculations
- simpler maintenance
- easier future AI integration
- clearer architecture for hiring managers

The goal is not more services.

The goal is better separation of concerns.

# Future Architectural Refinements

The current Workspace Intelligence Architecture is stable and intentionally layered.

The following refinements have been identified during the architectural audit. None of them are required immediately. They should be treated as isolated refactors after the architecture has stabilized.

---

# History

Current:

```ts
daysActive
```

Current meaning:

> Calendar days since the first recorded event.

Possible future rename:

```ts
historySpanDays
```

Reason:

The current name suggests the number of days containing activity, which is not what is actually calculated.

---

# Metrics

Current:

```ts
eventsPerDay
analysesPerDay
reportsPerDay
jobsPerDay
```

Current meaning:

Average events since tracking began.

Possible future names:

```ts
eventsPerCalendarDay
analysesPerCalendarDay
reportsPerCalendarDay
jobsPerCalendarDay
```

These names more accurately describe the calculation.

---

# Ratios

Current:

```ts
reportToAnalysisRatio
jobToReportRatio
```

Keep these names.

Do **not** rename them to:

- Report Conversion
- Job Conversion

Reason:

The current architecture does not track parent-child lineage between analyses, reports, and jobs.

The ratios describe aggregate counts—not actual conversions.

---

# Workspace Intelligence

Current:

```ts
progressPercent
```

Current meaning:

Percentage of workspace items currently classified as healthy.

Possible future rename:

```ts
healthyItemPercent
```

This better reflects the actual calculation.

---

Current:

```ts
recommendedAction
```

Possible future rename:

```ts
recommendedWorkspaceAction
```

Reason:

Differentiate workspace-level recommendations from item-level recommendations.

---

# Workspace Knowledge

Current focus determination:

```text
Balanced
```

Current behavior:

Balanced means multiple activity categories tie for the highest count.

Possible future refinement:

Determine balance using proportional distribution or tolerance ranges rather than exact equality.

---

# Workspace Velocity

Current implementation:

Velocity is based primarily on overall event frequency.

Possible future refinement:

Separate velocity into multiple dimensions:

```text
Activity Velocity
Production Velocity
Execution Velocity
```

This would distinguish:

- overall activity
- report production
- execution throughput

---

# Planning Intelligence

As Planning Intelligence matures, each service should consume the highest appropriate layer.

Example:

```text
Risk
    ↓
Knowledge

NOT

Risk
    ↓
History
Metrics
```

Services should avoid recalculating information that already exists.

---

# UI Evolution

Future UI work should focus on consolidation rather than expansion.

Target direction:

```text
Workspace

├── Summary
├── Mission Control
├── Workspace Intelligence
│     ├── Overview
│     ├── History
│     ├── Planning
│     └── Advisor
├── Recent Work
└── Selected Item
```

Internal architecture may continue to grow without exposing additional permanent cards.

---

# Completion Criteria

The Workspace Intelligence Architecture is considered complete when it provides:

```text
Reality
    ↓
History
    ↓
Metrics
    ↓
Knowledge
    ↓
Operational Intelligence
    ↓
Planning Intelligence
    ↓
Presentation
```

After these layers are stable, development emphasis should shift toward:

- UI refinement
- testing
- observability
- performance
- documentation
- naming clarity
- portfolio polish

The objective is not to create the largest architecture possible.

The objective is to create a professional architecture whose responsibilities are clear, maintainable, and easy to explain.

---

# Guiding Principle

> AppStack should not become intelligent because every service knows everything.

> AppStack should become intelligent because every service knows exactly what it is responsible for.