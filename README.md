# InternDesk

InternDesk is a personal internship planner. The M1 build includes tasks, subtasks, priority labels, waiting status, deadlines, meetings, and check-ins. See [PLAN.md](PLAN.md) for the milestones.

## Run locally

With Node.js installed, run the following in the project directory.

```sh
npm start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser. No dependencies need to be installed.

## Try the planner

1. Create a task with a due date. Pick a priority. If you need something before you can continue, select **Waiting on something** and enter what you need.
2. Add a subtask, then complete and reopen it using its checkbox.
3. Select the due date in Calendar and add a check-in. Open both entries from the day's agenda.
4. Reload the page to see your saved work.

The app stores records in this browser profile for the local URL above. Returning to that URL in the same profile loads your records. Clearing site data removes them.
