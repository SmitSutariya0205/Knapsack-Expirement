# Knapsack Experiment — Data Interpretation Guide

_Prepared for the Caplin Lab research team (NYU / KU Leuven collaboration)_  
_Last updated: April 2026_

---

## Overview

Participant data is stored in a **PostgreSQL database** (Neon serverless) via the Prisma ORM.  
There are two tables: **`Participant`** (main data) and **`EmailVerification`** (transient, not for analysis).

The backend API is hosted at: `https://knapsack-expirement-3f13.onrender.com`

---

## The `Participant` Table

Each row is one participant session.

### Top-Level Fields

| Column | Type | Meaning |
|---|---|---|
| `participantId` | String (UUID) | Primary identifier used throughout the app. Stored in the participant's browser `sessionStorage`. |
| `createdAt` | DateTime | When the database record was first created. |
| `email` | String? | Set only for email-verified participants (non-Prolific path). |
| `prolificPid` | String? | The Prolific participant's unique ID. In **TEST MODE** (current), a timestamp suffix is appended (e.g. `abc123_1714000000000`) to allow re-runs. In production this will be the raw Prolific PID. **Demo users** have IDs prefixed with `demo_`. |
| `studyId` | String? | The Prolific study ID (from the URL parameter `?STUDY_ID=`). |
| `sessionId` | String? | The Prolific session ID (from the URL parameter `?SESSION_ID=`). |
| `registeredAt` | DateTime? | When the participant clicked through the Prolific entry URL and was registered. |
| `completedAt` | DateTime? | Set when the participant reaches the final completion screen. `null` if they dropped out. |
| `testPractice` | JSON? | Results from the **Practice phase** (pre-test tutorial). |
| `testSkill` | JSON? | Results from **Test 1** (skill test, sequential, 10 questions). |
| `testBenchmark` | JSON? | Results from **Test 2** (benchmark, free navigation, 30 questions, 10 min). |
| `testFinal` | JSON? | Results from **Test 3** (final/prediction, free navigation, 30 questions, 10 min). |
| `timeTracking` | JSON? | High-level section timing (currently minimal; detailed timing is inside each test JSON). |

---

## Identifying Participant Types

```
demo_*          → Demo/researcher test runs  — EXCLUDE from analysis
*_<timestamp>   → TEST MODE duplicate runs   — review whether to include or exclude
plain UUID      → Normal Prolific participants — PRIMARY ANALYSIS GROUP
```

---

## Test Result JSON Structure

Every test field (`testSkill`, `testBenchmark`, `testFinal`) has the same shape:

```jsonc
{
  "completed": true,             // Whether the test was formally completed (timer ran out or user clicked Finish)
  "totalQuestions": 30,          // Total questions in this test
  "correctAnswers": 18,          // Questions answered correctly (confirmed + correct)
  "incorrectAnswers": 4,         // Questions answered incorrectly (confirmed + wrong)
  "unansweredQuestions": 8,      // Questions not confirmed (skipped or timed out)
  "accuracy": 0.60,              // correctAnswers / totalQuestions  (0.0 – 1.0)
  "totalPoints": 52,             // Points earned: correct×2 + unanswered×1 + incorrect×0
  "maxPoints": 60,               // Maximum possible: totalQuestions × 2
  "timeUsed": 487,               // Seconds spent before completing or timing out

  // Per-question answer records
  "answers": [
    {
      "questionId": 14,          // Unique question identifier (integer)
      "selected": [1, 3],        // Ball IDs the participant selected (0 = nothing selected)
      "confirmed": true,         // true = participant clicked Confirm; false = skipped/timed-out
      "correct": true,           // Whether the selection matches the optimal knapsack solution
      "timeSpent": 23400,        // ms spent on this particular question (from first visit to confirm/leave)
      "difficulty": "medium"     // "easy" | "medium" | "hard"
    }
    // ... one entry per question, including unanswered ones
  ],

  // Per-question absolute timestamps
  "questionTimes": [
    {
      "questionId": 14,
      "startTime": 1714000100000, // Unix ms timestamp when participant first arrived at this question
      "endTime": 1714000123400,   // Unix ms timestamp when they left (navigated away or completed test)
      "timeSpent": 23400,         // endTime - startTime (ms)
      "difficulty": "medium"
    }
    // ... one entry per question
  ],

  // *** NEW (Test 2 & 3 only) ***
  // Full chronological log of every question visit — enables attempt-ordering analysis
  "navigationLog": [
    {
      "visitIndex": 0,            // 0 = first thing they did when the test started
      "questionId": 1,            // Which question they visited
      "questionIndex": 0,         // Its 0-based position in the question list
      "arrivedAt": 1714000100000, // Unix ms timestamp of arrival
      "leftAt": 1714000123400,    // Unix ms timestamp of departure
      "dwellMs": 23400            // Time spent on this visit (ms)
    },
    {
      "visitIndex": 1,
      "questionId": 15,
      "questionIndex": 14,
      "arrivedAt": 1714000123400,
      "leftAt": 1714000145000,
      "dwellMs": 21600
    }
    // ... one entry per visit (multiple entries per question if re-visited)
  ]
}
```

