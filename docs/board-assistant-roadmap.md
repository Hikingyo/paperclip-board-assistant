# Board Assistant Roadmap

This project is evolving from a small read-only Paperclip MCP server into a **board assistant** and **company design companion** for Paperclip companies. The target outcome is a plugin workspace composed of an MCP server plus a broader Copilot experience that can help operators:

- understand execution health
- supervise agents, projects, tasks, approvals, and routines
- onboard a company with a healthy operating model
- restructure a weak or overloaded team
- prepare decisions with clear guardrails

## Product direction

The MCP should support three layers of value:

1. **Visibility**: understand the state of the company, projects, agents, tasks, and approvals.
2. **Operational control**: perform safe operational actions such as assigning work, changing priorities, commenting, and approving or rejecting actions.
3. **Board workflows**: prepare daily briefs, risk summaries, reprioritization suggestions, and board decision packets.

On top of that, the broader product should support:

4. **Wizard-driven operating design**: set up or restructure companies, teams, routines, and governance.
5. **Copilot-side skills and assistants**: orchestrate workflows around the MCP rather than replacing the MCP itself.

## Design principles

- Start with **read-only** coverage, then add write tools.
- Implement **explicit resource tools** and **higher-level workflow tools**.
- Require clear confirmation or guardrails for sensitive or destructive actions.
- Preserve the existing MCP conventions in this repo:
  - service-prefixed snake_case tool names
  - `response_format` support
  - markdown + JSON + `structuredContent`
  - MCP-layer pagination (`limit`, `offset`, `has_more`, `next_offset`)
- Keep Paperclip API access in `PaperclipClient`; keep MCP presentation and orchestration in tool modules.
- Distinguish between:
  - **Paperclip-side agents** that belong inside the company being operated
  - **Copilot-side assistants** that help a human design, supervise, and improve that company

## Current baseline

The server already exposes these read-only tools:

- `paperclip_get_health`
- `paperclip_get_session`
- `paperclip_get_profile`
- `paperclip_company_execution_summary`
- `paperclip_get_company`
- `paperclip_get_company_activity_feed`
- `paperclip_get_company_board_summary`
- `paperclip_get_company_metrics`
- `paperclip_get_company_policies`
- `paperclip_list_companies`
- `paperclip_list_adapters`
- `paperclip_list_plugins`

These form the instance-level inspection layer, the first company-level board visibility views for summary, metrics, and governance, and the first derived workflow synthesis view across visible companies.

## Internal Paperclip agents vs Copilot-side assistants

The roadmap assumes a clear separation:

### Inside Paperclip companies

These are durable members of the operating team:

- leads
- reviewers
- PM / ops / routine owners
- execution-focused company agents

### Outside, in the Copilot experience

These are operator-focused assistants:

- board assistant
- setup wizard
- restructuring wizard
- execution auditor
- operating model designer

The MCP is the bridge between these worlds: it operates Paperclip, while Copilot-side skills and assistants orchestrate workflows around that operating surface.

## Phase 1 - Board visibility

Goal: allow an assistant to understand what is happening in a company without making changes.

### Company and governance

- `paperclip_get_company`
- `paperclip_get_company_board_summary`
- `paperclip_get_company_metrics`
- `paperclip_get_company_policies`
- `paperclip_get_company_activity_feed`

### Agents

- `paperclip_list_agents`
- `paperclip_get_agent`
- `paperclip_get_agent_status`
- `paperclip_get_agent_workload`
- `paperclip_get_agent_recent_activity`
- `paperclip_get_agent_capabilities`

### Projects

- `paperclip_list_projects`
- `paperclip_get_project`
- `paperclip_get_project_status`
- `paperclip_get_project_risks`
- `paperclip_list_project_agents`
- `paperclip_list_project_tasks`

### Tasks

- `paperclip_list_tasks`
- `paperclip_get_task`
- `paperclip_list_blocked_tasks`
- `paperclip_list_overdue_tasks`
- `paperclip_list_unassigned_tasks`
- `paperclip_get_task_dependencies`

### Approvals

- `paperclip_list_pending_approvals`
- `paperclip_get_approval_request`
- `paperclip_list_high_risk_actions`

### Routines

- `paperclip_list_routines`
- `paperclip_get_routine`
- `paperclip_list_routine_runs`
- `paperclip_get_routine_run`
- `paperclip_list_failed_routine_runs`
- `paperclip_get_routine_schedule`

### Expected outcome

After Phase 1, the MCP should answer questions like:

- What is the company working on right now?
- Which tasks are blocked or overdue?
- Which agents are overloaded or idle?
- Which decisions are waiting for a board or human approval?
- Which routines are failing or drifting?

## Phase 2 - Operational control

Goal: enable safe day-to-day control actions for board and ops workflows.

### Agents

- `paperclip_pause_agent`
- `paperclip_resume_agent`
- `paperclip_request_agent_status_report`
- `paperclip_update_agent_instructions`

### Projects

- `paperclip_create_project`
- `paperclip_update_project`
- `paperclip_archive_project`

### Tasks

- `paperclip_create_task`
- `paperclip_update_task`
- `paperclip_assign_task`
- `paperclip_unassign_task`
- `paperclip_change_task_priority`
- `paperclip_mark_task_blocked`
- `paperclip_mark_task_unblocked`
- `paperclip_close_task`
- `paperclip_reopen_task`
- `paperclip_add_task_comment`

### Approvals

- `paperclip_approve_action`
- `paperclip_reject_action`
- `paperclip_request_human_review`

### Routines

- `paperclip_trigger_routine`
- `paperclip_pause_routine`
- `paperclip_resume_routine`
- `paperclip_cancel_routine_run`

