# Workforce Command Center

## Model

Use `bi_task_fact` as the detailed fact table. The other four imported views are
already aggregated reporting tables and should remain disconnected to avoid
ambiguous filter paths and double counting.

Format `Completion Rate`, `On-Time Rate`, `Average Workload`, and
`Allocation Success Rate` as percentages with one decimal place.

## Page 1 — Executive Overview

- Canvas: 16:9; page background `#09110F`.
- Top KPI cards: Total Tasks, Completion Rate, Overdue Tasks, At-Risk Projects,
  Available Employees, and Average Workload.
- Left chart: clustered column chart with department name on the axis and task
  count/completed tasks as values, sourced from `bi_department_performance`.
- Right chart: donut chart using project health and project count, sourced from
  `bi_project_performance`.
- Bottom table: project name, manager name, team size, progress percentage,
  overdue tasks, and health.
- Slicers: department name, manager name, priority, and project status.

## Page 2 — Workforce Capacity

- KPI cards: employee count, Available Employees, Average Workload, and On-Time Rate.
- Bar chart: full name by derived workload percentage.
- Scatter chart: active tasks on X, completion rate percentage on Y, project count
  as size, department name as legend, and employee name in tooltips.
- Detail table: full name, designation, department, active tasks, overdue tasks,
  completion rate, workload percentage, availability, and experience years.
- Apply conditional formatting: workload >= 80 red, >= 60 amber, otherwise green.

## Page 3 — AI Allocation Outcomes

- KPI cards: AI Allocations and Allocation Success Rate.
- Bar chart: employee name by average allocation score.
- Matrix: project name, employee name, predicted role, allocation score, assigned
  tasks, completed tasks, and completed on time.
- Tooltip field: explanation.

Import `ResourceCommandGrid.json` through View > Themes > Browse for themes.
Create the measures from `WorkforceMeasures.dax` using Modeling > New measure.
