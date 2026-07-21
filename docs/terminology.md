# Terminology
## Official Product Vocabulary

Project: AppStack

Status: Active

Purpose: Establish a single, canonical vocabulary for AppStack.

Every important product term has one official meaning.

Future development should reuse these definitions rather than invent new terminology.

---

# Why This Document Exists

As software grows, inconsistent terminology creates confusion.

For example:

Analysis

Assessment

Evaluation

Review

These may sound similar, but they should not be interchangeable.

Every concept should have one official name.

---

# Workspace

Definition

The central operating environment where all user work is organized, managed, and completed.

Purpose

Acts as the command center for AppStack.

Contains

- Analyses
- Reports
- Jobs
- Workspace Intelligence
- Activity
- AI Guidance

---

# Workspace Item

Definition

Any object managed inside the Workspace.

Current Types

- Analysis
- Report
- Job

Future types may be added without changing the definition.

---

# Analysis

Definition

A structured evaluation generated from user data.

Purpose

Help users understand a situation before making decisions.

Examples

- Deal Analysis
- Property Analysis
- Opportunity Analysis

Produces

Recommendations and supporting data.

---

# Report

Definition

A formatted presentation of information intended for review or communication.

Purpose

Transform analyses into readable outputs.

Reports communicate.

Analyses evaluate.

---

# Job

Definition

A unit of work executed by AppStack.

Purpose

Represent background processing or automated tasks.

Examples

- Report Generation
- AI Processing
- Import
- Export
- Synchronization

---

# Event

Definition

A recorded action that occurred within the system.

Purpose

Provide historical context.

Examples

Analysis Created

Report Generated

Job Created

Item Deleted

Item Duplicated

Events describe what happened.

---

# Timeline

Definition

An ordered history of Events.

Purpose

Allow users and intelligence services to understand progression over time.

---

# Workspace Intelligence

Definition

The combined understanding generated from workspace activity.

Purpose

Summarize the overall condition of the Workspace.

It represents the output of multiple intelligence services working together.

---

# Intelligence Service

Definition

An independent module responsible for generating one type of reasoning.

Current Examples

- Forecast
- Risk
- Strategy
- Priority
- Insights
- Director

Each service owns exactly one responsibility.

---

# Coordinator

Definition

A service responsible for orchestrating multiple intelligence services.

Purpose

Collect outputs.

Assemble results.

Return a unified intelligence object.

Coordinators do not generate intelligence.

They organize intelligence.

---

# Forecast

Definition

A prediction describing the likely future state of the Workspace if current recommendations are followed.

Purpose

Answer:

"What will probably happen?"

---

# Strategy

Definition

A prioritized sequence of work.

Purpose

Answer:

"In what order should work be completed?"

---

# Risk

Definition

An evaluation of potential problems that could prevent successful completion of work.

Purpose

Answer:

"What could go wrong?"

---

# Insight

Definition

A meaningful observation derived from Workspace activity.

Purpose

Reveal patterns the user may not immediately notice.

Insights explain.

They do not recommend.

---

# Priority

Definition

A ranked action requiring user attention.

Purpose

Identify the most important work.

Priorities answer:

"What deserves attention first?"

---

# Recommendation

Definition

A suggested course of action generated from analysis.

Purpose

Guide decision-making.

Recommendations are actionable.

---

# Workspace Coach

Definition

The primary guidance system presented to the user.

Purpose

Orient users.

Reduce uncertainty.

Encourage progress.

The Coach translates intelligence into understandable guidance.

---

# Director

Definition

The service responsible for creating today's operational plan.

Purpose

Transform priorities into an executable workflow.

The Director plans work.

The Coach presents work.

---

# Workspace Browser

Definition

The interface used to browse Workspace Items.

Purpose

Search.

Filter.

Locate work.

---

# Workspace Inspector

Definition

The detailed view for a selected Workspace Item.

Purpose

Display information, history, recommendations, and available actions.

---

# Business Logic

Definition

Rules that determine how AppStack behaves.

Business logic belongs in services.

Never in UI components.

---

# Presentation Layer

Definition

The user interface responsible for displaying information.

Purpose

Present business logic.

Not perform business logic.

---

# Progressive Disclosure

Definition

A design approach that reveals additional complexity only when needed.

Purpose

Reduce cognitive load.

Keep simple tasks simple.

---

# Information Architecture

Definition

The organization and structure of information within the product.

Purpose

Determine where information belongs.

Not how it looks.

---

# User Experience (UX)

Definition

The overall experience users have while interacting with AppStack.

Purpose

Make accomplishing work feel intuitive and efficient.

---

# Product Principle

Definition

A guiding belief that influences future design decisions.

Purpose

Maintain consistency as the product evolves.

---

# Canonical Naming Rule

If a concept already exists in this document, use its official name throughout AppStack.

Avoid introducing alternate names for existing concepts.

Examples

Preferred

Analysis

Not

Assessment

Evaluation

Review

unless those represent genuinely different concepts.

Consistency improves readability, maintainability, onboarding, and communication across the project.

---

# Future Terminology

This document should expand as AppStack grows.

Every significant concept introduced into the platform should receive an official definition before becoming widely used throughout the codebase.

The goal is to ensure that AppStack develops a stable, precise, and consistent language that supports both developers and users.