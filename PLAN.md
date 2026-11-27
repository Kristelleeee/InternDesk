# InternDesk MVP Plan

Status — Draft for design approval

## Product goal

Help one intern plan each week, ask for help before work stalls, and show their supervisor what shipped and what they learned. The MVP runs as a personal web app. The intern decides what to share.

## MVP scope

| Feature | What the intern can do |
| --- | --- |
| Tasks | Create, edit, complete, and reopen tasks and subtasks. Set a due date and link a task to a goal. Mark work as blocked and record the next question or action. |
| Goals | Track internship objectives and link them to work. Open a goal to see completed tasks, learning notes, and evidence of progress. |
| Calendar | See task deadlines alongside manually entered meetings and check-ins. Jump from an event or deadline to its details. |
| Notes | Capture meeting takeaways, feedback, and lessons. Link a note to a task or goal and turn a follow-up into a task. |
| Ask AI | Open a task, choose what context to send, and request draft subtasks. Edit, select, or dismiss suggestions. Only confirmed suggestions become tasks. The task stays open if the AI request fails. |
| Weekly reports | Pick a week and generate an editable draft from recorded work, goal progress, selected notes, and blockers. Preview and copy the report as Markdown for sharing. |

## Features that make the demo stand out

- **Impact Timeline.** Add a short outcome and an optional artifact link to a completed task. Group those entries under internship goals so a supervisor can see which work demonstrates each skill. Measurable results are optional and entered by the intern.
- **Check-in Brief.** Pull together completed work, upcoming deadlines, and flagged blockers for a selected week. For each blocker, show the next action or decision needed so the intern can arrive at a check-in with a concrete ask. This brief is the starting point for the weekly report.
- **Feedback follow-through.** Convert a supervisor’s feedback note into a linked task. Completing the task makes the follow-through visible from the original note and the associated goal. The intern chooses whether the feedback itself appears in a report.

## Data and sharing

- Use a single-user workspace. Keep task, goal, note, calendar, and report records in persistent storage. Save report drafts so they can be reopened after a refresh.
- The AI request shows the exact context before sending. It starts with the task title and lets the intern add selected text. Notes, links, and other workspace records stay private by default.
- Reports include recorded facts and user-entered outcomes. Private notes enter a report only when selected. A report is shared when the intern copies it and sends it themselves.
- Defer collaboration, calendar sync, notifications, file uploads, and automatic report delivery until after MVP feedback.

## GitHub milestones

These milestones are proposed for the repository once the design is approved. Each issue can be opened with the title below and assigned to its milestone.

| Milestone | Proposed GitHub issues | Done when |
| --- | --- | --- |
| M1 · Daily Planner | Set up app and persistence; Build tasks and subtasks; Build calendar and check-ins | An intern can plan a week, flag a blocker, and reopen the app with their data intact. |
| M2 · Goals and Feedback | Build goals and linked notes; Convert feedback to tasks; Build Impact Timeline | A completed follow-up is visible from its source note and goal, with an optional artifact link. |
| M3 · Ask AI | Add context preview and AI request; Build suggestion review and confirmation; Handle errors and retries | Selected drafts save once, dismissed drafts do not save, and manual task entry remains available on failure. |
| M4 · Check-in and Demo | Build Check-in Brief; Save and copy weekly reports; Add fictional demo data and verify workflows | A supervisor-facing report can be drafted, edited, saved, and copied. Private notes stay out unless explicitly selected. |

## Three-minute supervisor demo

1. Open the goal **Improve reporting accuracy** and show a linked feedback note about inconsistent date formats.
2. Convert the feedback into a task, open Ask AI, and review draft subtasks such as checking date formats and documenting the fix.
3. Complete the task, record the outcome, and show it on the Impact Timeline with a fictional checklist link.
4. Open the Check-in Brief and show a blocker that requires a supervisor decision. Preview and copy the edited weekly report.

## Approval

Approve the feature scope, report sharing flow, and AI review workflow before implementation or GitHub setup. Hosting, storage technology, and AI provider can be selected after scope approval.