> **Note:** `testPractice` has the same structure but is from the tutorial phase (unscored practice).  
> **Note:** `testSkill` (Test 1) does not have a `navigationLog` because Test 1 is sequential — questions are shown in fixed order and cannot be revisited. The attempt order equals the question list order.

---

## How to Derive Key Metrics

### 1. Attempt Ordering (which question they tried first, second, etc.)

Use `navigationLog` from Test 2 or Test 3:

```python
# Sort by visitIndex (already in order, but explicit):
visit_sequence = sorted(participant['testBenchmark']['navigationLog'], key=lambda x: x['visitIndex'])

# First question attempted:
first_attempt = visit_sequence[0]['questionId']  if visit_sequence else None

# Unique questions in order of first visit:
seen = []
for visit in visit_sequence:
    if visit['questionId'] not in seen:
        seen.append(visit['questionId'])
# 'seen' now holds question IDs in the order first attempted
```

### 2. Dwell Time Per Question (total time spent, including re-visits)

```python
from collections import defaultdict

dwell_per_question = defaultdict(int)
for visit in participant['testBenchmark']['navigationLog']:
    dwell_per_question[visit['questionId']] += visit.get('dwellMs', 0)

# Average dwell time in seconds:
avg_dwell_s = sum(dwell_per_question.values()) / len(dwell_per_question) / 1000
```

### 3. Number of Times a Question Was Re-visited

```python
from collections import Counter
revisit_counts = Counter(v['questionId'] for v in navigationLog)
```

### 4. Whether a Participant Skipped Hard Questions

```python
# Find all hard questions they never confirmed an answer for:
hard_skipped = [
    a for a in participant['testBenchmark']['answers']
    if a['difficulty'] == 'hard' and not a['confirmed']
]
```

### 5. Time Efficiency (score per minute spent)

```python
time_used_min = participant['testBenchmark']['timeUsed'] / 60
score = participant['testBenchmark']['totalPoints']
efficiency = score / time_used_min if time_used_min > 0 else 0
```

---

## Phase → Test Mapping

| UI Label | DB Field | Questions | Timer | Navigation |
|---|---|---|---|---|
| Practice | `testPractice` | ~6 (tutorial) | None | Sequential |
| Test 1 | `testSkill` | 10 | 10 min | Sequential (no backtracking) |
| Test 2 | `testBenchmark` | 30 | 10 min | Free (any order) |
| Test 3 (Final) | `testFinal` | 30 | 10 min | Free (any order) |

---

## Scoring System

All scored tests use the same rule:

| Outcome | Points |
|---|---|
| Correct answer (confirmed) | **2 points** |
| Incorrect answer (confirmed) | **0 points** |
| Unanswered / Skipped | **1 point** |

**Rationale:** The 1-point unanswered bonus discourages guessing while not penalizing strategic skipping.

---

## Exporting Data

### Admin CSV Export
```
GET https://knapsack-expirement-3f13.onrender.com/api/v1/admin/export-csv
Headers: x-admin-key: <admin_key>
```
Returns a CSV with one row per participant and high-level summary columns.

### Full JSON Export (Prolific participants only)
```
GET https://knapsack-expirement-3f13.onrender.com/api/v1/export-prolific-data
```
Returns full nested JSON including all test data for all Prolific participants.

### Admin Analytics Dashboard
```
GET https://knapsack-expirement-3f13.onrender.com/api/v1/admin/analytics
Headers: x-admin-key: <admin_key>
```

---

## ⚠️ Current Known Issues / Things to Address Before Final Analysis

1. **TEST MODE is active** — Duplicate Prolific ID check is disabled. The `prolificPid` field currently has timestamps appended. This was enabled for testing. **Disable before the final study run.**

2. **Demo participants** — Filter out any `prolificPid` starting with `demo_` before analysis.

3. **`testPractice`** — The practice phase data may not be submitted in all cases (early drop-offs). Check `completed: true` before including.

4. **`navigationLog` only exists in Test 2 & 3** — Test 1 is sequential, no log needed. Earlier sessions (before April 2026) will not have `navigationLog` in their data.

---

## Contact

Backend & data pipeline: **Vivek Mattam** (vm2677@nyu.edu)  
Frontend & experiment design: **Leo Zhu** (yz6902@nyu.edu)
