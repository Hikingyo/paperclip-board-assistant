# Design — Refactoring DDD complet du MCP Paperclip

**Date :** 2026-05-03  
**Statut :** approuvé  
**Branche cible :** develop

---

## Contexte

Le serveur MCP Paperclip a été construit en plusieurs phases. La phase 3 a introduit une architecture DDD (domains, application, infrastructure) mais ne l'a pas appliquée jusqu'au bout. Il en résulte plusieurs défauts structurels bloquant la suite du roadmap.

### Problèmes identifiés

1. **Double client HTTP** — `PaperclipClient` (legacy, `services/`) et `PaperclipApiClient` (nouveau, `shared/api/`) coexistent. La majorité des tools utilisent encore le legacy.
2. **Couche domaine jamais traversée** — `CompanyService` et `AgentService` sont instanciés dans `ServiceContainer` mais aucun appel ne les emprunte. `CompanyApplicationService` injecte directement `CompanyRepository`.
3. **`initializeServices` orphelin** — fonction dans `shared/initialization.ts`, jamais appelée.
4. **`resolveCompany` typé `any`** — casse le typage strict sur ~30 tools.
5. **`statusToErrorCode` dupliquée** — définie dans `errors.ts` et en méthode privée de `PaperclipApiClient`.
6. **Logique métier dans le client HTTP** — `listRoutines`, `listPendingApprovals`, `getRoutineSchedule` contiennent des simulations (filtrage par titre, données hardcodées) au lieu d'appels API réels.
7. **Domaines manquants** — Project, Issue, Routine, Approval n'ont pas de domaine propre. Leurs tools appellent directement `PaperclipClient`.
8. **`PaginatedResult<T>` incohérent** — snake_case dans `types.ts`, camelCase dans les DTOs applicatifs, conversions manuelles dans les tools.

---

## Architecture cible

### Règle DDD stricte (sans exception)

```
Tool handler
  → ApplicationService   (use case, DTO en sortie)
    → DomainService       (règles métier, Entity en entrée/sortie)
      → Repository (interface, dans domains/)
        → Repository (impl, dans infrastructure/repositories/)
          → PaperclipApiClient  (unique client HTTP, shared/api/)
```

### Suppression du legacy

- `services/paperclip-client.ts` → supprimé
- `shared/initialization.ts` → supprimé
- `server.ts` : n'instancie plus que `PaperclipApiClient` + `ServiceContainer`
- `registerPaperclipTools(server, container)` — signature réduite, plus de paramètre `client`
- `statusToErrorCode` privée dans `PaperclipApiClient` → supprimée, import de `shared/api/errors.ts`

### ServiceContainer

Expose uniquement les ApplicationServices aux tools. Les DomainServices sont internes.

```typescript
// Seules méthodes publiques
getCompanyApplicationService(): CompanyApplicationService
getAgentApplicationService(): AgentApplicationService
getProjectApplicationService(): ProjectApplicationService
getIssueApplicationService(): IssueApplicationService
getRoutineApplicationService(): RoutineApplicationService
getApprovalApplicationService(): ApprovalApplicationService
```

---

## Domaines

### Domaines existants à corriger

**Company**
- `CompanyApplicationService` injecte `CompanyService` (pas `CompanyRepository`)
- Chaîne : `ApplicationService → CompanyService → CompanyRepository → PaperclipApiClient`

**Agent**
- Même correction : `AgentApplicationService → AgentService → AgentRepository → PaperclipApiClient`

### Nouveaux domaines

Chaque domaine suit le patron : `entity.ts`, `repository.ts` (interface), `service.ts`, `types.ts`, `mapper.ts`.  
Chaque repository d'infrastructure implémente l'interface du domaine via `PaperclipApiClient`.

#### Project — `domains/project/`

Endpoint : `GET /api/companies/:id/projects`

Entity principale : `Project` avec les champs issus de la réponse API (`id`, `companyId`, `name`, `status`, `leadAgentId`, `targetDate`, `goals`, `workspaces`, `primaryWorkspace`).

ApplicationService : `getProject(query)`, `listProjects(query)`, `getProjectStatus(query)`, `getProjectRisks(query)`, `listProjectAgents(query)`, `listProjectTasks(query)`.

#### Issue — `domains/issue/`

Endpoint : `GET /api/companies/:id/issues[?projectId=&status=&assigneeAgentId=]`

Entity principale : `Issue` avec `blockerAttention` comme value object.

ApplicationService : `getIssue`, `listIssues`, `listBlockedIssues`, `listOverdueIssues`, `listUnassignedIssues`, `getTaskDependencies`.

#### Routine — `domains/routine/`

Endpoint : `GET /api/companies/:id/routines` (liste uniquement — pas de route single ni `/runs`)

Entités : `Routine` (avec `triggers[]` et `lastRun` embarqué), `RoutineTrigger`, `RoutineRun`.