### Guardrails

- Add clear MCP annotations for write tools.
- Prefer explicit confirmation fields for sensitive operations.
- Include actionable error messages that explain impact and remediation.
- Keep low-risk operational actions ahead of policy-changing or admin actions.

## Phase 3 - Workflow intelligence

Goal: turn the MCP into a real board assistant instead of a thin CRUD layer.

### Briefing and synthesis

- `paperclip_board_daily_brief`
- `paperclip_board_weekly_review`
- `paperclip_company_execution_summary`
- `paperclip_project_portfolio_summary`

### Diagnostics

- `paperclip_identify_execution_risks`
- `paperclip_find_stalled_projects`
- `paperclip_find_blocking_dependencies`
- `paperclip_find_underutilized_agents`
- `paperclip_find_overloaded_agents`

### Recommendations

- `paperclip_suggest_task_assignments`
- `paperclip_recommend_reprioritization`
- `paperclip_recommend_escalations`
- `paperclip_prepare_board_decisions`

### Coordination

- `paperclip_generate_followup_actions`
- `paperclip_prepare_status_report`
- `paperclip_prepare_exec_review_packet`

### Routines intelligence

- `paperclip_routine_health_summary`
- `paperclip_find_stalled_routines`
- `paperclip_find_flaky_routines`
- `paperclip_prepare_routine_review`
- `paperclip_recommend_routine_changes`

### Expected outcome

After Phase 3, the assistant should be able to:

- produce a board-ready summary
- flag execution risks
- recommend priority changes
- prepare concrete decision points for humans
- explain which routines should be fixed, paused, or redesigned

## Phase 4 - Governance and administration

Goal: expand into admin and policy surfaces after the operational layer is stable.

### Access and invites

- `paperclip_list_invites`
- `paperclip_create_invite`
- `paperclip_revoke_invite`
- `paperclip_get_settings_access`
- `paperclip_update_access_policy`

### Plugins and configuration

- `paperclip_get_plugin`
- `paperclip_get_plugin_status`
- `paperclip_get_plugin_config`
- `paperclip_enable_plugin`
- `paperclip_disable_plugin`
- `paperclip_update_plugin_config`

### Global settings

- `paperclip_get_settings_general`
- `paperclip_update_settings_general`
- `paperclip_get_settings_heartbeats`

## Phase 5 - Company and project wizard flows

Goal: turn the product into a company design and restructuring companion, not just a runtime operator.

### Setup wizard capabilities

- `paperclip_company_setup_wizard`
- `paperclip_project_setup_wizard`
- `paperclip_team_design_wizard`
- `paperclip_routine_design_wizard`

Expected outputs:

- company blueprint
- team structure
- initial project layout
- routine design
- approval and governance model

### Restructuring wizard capabilities

- `paperclip_company_restructuring_wizard`
- `paperclip_project_restructuring_wizard`
- `paperclip_agent_team_rebalance`
- `paperclip_routine_restructuring_wizard`

Expected outputs:

- restructuring plan
- role redistribution
- revised routines
- proposed changes for human approval

## Copilot-side skills and assistant layer

The broader product can also ship a higher-level Copilot experience on top of this MCP:

### Skills

- board daily brief
- board weekly review
- execution risk review
- routine failure review
- company setup wizard
- project setup wizard
- company restructuring wizard

### Assistants

- board assistant
- COO assistant
- routine review assistant
- setup wizard
- restructuring wizard

## Prioritized implementation backlog

The next tools to implement should be:

1. `paperclip_get_company_board_summary`
2. `paperclip_list_agents`
3. `paperclip_get_agent`
4. `paperclip_get_agent_workload`
5. `paperclip_list_projects`
6. `paperclip_get_project`
7. `paperclip_get_project_status`
8. `paperclip_list_tasks`
9. `paperclip_get_task`
10. `paperclip_list_blocked_tasks`
11. `paperclip_list_overdue_tasks`
12. `paperclip_list_pending_approvals`
13. `paperclip_list_routines`
14. `paperclip_list_failed_routine_runs`
15. `paperclip_assign_task`
16. `paperclip_change_task_priority`
17. `paperclip_add_task_comment`
18. `paperclip_mark_task_blocked`
19. `paperclip_mark_task_unblocked`
20. `paperclip_pause_agent`
21. `paperclip_resume_agent`
22. `paperclip_request_agent_status_report`
23. `paperclip_approve_action`
24. `paperclip_reject_action`
25. `paperclip_board_daily_brief`
26. `paperclip_board_weekly_review`
27. `paperclip_identify_execution_risks`
28. `paperclip_find_stalled_projects`
29. `paperclip_find_overloaded_agents`
30. `paperclip_prepare_board_decisions`

## Suggested implementation lots

### Lot A - visibility

- company board summary
- agents list/detail
- projects list/detail
- tasks list/detail
- pending approvals
- routines list/detail

### Lot B - low-risk control

- task assignment
- priority changes
- comments
- block/unblock
- pause/resume agent
- routine trigger/pause/resume

### Lot C - workflow tools

- daily brief
- execution risk detection
- stalled projects
- overloaded agents
- reprioritization recommendations
- routine review and health analysis

### Lot D - administration

- invites
- access settings
- plugins
- global settings

### Lot E - wizard foundations

- company setup flow
- project setup flow
- restructuring flow
- team design and routine design outputs

## Documentation expectations for future phases

When implementing new tool families:

- update `README.md` with the new tool surface
- update `.github/copilot-instructions.md` if the architecture or conventions evolve
- keep this roadmap current so future sessions know what has already landed and what is still planned
