# Resource Command Grid

The interface uses an operational visual language built specifically for resource allocation. Its core sequence is **People → Capacity → Projects → Work → Outcomes**.

## Design system

- Foundation: near-black green-neutral field (`#0b100f`) with a subtle 32px coordinate grid.
- Structure: square modules, one-pixel boundaries, small monospace telemetry labels, and humanist Georgia display type.
- Primary signal: capacity lime (`#b7e36d`). Supporting states use cyan for balanced information, amber for busy/at-risk work, and coral for overload/deadline risk.
- Shape language: circular people nodes, horizontal capacity rails, directed allocation connectors, and spatial work objects. Large rounded SaaS cards, purple gradients, heavy shadows, and decorative glass effects are intentionally absent.
- Motion: entry motion establishes hierarchy; overload pulses gently; AI matches enter progressively; route transitions remain subtle. Motion is reserved for state and relationship changes.

## Navigation

The old long sidebars were replaced with a compact command rail grouped into COMMAND, INTELLIGENCE, and SYSTEM. On mobile it becomes a bottom command dock rather than a shrunken desktop sidebar.

## Redesigned experiences

- Admin Overview: live department zones, employee capacity nodes, aggregate department rails, inspector, allocation paths, and intervention queue.
- People: searchable/filterable people grid with capacity states and operational Resource Card focus view.
- Manager Overview: Team Control Space centered on “Who should do what next?”, a decision queue, and project pulse.
- Employee Overview: My Workspace centered on today’s next commitment, personal capacity, deadline sequence, and project context.
- AI Match: real model-backed task definition, progressive ranked matches, factual input reasons, and explicit manager-confirmed assignment.
- Work: the manager board uses only backend-supported Pending, In Progress, and Completed states. Drag-and-drop performs real status API updates.
- Projects, Activity, forms, modals, and Analytics retain their business logic while inheriting the new material, typography, density, and responsive system.

No package was added. Existing Framer Motion, Bootstrap Icons, routing, JWT/RBAC, CRUD APIs, Power BI embedding, and manual assignment fallback remain in place.

## Safety constraints

No frontend control expands backend permissions. Employee self-edit remains unavailable because no safe API exists. Manager Analytics was not exposed because the existing route is Admin-only. AI explanations show factual model inputs returned by the service; no explanation values or recommendation scores are fabricated.