Champs clés : `id`, `companyId`, `projectId`, `title`, `status` (`active`/`paused`/...), `concurrencyPolicy`, `catchUpPolicy`, `lastTriggeredAt`, `lastEnqueuedAt`, `triggers[].cronExpression`, `triggers[].nextRunAt`, `lastRun.status`, `lastRun.failureReason`.

ApplicationService : `listRoutines(query)` — unique opération disponible côté API.

Tools supprimés (endpoints inexistants) : `paperclip_get_routine`, `paperclip_get_routine_run`, `paperclip_list_routine_runs`, `paperclip_get_routine_schedule`.

Tool conservé et enrichi : `paperclip_list_routines` expose `triggers` et `lastRun` depuis la vraie réponse.

#### Approval — `domains/approval/`

Endpoint : `GET /api/companies/:id/approvals`

Entité : `Approval` avec `type` (`hire_agent`, ...), `status` (`pending`/`approved`/`rejected`), `payload`, `requestedByAgentId`, `decidedByUserId`, `decidedAt`.

ApplicationService : `listApprovals(query)`, `listPendingApprovals(query)`, `getApproval(query)`, `listHighRiskApprovals(query)`.

---

## Surface MCP après refacto

### Tools supprimés

| Tool | Raison |
|---|---|
| `paperclip_get_routine` | Endpoint `/api/companies/:id/routines/:id` inexistant |
| `paperclip_get_routine_run` | Endpoint inexistant |
| `paperclip_list_routine_runs` | Endpoint inexistant |
| `paperclip_get_routine_schedule` | Retournait une valeur hardcodée |

### Tools réimplémentés

| Tool | Avant | Après |
|---|---|---|
| `paperclip_list_routines` | Simulation par parsing de titres | Vrai endpoint `/routines` avec `lastRun` et `triggers` |
| `paperclip_list_pending_approvals` | Filtrage par mot "APPROVAL" dans les titres | Vrai endpoint `/approvals?status=pending` |
| `paperclip_get_approval_request` | `getCompanyIssue` | `findById` dans `ApprovalRepository` |
| `paperclip_list_high_risk_actions` | Filtrage par mots-clés dans les titres | `/approvals` filtré par `status=pending` + `priority` |

### Surface conservée

Tous les autres tools existants sont conservés avec le même comportement externe, migrés vers le `ServiceContainer`.

---

## Typage

- `resolveCompany` retourne `CompanyResponseDto` (plus `any`)
- `PaginatedResult<T>` unifié : un seul type camelCase (`hasMore`, `nextOffset`) utilisé dans les DTOs et les tools. La sortie `structuredContent` des tools conserve snake_case (`has_more`, `next_offset`) pour rester compatible avec les consommateurs MCP existants — la conversion est faite une seule fois dans `createTextResult`.
- Tous les `as any` dans `paperclip-tools.ts` sont éliminés

---

## Tests

- `paperclip-client.test.ts` est supprimé (le client legacy disparaît) ; ses cas de test HTTP sont repris dans les tests des nouveaux repositories d'infrastructure.
- `config.test.ts` et `paperclip-renderers.test.ts` sont conservés sans modification.
- Chaque nouveau repository d'infrastructure reçoit un test unitaire avec mock de `PaperclipApiClient`.
- Les ApplicationServices sont testés via leurs repositories mockés.

---

## Séquence de PRs (approche A — par domaine)

| PR | Contenu | Dépendances |
|---|---|---|
| **PR 1** | Fondations : suppression legacy, signature `registerPaperclipTools`, `resolveCompany` typé, déduplication `statusToErrorCode` | — |
| **PR 2** | Domaine Company corrigé (AppService → DomainService → Repo) | PR 1 |
| **PR 3** | Domaine Agent corrigé + migration tools agents | PR 2 |
| **PR 4** | Domaines Project + Issue + migration tools | PR 3 |
| **PR 5** | Domaine Routine — vrai endpoint, tools simplifiés | PR 4 |
| **PR 6** | Domaine Approval — vrai endpoint, tools réimplémentés | PR 5 |
| **PR 7** | Documentation : `architecture.md`, `board-assistant-roadmap.md`, mémoires Serena | PR 6 |

---

## Documentation à mettre à jour (PR 7)

**`docs/architecture.md`**
- Supprimer toute mention de `PaperclipClient` et du double client
- Décrire la chaîne DDD complète
- Lister les 6 domaines et leurs endpoints réels
- Mettre à jour le diagramme de couches

**`docs/board-assistant-roadmap.md`**
- Marquer les tools de simulation (routines, approvals) comme remplacés par les vraies implémentations
- Mettre à jour la surface MCP avec les 4 tools supprimés

**`CLAUDE.md`**
- Corriger la note sur les deux clients HTTP (plus de legacy)
- Mettre à jour la liste des tools supprimés

**Mémoires Serena**
- `style_and_conventions` : supprimer la référence à `services/paperclip-client.ts` comme lieu canonique des appels HTTP
- `project_overview` : surface MCP mise à jour
