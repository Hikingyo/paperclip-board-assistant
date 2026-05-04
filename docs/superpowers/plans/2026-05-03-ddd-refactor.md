# DDD Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Éliminer le double client HTTP, appliquer la règle DDD stricte sur toutes les couches, et câbler les vrais endpoints Routine et Approval.

**Architecture:** Tool → ApplicationService → DomainService → Repository (interface) → Repository (impl) → PaperclipApiClient. Un seul client HTTP (`PaperclipApiClient`). `PaperclipClient` legacy supprimé en fin de séquence.

**Tech Stack:** TypeScript strict, ESM NodeNext, `@modelcontextprotocol/sdk`, Zod, Vitest, Biome.

---

## Fichiers créés / modifiés

### PR 1 — Fondations
- Modify: `packages/mcp/src/shared/api/client.ts` — `baseUrl` readonly, supprimer `statusToErrorCode` privée
- Modify: `packages/mcp/src/shared/container.ts` — ajouter `legacyClient` interne + `getLegacyClient()`
- Modify: `packages/mcp/src/server.ts` — supprimer `PaperclipClient` du bootstrap
- Modify: `packages/mcp/src/tools/paperclip-tools.ts` — signature `(server, container)`, typer `resolveCompany`
- Delete: `packages/mcp/src/shared/initialization.ts`
- Delete: `packages/mcp/test/paperclip-client.test.ts`
- Create: `packages/mcp/test/api-client.test.ts`

### PR 2 — Company DDD
- Modify: `packages/mcp/src/domains/company/mapper.ts` — class → functions
- Modify: `packages/mcp/src/application/services/company.application.ts` — injecter `CompanyService`
- Modify: `packages/mcp/src/shared/container.ts` — passer `CompanyService` à `CompanyApplicationService`

### PR 3 — Agent DDD
- Modify: `packages/mcp/src/domains/agent/mapper.ts` — class → functions
- Modify: `packages/mcp/src/application/services/agent.application.ts` — injecter `AgentService`
- Modify: `packages/mcp/src/shared/container.ts`
- Modify: `packages/mcp/src/tools/paperclip-tools.ts` — outils agents → `container.getAgentApplicationService()`

### PR 4 — Domaines Project + Issue
- Create: `packages/mcp/src/domains/project/types.ts`
- Create: `packages/mcp/src/domains/project/entity.ts`
- Create: `packages/mcp/src/domains/project/repository.ts`
- Create: `packages/mcp/src/domains/project/service.ts`
- Create: `packages/mcp/src/domains/project/mapper.ts`
- Create: `packages/mcp/src/application/dtos/project.dto.ts`
- Create: `packages/mcp/src/application/services/project.application.ts`
- Create: `packages/mcp/src/infrastructure/repositories/project-repository.ts`
- Create: `packages/mcp/src/domains/issue/types.ts`
- Create: `packages/mcp/src/domains/issue/entity.ts`
- Create: `packages/mcp/src/domains/issue/repository.ts`
- Create: `packages/mcp/src/domains/issue/service.ts`
- Create: `packages/mcp/src/domains/issue/mapper.ts`
- Create: `packages/mcp/src/application/dtos/issue.dto.ts`
- Create: `packages/mcp/src/application/services/issue.application.ts`
- Create: `packages/mcp/src/infrastructure/repositories/issue-repository.ts`
- Modify: `packages/mcp/src/shared/api/paths.ts` — ajouter `routines`, `approvals`
- Modify: `packages/mcp/src/shared/container.ts`
- Modify: `packages/mcp/src/tools/paperclip-tools.ts`
- Create: `packages/mcp/test/project-repository.test.ts`
- Create: `packages/mcp/test/issue-repository.test.ts`

### PR 5 — Domaine Routine
- Create: `packages/mcp/src/domains/routine/types.ts`
- Create: `packages/mcp/src/domains/routine/entity.ts`
- Create: `packages/mcp/src/domains/routine/repository.ts`
- Create: `packages/mcp/src/domains/routine/service.ts`
- Create: `packages/mcp/src/domains/routine/mapper.ts`
- Create: `packages/mcp/src/application/dtos/routine.dto.ts`
- Create: `packages/mcp/src/application/services/routine.application.ts`
- Create: `packages/mcp/src/infrastructure/repositories/routine-repository.ts`
- Modify: `packages/mcp/src/shared/container.ts`
- Modify: `packages/mcp/src/tools/paperclip-tools.ts` — supprimer 4 tools fake, réécrire `list_routines`
- Modify: `packages/mcp/src/tools/paperclip-renderers.ts` — `renderRoutines` avec triggers + lastRun
- Create: `packages/mcp/test/routine-repository.test.ts`

### PR 6 — Domaine Approval + suppression legacy
- Create: `packages/mcp/src/domains/approval/types.ts`
- Create: `packages/mcp/src/domains/approval/entity.ts`
- Create: `packages/mcp/src/domains/approval/repository.ts`
- Create: `packages/mcp/src/domains/approval/service.ts`
- Create: `packages/mcp/src/domains/approval/mapper.ts`
- Create: `packages/mcp/src/application/dtos/approval.dto.ts`
- Create: `packages/mcp/src/application/services/approval.application.ts`
- Create: `packages/mcp/src/infrastructure/repositories/approval-repository.ts`
- Modify: `packages/mcp/src/shared/container.ts` — supprimer `getLegacyClient()`
- Modify: `packages/mcp/src/tools/paperclip-tools.ts` — réécrire tools approval
- Delete: `packages/mcp/src/services/paperclip-client.ts`
- Create: `packages/mcp/test/approval-repository.test.ts`

### PR 7 — Documentation
- Modify: `docs/architecture.md`
- Modify: `docs/board-assistant-roadmap.md`
- Modify: `CLAUDE.md`
- Modify: `.serena/memories/style_and_conventions.md`
- Modify: `.serena/memories/project_overview.md`

---

## Task 1 — Fondations : unique client HTTP, typage strict

### Fichiers
- Modify: `packages/mcp/src/shared/api/client.ts`
- Modify: `packages/mcp/src/shared/container.ts`
- Modify: `packages/mcp/src/server.ts`
- Modify: `packages/mcp/src/tools/paperclip-tools.ts`
- Delete: `packages/mcp/src/shared/initialization.ts`
- Delete: `packages/mcp/test/paperclip-client.test.ts`
- Create: `packages/mcp/test/api-client.test.ts`

- [ ] **Étape 1 : Rendre `baseUrl` accessible dans `PaperclipApiClient`**

Dans `packages/mcp/src/shared/api/client.ts`, ligne 20, changer `private baseUrl` en `readonly baseUrl` :

```typescript
export class PaperclipApiClient {
  constructor(readonly baseUrl: string) {
    logger.debug("Initializing PaperclipApiClient", { baseUrl });
  }
```

Supprimer la méthode privée `statusToErrorCode` (lignes 160-175) et remplacer ses appels par l'import de `errors.ts`. En haut du fichier, ajouter `statusToErrorCode` à l'import existant :

```typescript
import { API_ERROR_CODES, type ApiErrorCode, failure, type Result, success, statusToErrorCode } from "./errors.js";
```

Remplacer les deux appels `this.statusToErrorCode(response.status)` par `statusToErrorCode(response.status)`.

- [ ] **Étape 2 : Écrire le test de remplacement pour `PaperclipApiClient`**

Créer `packages/mcp/test/api-client.test.ts` :

```typescript
import { afterEach, describe, expect, it, vi } from "vitest";
import { PaperclipApiClient } from "../src/shared/api/client.js";

describe("PaperclipApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retourne un Result ok pour une réponse JSON 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    const client = new PaperclipApiClient("http://127.0.0.1:3100");
    const result = await client.get<{ status: string }>("/api/health");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toMatchObject({ status: "ok" });
  });

  it("retourne un Result failure pour une réponse 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "boom" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    const client = new PaperclipApiClient("http://127.0.0.1:3100");
    const result = await client.get("/api/health");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("SERVER_ERROR");
  });

  it("retourne un Result failure pour une réponse non-JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>not found</html>", {
          status: 404,
          headers: { "content-type": "text/html" },
        }),
      ),
    );
    const client = new PaperclipApiClient("http://127.0.0.1:3100");
    const result = await client.get("/api/missing");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
  });

  it("expose baseUrl en lecture", () => {
    const client = new PaperclipApiClient("http://example.com");
    expect(client.baseUrl).toBe("http://example.com");
  });
});
```

- [ ] **Étape 3 : Vérifier que le test échoue (pas encore de `readonly baseUrl`)**

```bash
cd /home/llarousserie/perso/paperclip-mcp
npx vitest run packages/mcp/test/api-client.test.ts
```

Résultat attendu : erreur de compilation ou échec sur `baseUrl`.

- [ ] **Étape 4 : Intégrer `PaperclipClient` legacy dans `ServiceContainer`**

Dans `packages/mcp/src/shared/container.ts`, ajouter l'import et le champ :

```typescript
import { AgentApplicationService } from "../application/services/agent.application.js";
import { CompanyApplicationService } from "../application/services/company.application.js";
import { AgentService } from "../domains/agent/service.js";
import { CompanyService } from "../domains/company/service.js";
import { PaperclipAgentRepository } from "../infrastructure/repositories/agent-repository.js";
import { PaperclipCompanyRepository } from "../infrastructure/repositories/company-repository.js";
import { PaperclipClient } from "../services/paperclip-client.js";
import type { PaperclipApiClient } from "./api/client.js";

export class ServiceContainer {
  private readonly apiClient: PaperclipApiClient;
  /** @deprecated Transitional — sera supprimé en PR 6 */
  private readonly legacyClient: PaperclipClient;
  private readonly companyRepository: PaperclipCompanyRepository;
  private readonly agentRepository: PaperclipAgentRepository;
  private readonly companyService: CompanyService;
  private readonly agentService: AgentService;
  private readonly companyApplicationService: CompanyApplicationService;
  private readonly agentApplicationService: AgentApplicationService;

  constructor(apiClient: PaperclipApiClient, defaultCompanyId?: string) {
    this.apiClient = apiClient;
    this.legacyClient = new PaperclipClient(apiClient.baseUrl);
    this.companyRepository = new PaperclipCompanyRepository(apiClient);
    this.agentRepository = new PaperclipAgentRepository(apiClient, defaultCompanyId ?? "default");
    this.companyService = new CompanyService(this.companyRepository);
    this.agentService = new AgentService(this.agentRepository);
    this.companyApplicationService = new CompanyApplicationService(this.companyRepository);
    this.agentApplicationService = new AgentApplicationService(this.agentRepository);
  }

  getCompanyApplicationService(): CompanyApplicationService {
    return this.companyApplicationService;
  }

  getAgentApplicationService(): AgentApplicationService {
    return this.agentApplicationService;
  }

  getCompanyService(): CompanyService {
    return this.companyService;
  }

  getAgentService(): AgentService {
    return this.agentService;
  }

  getApiClient(): PaperclipApiClient {
    return this.apiClient;
  }

  /** @deprecated Transitional — sera supprimé en PR 6 */
  getLegacyClient(): PaperclipClient {
    return this.legacyClient;
  }
}
```

- [ ] **Étape 5 : Mettre à jour `server.ts`**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RuntimeConfig } from "./config.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { PaperclipApiClient } from "./shared/api/client.js";
import { ServiceContainer } from "./shared/container.js";
import { registerPaperclipTools } from "./tools/paperclip-tools.js";

export function createPaperclipServer(config: RuntimeConfig): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  const apiClient = new PaperclipApiClient(config.paperclipBaseUrl);
  const container = new ServiceContainer(apiClient);
  registerPaperclipTools(server, container);
  return server;
}
```

- [ ] **Étape 6 : Mettre à jour `registerPaperclipTools` et typer `resolveCompany`**

Dans `packages/mcp/src/tools/paperclip-tools.ts`, remplacer les imports et la signature :

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  agentReadOnlyGetSchema,
  companyReadOnlyGetSchema,
  companyReadOnlyListSchema,
  issueReadOnlyGetSchema,
  projectReadOnlyGetSchema,
  readOnlyGetSchema,
  readOnlyListSchema,
} from "../schemas.js";
import type { CompanyResponseDto } from "../application/dtos/company.dto.js";
import type { ServiceContainer } from "../shared/container.js";
import type { PaginatedResult, PaperclipAgent, PaperclipIssue } from "../types.js";
// ... autres imports renderers et helpers
```

Changer `resolveCompany` :

```typescript
async function resolveCompany(
  container: ServiceContainer,
  companyId?: string,
): Promise<CompanyResponseDto> {
  if (companyId) {
    const result = await container.getCompanyApplicationService().getCompany({ id: companyId });
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  }
  const listResult = await container
    .getCompanyApplicationService()
    .listCompanies({ limit: 100, offset: 0 });
  if (!listResult.ok) throw new Error(listResult.error.message);
  return resolveRequestedItem(listResult.value.items, {
    itemId: undefined,
    resourceName: "company",
    resourceNamePlural: "companies",
    idFieldName: "id",
  });
}
```

Changer la signature de la fonction exportée :

```typescript
export function registerPaperclipTools(server: McpServer, container: ServiceContainer): void {
```

Pour chaque outil qui appelait `client.xxx()`, remplacer par `container.getLegacyClient().xxx()`. Par exemple :

```typescript
// Avant
const health = await client.getHealth();
// Après
const health = await container.getLegacyClient().getHealth();
```

Appliquer ce remplacement à tous les tools (health, session, profile, adapters, plugins, agents, projects, issues, routines, approvals).

- [ ] **Étape 7 : Supprimer `shared/initialization.ts`**

```bash
rm packages/mcp/src/shared/initialization.ts
```

- [ ] **Étape 8 : Supprimer `test/paperclip-client.test.ts`**

```bash
rm packages/mcp/test/paperclip-client.test.ts
```

- [ ] **Étape 9 : Lancer les tests**

```bash
npm run test
```

Résultat attendu : tous les tests passent, y compris les nouveaux dans `api-client.test.ts`.

- [ ] **Étape 10 : Vérifier la compilation**

```bash
npm run typecheck
```

- [ ] **Étape 11 : Commit**

```bash
git add -p
git commit -m "refactor: unify HTTP client in ServiceContainer, type resolveCompany

- PaperclipApiClient.baseUrl est readonly
- ServiceContainer crée PaperclipClient en interne (transitional getLegacyClient)
- registerPaperclipTools(server, container) — plus de paramètre client
- resolveCompany retourne CompanyResponseDto (plus any)
- statusToErrorCode dédupliqué (shared/api/errors.ts uniquement)
- shared/initialization.ts supprimé (orphelin)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2 — Company DDD : AppService → DomainService → Repository

### Fichiers
- Modify: `packages/mcp/src/domains/company/mapper.ts`
- Modify: `packages/mcp/src/application/services/company.application.ts`
- Modify: `packages/mcp/src/shared/container.ts`

- [ ] **Étape 1 : Convertir `CompanyMapper` de classe statique en fonctions**

Biome interdit les classes à membres uniquement statiques. Remplacer `packages/mcp/src/domains/company/mapper.ts` :

```typescript
import type { PaperclipCompany } from "../../types.js";
import { Company } from "./entity.js";
import type { CompanySnapshot } from "./types.js";

export function companyToDomain(api: PaperclipCompany): Company {
  const snapshot: CompanySnapshot = {
    id: api.id,
    name: api.name,
    description: api.description,
    status: api.status,
    issuePrefix: api.issuePrefix,
    issueCounter: api.issueCounter,
    budgetMonthlyCents: api.budgetMonthlyCents,
    spentMonthlyCents: api.spentMonthlyCents,
    brandColor: api.brandColor,
    logoUrl: api.logoUrl,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
  return Company.fromSnapshot(snapshot);
}

export function companyToDomainList(apis: PaperclipCompany[]): Company[] {
  return apis.map(companyToDomain);
}
```

- [ ] **Étape 2 : Mettre à jour `company-repository.ts` pour utiliser les fonctions**

Dans `packages/mcp/src/infrastructure/repositories/company-repository.ts`, remplacer les imports et les appels :

```typescript
import { companyToDomain, companyToDomainList } from "../../domains/company/mapper.js";
// ...
// Remplacer CompanyMapper.toDomain(result.value) par companyToDomain(result.value)
// Remplacer CompanyMapper.toDomainList(result.value) par companyToDomainList(result.value)
```

- [ ] **Étape 3 : Mettre à jour `CompanyApplicationService` pour injecter `CompanyService`**

```typescript
import type { CompanyService } from "../../domains/company/service.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type {
  CheckCompanyHealthQuery,
  CompanyHealthResponseDto,
  CompanyResponseDto,
  GetCompanyQuery,
  ListCompaniesQuery,
  PaginatedCompaniesResponseDto,
} from "../dtos/company.dto.js";

export class CompanyApplicationService {
  constructor(private readonly companyService: CompanyService) {}

  async getCompany(query: GetCompanyQuery): Promise<Result<CompanyResponseDto>> {
    logger.debug("Application: Getting company", { id: query.id });
    const result = await this.companyService.getCompany(query.id);
    if (!result.ok) return result as Result<CompanyResponseDto>;
    const company = result.value;
    return {
      ok: true,
      value: {
        id: company.id,
        name: company.name,
        description: company.description,
        status: company.status,
        issuePrefix: company.issuePrefix,
        issueCounter: company.issueCounter,
        budgetMonthlyCents: company.budgetMonthlyCents,
        spentMonthlyCents: company.spentMonthlyCents,
        budgetUtilization: company.getBudgetUtilization(),
        isOverBudget: company.isOverBudget(),
        brandColor: company.brandColor,
        logoUrl: company.logoUrl,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    };
  }

  async listCompanies(query: ListCompaniesQuery): Promise<Result<PaginatedCompaniesResponseDto>> {
    logger.debug("Application: Listing companies", { query });
    const result = await this.companyService.listCompanies();
    if (!result.ok) return result as Result<PaginatedCompaniesResponseDto>;
    const companies = result.value;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const items = companies.slice(offset, offset + limit).map((company) => ({
      id: company.id,
      name: company.name,
      description: company.description,
      status: company.status,
      issuePrefix: company.issuePrefix,
      issueCounter: company.issueCounter,
      budgetMonthlyCents: company.budgetMonthlyCents,
      spentMonthlyCents: company.spentMonthlyCents,
      budgetUtilization: company.getBudgetUtilization(),
      isOverBudget: company.isOverBudget(),
      brandColor: company.brandColor,
      logoUrl: company.logoUrl,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }));
    return {
      ok: true,
      value: {
        total: companies.length,
        count: items.length,
        offset,
        hasMore: offset + limit < companies.length,
        nextOffset: offset + limit < companies.length ? offset + limit : undefined,
        items,
      },
    };
  }

  async checkCompanyHealth(query: CheckCompanyHealthQuery): Promise<Result<CompanyHealthResponseDto>> {
    logger.debug("Application: Checking company health", { id: query.id });
    const result = await this.companyService.checkCompanyHealth(query.id);
    if (!result.ok) return result as Result<CompanyHealthResponseDto>;
    const getResult = await this.companyService.getCompany(query.id);
    if (!getResult.ok) return getResult as Result<CompanyHealthResponseDto>;
    const company = getResult.value;
    return {
      ok: true,
      value: {
        companyId: company.id,
        isOverBudget: company.isOverBudget(),
        budgetUtilization: company.getBudgetUtilization(),
        status: company.status,
      },
    };
  }
}
```

- [ ] **Étape 4 : Corriger `CompanyService` — supprimer le `as any`**

Dans `packages/mcp/src/domains/company/service.ts`, remplacer la validation qui utilise `as any` :

```typescript
import { failure } from "../../shared/api/errors.js";
// ...
async getCompany(id: string): Promise<Result<Company>> {
  if (!id || id.trim().length === 0) {
    return failure("Invalid company ID", "VALIDATION");
  }
  return this.companyRepository.findById(id);
}
```

- [ ] **Étape 5 : Mettre à jour `ServiceContainer` — passer `CompanyService` à `CompanyApplicationService`**

Dans `packages/mcp/src/shared/container.ts`, dans le constructeur :

```typescript
// Application Layer — CompanyApplicationService reçoit CompanyService (DDD correct)
this.companyApplicationService = new CompanyApplicationService(this.companyService);
this.agentApplicationService = new AgentApplicationService(this.agentRepository);
```

- [ ] **Étape 6 : Lancer les tests**

```bash
npm run test
```

- [ ] **Étape 7 : Vérifier lint**

```bash
npm run lint
```

Résultat attendu : le warning `noStaticOnlyClass` sur `company/mapper.ts` disparaît.

- [ ] **Étape 8 : Commit**

```bash
git add -p
git commit -m "refactor(company): AppService → DomainService → Repository, mapper → functions

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3 — Agent DDD : AppService → DomainService, migration tools agents

### Fichiers
- Modify: `packages/mcp/src/domains/agent/mapper.ts`
- Modify: `packages/mcp/src/application/services/agent.application.ts`
- Modify: `packages/mcp/src/shared/container.ts`
- Modify: `packages/mcp/src/tools/paperclip-tools.ts`

- [ ] **Étape 1 : Convertir `AgentMapper` en fonctions**

```typescript
import type { PaperclipAgent } from "../../types.js";
import { Agent } from "./entity.js";
import type { AgentSnapshot } from "./types.js";

export function agentToDomain(api: PaperclipAgent): Agent {
  const snapshot: AgentSnapshot = {
    id: api.id,
    companyId: api.companyId,
    name: api.name,
    role: api.role,
    title: api.title,
    icon: api.icon,
    status: api.status,
    reportsTo: api.reportsTo,
    capabilities: api.capabilities,
    adapterType: api.adapterType,
    budgetMonthlyCents: api.budgetMonthlyCents,
    spentMonthlyCents: api.spentMonthlyCents,
    pauseReason: api.pauseReason,
    pausedAt: api.pausedAt,
    lastHeartbeatAt: api.lastHeartbeatAt,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    urlKey: api.urlKey,
  };
  return Agent.fromSnapshot(snapshot);
}

export function agentToDomainList(apis: PaperclipAgent[]): Agent[] {
  return apis.map(agentToDomain);
}
```

- [ ] **Étape 2 : Mettre à jour `agent-repository.ts`**

Remplacer `AgentMapper.toDomain` → `agentToDomain`, `AgentMapper.toDomainList` → `agentToDomainList` dans `packages/mcp/src/infrastructure/repositories/agent-repository.ts`.

- [ ] **Étape 3 : Mettre à jour `AgentApplicationService` pour injecter `AgentService`**

```typescript
import type { AgentService } from "../../domains/agent/service.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type {
  AgentHealthResponseDto,
  AgentResponseDto,
  CheckAgentHealthQuery,
  GetAgentQuery,
  ListAgentsQuery,
  PaginatedAgentsResponseDto,
} from "../dtos/agent.dto.js";

export class AgentApplicationService {
  constructor(private readonly agentService: AgentService) {}

  async getAgent(query: GetAgentQuery): Promise<Result<AgentResponseDto>> {
    logger.debug("Application: Getting agent", { companyId: query.companyId, agentId: query.agentId });
    const result = await this.agentService.getAgent(query.agentId);
    if (!result.ok) return result as Result<AgentResponseDto>;
    const agent = result.value;
    return {
      ok: true,
      value: {
        id: agent.id,
        companyId: agent.companyId,
        name: agent.name,
        role: agent.role,
        title: agent.title,
        icon: agent.icon,
        status: agent.status,
        isActive: agent.isActive(),
        isHealthy: agent.isHealthy(),
        lastHeartbeatAt: agent.lastHeartbeatAt,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        urlKey: agent.urlKey,
      },
    };
  }

  async listAgents(query: ListAgentsQuery): Promise<Result<PaginatedAgentsResponseDto>> {
    logger.debug("Application: Listing agents", { query });
    const result = await this.agentService.listAgentsByCompany(query.companyId);
    if (!result.ok) return result as Result<PaginatedAgentsResponseDto>;
    const agents = result.value;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const items = agents.slice(offset, offset + limit).map((agent) => ({
      id: agent.id,
      companyId: agent.companyId,
      name: agent.name,
      role: agent.role,
      title: agent.title,
      icon: agent.icon,
      status: agent.status,
      isActive: agent.isActive(),
      isHealthy: agent.isHealthy(),
      lastHeartbeatAt: agent.lastHeartbeatAt,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      urlKey: agent.urlKey,
    }));
    return {
      ok: true,
      value: {
        total: agents.length,
        count: items.length,
        offset,
        hasMore: offset + limit < agents.length,
        nextOffset: offset + limit < agents.length ? offset + limit : undefined,
        items,
      },
    };
  }

  async checkAgentHealth(query: CheckAgentHealthQuery): Promise<Result<AgentHealthResponseDto>> {
    logger.debug("Application: Checking agent health", { agentId: query.agentId });
    const result = await this.agentService.getAgent(query.agentId);
    if (!result.ok) return result as Result<AgentHealthResponseDto>;
    const agent = result.value;
    return {
      ok: true,
      value: {
        agentId: agent.id,
        name: agent.name,
        status: agent.status,
        isHealthy: agent.isHealthy(),
        lastHeartbeatAt: agent.lastHeartbeatAt,
      },
    };
  }
}
```

- [ ] **Étape 4 : Mettre à jour `ServiceContainer`**

```typescript
this.agentApplicationService = new AgentApplicationService(this.agentService);
```

- [ ] **Étape 5 : Migrer les tools agents vers `container.getAgentApplicationService()`**

Dans `paperclip-tools.ts`, pour `paperclip_list_agents` :

```typescript
server.registerTool(
  "paperclip_list_agents",
  { /* ... annotations inchangées */ },
  async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
    try {
      const company = await resolveCompany(container, company_id);
      const result = await container
        .getAgentApplicationService()
        .listAgents({ companyId: company.id, limit, offset });
      if (!result.ok) throw new Error(result.error.message);
      const dto = result.value;
      const structured = {
        total: dto.total,
        count: dto.count,
        offset: dto.offset,
        has_more: dto.hasMore,
        ...(dto.nextOffset !== undefined ? { next_offset: dto.nextOffset } : {}),
        items: dto.items,
      };
      return createTextResult(selectText(response_format, structured, renderAgents), structured);
    } catch (error) {
      return createErrorResult(error);
    }
  },
);
```

Pour `paperclip_get_agent` :

```typescript
server.registerTool(
  "paperclip_get_agent",
  { /* ... annotations inchangées */ },
  async ({ company_id, agent_id, response_format = "markdown" }) => {
    try {
      const company = await resolveCompany(container, company_id);
      const result = await container
        .getAgentApplicationService()
        .getAgent({ companyId: company.id, agentId: agent_id });
      if (!result.ok) throw new Error(result.error.message);
      return createTextResult(selectText(response_format, result.value, renderAgent), result.value);
    } catch (error) {
      return createErrorResult(error);
    }
  },
);
```

Pour `paperclip_get_agent_status`, `paperclip_get_agent_workload`, `paperclip_get_agent_recent_activity`, `paperclip_get_agent_capabilities` — ces quatre tools exposent des vues dérivées qui n'ont pas d'équivalent dans `AgentApplicationService`. Ils continuent d'utiliser `container.getLegacyClient()` jusqu'à la fin du refactor ou peuvent être simplifiés pour appeler `getAgent` :

```typescript
// paperclip_get_agent_status → identique à paperclip_get_agent (même données)
// Remplacer client.getAgentStatus() par container.getAgentApplicationService().getAgent()
async ({ company_id, agent_id, response_format = "markdown" }) => {
  try {
    const company = await resolveCompany(container, company_id);
    const result = await container
      .getAgentApplicationService()
      .getAgent({ companyId: company.id, agentId: agent_id });
    if (!result.ok) throw new Error(result.error.message);
    return createTextResult(selectText(response_format, result.value, renderAgentStatus), result.value);
  } catch (error) {
    return createErrorResult(error);
  }
},
```

Pour `paperclip_get_agent_workload` et `paperclip_get_agent_recent_activity` (dépendent des issues), garder `container.getLegacyClient()` pour cette PR.

- [ ] **Étape 6 : Lancer les tests**

```bash
npm run test && npm run typecheck && npm run lint
```

- [ ] **Étape 7 : Commit**

```bash
git add -p
git commit -m "refactor(agent): AppService → DomainService, mapper → functions, tools migrated

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4 — Domaines Project + Issue

### Fichiers
Voir liste en en-tête. Cette tâche crée 16 fichiers et en modifie 3.

- [ ] **Étape 1 : Ajouter les paths manquants dans `ApiPaths`**

Dans `packages/mcp/src/shared/api/paths.ts`, ajouter à `ApiPaths` :

```typescript
// Routines
routines: (companyId: string) => `/api/companies/${companyId}/routines`,

// Approvals
approvals: (companyId: string) => `/api/companies/${companyId}/approvals`,
```

- [ ] **Étape 2 : Créer `domains/project/types.ts`**

```typescript
export interface ProjectSnapshot {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  status: "in_progress" | "paused" | "completed" | "archived";
  leadAgentId: string | null;
  targetDate: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  urlKey: string;
}
```

- [ ] **Étape 3 : Créer `domains/project/entity.ts`**

```typescript
import type { ProjectSnapshot } from "./types.js";

export class Project {
  private constructor(
    readonly id: string,
    readonly companyId: string,
    readonly name: string,
    readonly description: string | null,
    readonly status: "in_progress" | "paused" | "completed" | "archived",
    readonly leadAgentId: string | null,
    readonly targetDate: string | null,
    readonly color: string,
    readonly createdAt: string,
    readonly updatedAt: string,
    readonly urlKey: string,
  ) {}

  static fromSnapshot(s: ProjectSnapshot): Project {
    return new Project(
      s.id, s.companyId, s.name, s.description, s.status,
      s.leadAgentId, s.targetDate, s.color, s.createdAt, s.updatedAt, s.urlKey,
    );
  }

  isActive(): boolean {
    return this.status === "in_progress";
  }
}
```

- [ ] **Étape 4 : Créer `domains/project/repository.ts`**

```typescript
import type { Result } from "../../shared/api/errors.js";
import type { Project } from "./entity.js";

export interface ProjectRepository {
  findById(companyId: string, projectId: string): Promise<Result<Project>>;
  findByCompanyId(companyId: string): Promise<Result<Project[]>>;
}
```

- [ ] **Étape 5 : Créer `domains/project/service.ts`**

```typescript
import { failure } from "../../shared/api/errors.js";
import type { Result } from "../../shared/api/errors.js";
import type { Project } from "./entity.js";
import type { ProjectRepository } from "./repository.js";

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async getProject(companyId: string, projectId: string): Promise<Result<Project>> {
    if (!projectId.trim()) return failure("Invalid project ID", "VALIDATION");
    return this.projectRepository.findById(companyId, projectId);
  }

  async listProjects(companyId: string): Promise<Result<Project[]>> {
    return this.projectRepository.findByCompanyId(companyId);
  }
}
```

- [ ] **Étape 6 : Créer `domains/project/mapper.ts`**

```typescript
import type { PaperclipProject } from "../../types.js";
import { Project } from "./entity.js";
import type { ProjectSnapshot } from "./types.js";

export function projectToDomain(api: PaperclipProject): Project {
  const snapshot: ProjectSnapshot = {
    id: api.id,
    companyId: api.companyId,
    name: api.name,
    description: api.description,
    status: api.status,
    leadAgentId: api.leadAgentId,
    targetDate: api.targetDate,
    color: api.color,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    urlKey: api.urlKey,
  };
  return Project.fromSnapshot(snapshot);
}

export function projectToDomainList(apis: PaperclipProject[]): Project[] {
  return apis.map(projectToDomain);
}
```

- [ ] **Étape 7 : Créer `infrastructure/repositories/project-repository.ts`**

```typescript
import type { ProjectRepository } from "../../domains/project/repository.js";
import type { Project } from "../../domains/project/entity.js";
import { projectToDomain, projectToDomainList } from "../../domains/project/mapper.js";
import type { PaperclipApiClient } from "../../shared/api/client.js";
import { ApiPaths } from "../../shared/api/paths.js";
import type { Result } from "../../shared/api/errors.js";
import { failure } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type { PaperclipProject } from "../../types.js";

export class PaperclipProjectRepository implements ProjectRepository {
  constructor(private readonly client: PaperclipApiClient) {}

  async findById(companyId: string, projectId: string): Promise<Result<Project>> {
    logger.debug("Fetching project", { companyId, projectId });
    const result = await this.client.get<PaperclipProject[]>(ApiPaths.projects(companyId));
    if (!result.ok) return result as Result<Project>;
    const project = result.value.find((p) => p.id === projectId);
    if (!project) return failure(`Project ${projectId} not found`, "NOT_FOUND", 404);
    return { ok: true, value: projectToDomain(project) };
  }

  async findByCompanyId(companyId: string): Promise<Result<Project[]>> {
    logger.debug("Fetching projects for company", { companyId });
    const result = await this.client.get<PaperclipProject[]>(ApiPaths.projects(companyId));
    if (!result.ok) return result as Result<Project[]>;
    return { ok: true, value: projectToDomainList(result.value) };
  }
}
```

- [ ] **Étape 8 : Écrire le test du repository project**

Créer `packages/mcp/test/project-repository.test.ts` :

```typescript
import { describe, expect, it, vi } from "vitest";
import { PaperclipProjectRepository } from "../src/infrastructure/repositories/project-repository.js";
import type { PaperclipApiClient } from "../src/shared/api/client.js";

const mockProject = {
  id: "proj-1",
  companyId: "co-1",
  name: "Alpha",
  description: null,
  status: "in_progress" as const,
  leadAgentId: null,
  targetDate: null,
  color: "#000",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  urlKey: "alpha",
  goalId: null,
  goals: [],
  goalIds: [],
  workspaces: [],
  primaryWorkspace: {} as any,
  codebase: {} as any,
  env: null,
  pauseReason: null,
  pausedAt: null,
  executionWorkspacePolicy: null,
  archivedAt: null,
};

function makeClient(value: unknown): PaperclipApiClient {
  return {
    get: vi.fn().mockResolvedValue({ ok: true, value }),
    baseUrl: "http://test",
  } as unknown as PaperclipApiClient;
}

describe("PaperclipProjectRepository", () => {
  it("findByCompanyId retourne une liste de Project", async () => {
    const repo = new PaperclipProjectRepository(makeClient([mockProject]));
    const result = await repo.findByCompanyId("co-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.id).toBe("proj-1");
    }
  });

  it("findById retourne NOT_FOUND si le projet est absent", async () => {
    const repo = new PaperclipProjectRepository(makeClient([]));
    const result = await repo.findById("co-1", "missing");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
  });
});
```

- [ ] **Étape 9 : Lancer le test (doit passer)**

```bash
npx vitest run packages/mcp/test/project-repository.test.ts
```

- [ ] **Étape 10 : Créer `application/dtos/project.dto.ts`**

```typescript
export interface GetProjectQuery {
  companyId: string;
  projectId: string;
}

export interface ProjectResponseDto {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  status: string;
  leadAgentId: string | null;
  targetDate: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  urlKey: string;
}

export interface ListProjectsQuery {
  companyId: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedProjectsResponseDto {
  total: number;
  count: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | undefined;
  items: ProjectResponseDto[];
}
```

- [ ] **Étape 11 : Créer `application/services/project.application.ts`**

```typescript
import type { ProjectService } from "../../domains/project/service.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type {
  GetProjectQuery,
  ListProjectsQuery,
  PaginatedProjectsResponseDto,
  ProjectResponseDto,
} from "../dtos/project.dto.js";

function toDto(project: { id: string; companyId: string; name: string; description: string | null; status: string; leadAgentId: string | null; targetDate: string | null; color: string; createdAt: string; updatedAt: string; urlKey: string; isActive(): boolean }): ProjectResponseDto {
  return {
    id: project.id,
    companyId: project.companyId,
    name: project.name,
    description: project.description,
    status: project.status,
    leadAgentId: project.leadAgentId,
    targetDate: project.targetDate,
    color: project.color,
    isActive: project.isActive(),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    urlKey: project.urlKey,
  };
}

export class ProjectApplicationService {
  constructor(private readonly projectService: ProjectService) {}

  async getProject(query: GetProjectQuery): Promise<Result<ProjectResponseDto>> {
    logger.debug("Application: Getting project", query);
    const result = await this.projectService.getProject(query.companyId, query.projectId);
    if (!result.ok) return result as Result<ProjectResponseDto>;
    return { ok: true, value: toDto(result.value) };
  }

  async listProjects(query: ListProjectsQuery): Promise<Result<PaginatedProjectsResponseDto>> {
    logger.debug("Application: Listing projects", { query });
    const result = await this.projectService.listProjects(query.companyId);
    if (!result.ok) return result as Result<PaginatedProjectsResponseDto>;
    const projects = result.value;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const items = projects.slice(offset, offset + limit).map(toDto);
    return {
      ok: true,
      value: {
        total: projects.length,
        count: items.length,
        offset,
        hasMore: offset + limit < projects.length,
        nextOffset: offset + limit < projects.length ? offset + limit : undefined,
        items,
      },
    };
  }
}
```

- [ ] **Étape 12 : Créer les fichiers Issue (même patron que Project)**

Créer `packages/mcp/src/domains/issue/types.ts` :

```typescript
export interface IssueSnapshot {
  id: string;
  companyId: string;
  projectId: string | null;
  parentId: string | null;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "in_review" | "done" | "cancelled";
  priority: "trivial" | "low" | "medium" | "high" | "critical";
  assigneeAgentId: string | null;
  assigneeUserId: string | null;
  createdByAgentId: string | null;
  issueNumber: number;
  identifier: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null;
  unresolvedBlockerCount: number;
}
```

Créer `packages/mcp/src/domains/issue/entity.ts` :

```typescript
import type { IssueSnapshot } from "./types.js";

export class Issue {
  private constructor(
    readonly id: string,
    readonly companyId: string,
    readonly projectId: string | null,
    readonly parentId: string | null,
    readonly title: string,
    readonly description: string | null,
    readonly status: "open" | "in_progress" | "in_review" | "done" | "cancelled",
    readonly priority: "trivial" | "low" | "medium" | "high" | "critical",
    readonly assigneeAgentId: string | null,
    readonly assigneeUserId: string | null,
    readonly createdByAgentId: string | null,
    readonly issueNumber: number,
    readonly identifier: string,
    readonly startedAt: string | null,
    readonly completedAt: string | null,
    readonly createdAt: string,
    readonly updatedAt: string,
    readonly lastActivityAt: string | null,
    readonly unresolvedBlockerCount: number,
  ) {}

  static fromSnapshot(s: IssueSnapshot): Issue {
    return new Issue(
      s.id, s.companyId, s.projectId, s.parentId, s.title, s.description,
      s.status, s.priority, s.assigneeAgentId, s.assigneeUserId, s.createdByAgentId,
      s.issueNumber, s.identifier, s.startedAt, s.completedAt,
      s.createdAt, s.updatedAt, s.lastActivityAt, s.unresolvedBlockerCount,
    );
  }

  isBlocked(): boolean {
    return this.unresolvedBlockerCount > 0;
  }

  isOverdue(now = new Date()): boolean {
    return false; // dueDate non exposé par l'API actuelle
  }

  isUnassigned(): boolean {
    return this.assigneeAgentId === null && this.assigneeUserId === null;
  }
}
```

Créer `packages/mcp/src/domains/issue/repository.ts` :

```typescript
import type { Result } from "../../shared/api/errors.js";
import type { Issue } from "./entity.js";

export interface IssueFilter {
  projectId?: string;
  status?: string;
  assigneeAgentId?: string;
}

export interface IssueRepository {
  findById(companyId: string, issueId: string): Promise<Result<Issue>>;
  findByCompanyId(companyId: string, filter?: IssueFilter): Promise<Result<Issue[]>>;
}
```

Créer `packages/mcp/src/domains/issue/service.ts` :

```typescript
import { failure } from "../../shared/api/errors.js";
import type { Result } from "../../shared/api/errors.js";
import type { Issue } from "./entity.js";
import type { IssueFilter, IssueRepository } from "./repository.js";

export class IssueService {
  constructor(private readonly issueRepository: IssueRepository) {}

  async getIssue(companyId: string, issueId: string): Promise<Result<Issue>> {
    if (!issueId.trim()) return failure("Invalid issue ID", "VALIDATION");
    return this.issueRepository.findById(companyId, issueId);
  }

  async listIssues(companyId: string, filter?: IssueFilter): Promise<Result<Issue[]>> {
    return this.issueRepository.findByCompanyId(companyId, filter);
  }

  async listBlockedIssues(companyId: string): Promise<Result<Issue[]>> {
    const result = await this.issueRepository.findByCompanyId(companyId, { status: "in_progress" });
    if (!result.ok) return result;
    return { ok: true, value: result.value.filter((i) => i.isBlocked()) };
  }

  async listUnassignedIssues(companyId: string): Promise<Result<Issue[]>> {
    const result = await this.issueRepository.findByCompanyId(companyId);
    if (!result.ok) return result;
    return { ok: true, value: result.value.filter((i) => i.isUnassigned()) };
  }
}
```

Créer `packages/mcp/src/domains/issue/mapper.ts` :

```typescript
import type { PaperclipIssue } from "../../types.js";
import { Issue } from "./entity.js";
import type { IssueSnapshot } from "./types.js";

export function issueToDomain(api: PaperclipIssue): Issue {
  const snapshot: IssueSnapshot = {
    id: api.id,
    companyId: api.companyId,
    projectId: api.projectId,
    parentId: api.parentId,
    title: api.title,
    description: api.description,
    status: api.status,
    priority: api.priority,
    assigneeAgentId: api.assigneeAgentId,
    assigneeUserId: api.assigneeUserId,
    createdByAgentId: api.createdByAgentId,
    issueNumber: api.issueNumber,
    identifier: api.identifier,
    startedAt: api.startedAt,
    completedAt: api.completedAt,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    lastActivityAt: api.lastActivityAt,
    unresolvedBlockerCount: api.blockerAttention.unresolvedBlockerCount,
  };
  return Issue.fromSnapshot(snapshot);
}

export function issueToDomainList(apis: PaperclipIssue[]): Issue[] {
  return apis.map(issueToDomain);
}
```

Créer `packages/mcp/src/infrastructure/repositories/issue-repository.ts` :

```typescript
import type { IssueFilter, IssueRepository } from "../../domains/issue/repository.js";
import type { Issue } from "../../domains/issue/entity.js";
import { issueToDomain, issueToDomainList } from "../../domains/issue/mapper.js";
import type { PaperclipApiClient } from "../../shared/api/client.js";
import { ApiPaths } from "../../shared/api/paths.js";
import type { Result } from "../../shared/api/errors.js";
import { failure } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type { PaperclipIssue } from "../../types.js";

export class PaperclipIssueRepository implements IssueRepository {
  constructor(private readonly client: PaperclipApiClient) {}

  async findById(companyId: string, issueId: string): Promise<Result<Issue>> {
    logger.debug("Fetching issue", { companyId, issueId });
    const result = await this.client.get<PaperclipIssue[]>(ApiPaths.issues(companyId));
    if (!result.ok) return result as Result<Issue>;
    const issue = result.value.find((i) => i.id === issueId);
    if (!issue) return failure(`Issue ${issueId} not found`, "NOT_FOUND", 404);
    return { ok: true, value: issueToDomain(issue) };
  }

  async findByCompanyId(companyId: string, filter?: IssueFilter): Promise<Result<Issue[]>> {
    logger.debug("Fetching issues for company", { companyId, filter });
    const params = filter
      ? {
          ...(filter.projectId !== undefined ? { projectId: filter.projectId } : {}),
          ...(filter.status !== undefined ? { status: filter.status } : {}),
          ...(filter.assigneeAgentId !== undefined ? { assigneeAgentId: filter.assigneeAgentId } : {}),
        }
      : undefined;
    const result = await this.client.get<PaperclipIssue[]>(ApiPaths.issues(companyId, params));
    if (!result.ok) return result as Result<Issue[]>;
    return { ok: true, value: issueToDomainList(result.value) };
  }
}
```

Créer `packages/mcp/src/application/dtos/issue.dto.ts` :

```typescript
export interface GetIssueQuery { companyId: string; issueId: string; }
export interface ListIssuesQuery { companyId: string; limit?: number; offset?: number; projectId?: string; status?: string; }

export interface IssueResponseDto {
  id: string;
  companyId: string;
  projectId: string | null;
  parentId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeAgentId: string | null;
  assigneeUserId: string | null;
  issueNumber: number;
  identifier: string;
  isBlocked: boolean;
  isUnassigned: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null;
}

export interface PaginatedIssuesResponseDto {
  total: number; count: number; offset: number; hasMore: boolean; nextOffset: number | undefined; items: IssueResponseDto[];
}
```

Créer `packages/mcp/src/application/services/issue.application.ts` :

```typescript
import type { IssueService } from "../../domains/issue/service.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type {
  GetIssueQuery, IssueResponseDto, ListIssuesQuery, PaginatedIssuesResponseDto,
} from "../dtos/issue.dto.js";
import type { Issue } from "../../domains/issue/entity.js";

function toDto(issue: Issue): IssueResponseDto {
  return {
    id: issue.id, companyId: issue.companyId, projectId: issue.projectId,
    parentId: issue.parentId, title: issue.title, description: issue.description,
    status: issue.status, priority: issue.priority,
    assigneeAgentId: issue.assigneeAgentId, assigneeUserId: issue.assigneeUserId,
    issueNumber: issue.issueNumber, identifier: issue.identifier,
    isBlocked: issue.isBlocked(), isUnassigned: issue.isUnassigned(),
    createdAt: issue.createdAt, updatedAt: issue.updatedAt, lastActivityAt: issue.lastActivityAt,
  };
}

function paginate<T>(items: T[], offset: number, limit: number) {
  const page = items.slice(offset, offset + limit);
  return {
    total: items.length, count: page.length, offset,
    hasMore: offset + limit < items.length,
    nextOffset: offset + limit < items.length ? offset + limit : undefined,
    items: page,
  };
}

export class IssueApplicationService {
  constructor(private readonly issueService: IssueService) {}

  async getIssue(query: GetIssueQuery): Promise<Result<IssueResponseDto>> {
    logger.debug("Application: Getting issue", query);
    const result = await this.issueService.getIssue(query.companyId, query.issueId);
    if (!result.ok) return result as Result<IssueResponseDto>;
    return { ok: true, value: toDto(result.value) };
  }

  async listIssues(query: ListIssuesQuery): Promise<Result<PaginatedIssuesResponseDto>> {
    logger.debug("Application: Listing issues", { query });
    const result = await this.issueService.listIssues(query.companyId, {
      projectId: query.projectId, status: query.status,
    });
    if (!result.ok) return result as Result<PaginatedIssuesResponseDto>;
    return { ok: true, value: paginate(result.value.map(toDto), query.offset ?? 0, query.limit ?? 20) };
  }

  async listBlockedIssues(query: { companyId: string; limit?: number; offset?: number }): Promise<Result<PaginatedIssuesResponseDto>> {
    logger.debug("Application: Listing blocked issues", { companyId: query.companyId });
    const result = await this.issueService.listBlockedIssues(query.companyId);
    if (!result.ok) return result as Result<PaginatedIssuesResponseDto>;
    return { ok: true, value: paginate(result.value.map(toDto), query.offset ?? 0, query.limit ?? 20) };
  }

  async listUnassignedIssues(query: { companyId: string; limit?: number; offset?: number }): Promise<Result<PaginatedIssuesResponseDto>> {
    logger.debug("Application: Listing unassigned issues", { companyId: query.companyId });
    const result = await this.issueService.listUnassignedIssues(query.companyId);
    if (!result.ok) return result as Result<PaginatedIssuesResponseDto>;
    return { ok: true, value: paginate(result.value.map(toDto), query.offset ?? 0, query.limit ?? 20) };
  }
}
```

- [ ] **Étape 13 : Écrire le test issue repository**

Créer `packages/mcp/test/issue-repository.test.ts` :

```typescript
import { describe, expect, it, vi } from "vitest";
import { PaperclipIssueRepository } from "../src/infrastructure/repositories/issue-repository.js";
import type { PaperclipApiClient } from "../src/shared/api/client.js";

const mockIssue = {
  id: "iss-1", companyId: "co-1", projectId: null, parentId: null,
  title: "Fix bug", description: null, status: "open" as const,
  priority: "high" as const, assigneeAgentId: null, assigneeUserId: null,
  createdByAgentId: null, createdByUserId: null, issueNumber: 1, identifier: "TST-1",
  originKind: "manual", originId: null, requestDepth: 0, billingCode: null,
  executionPolicy: null, startedAt: null, completedAt: null, cancelledAt: null,
  hiddenAt: null, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  labels: [], labelIds: [], lastActivityAt: null,
  blockerAttention: { state: "healthy", reason: null, unresolvedBlockerCount: 0, coveredBlockerCount: 0, stalledBlockerCount: 0, attentionBlockerCount: 0, sampleBlockerIdentifier: null, sampleStalledBlockerIdentifier: null },
};

function makeClient(value: unknown): PaperclipApiClient {
  return { get: vi.fn().mockResolvedValue({ ok: true, value }), baseUrl: "http://test" } as unknown as PaperclipApiClient;
}

describe("PaperclipIssueRepository", () => {
  it("findByCompanyId retourne une liste d'Issue", async () => {
    const repo = new PaperclipIssueRepository(makeClient([mockIssue]));
    const result = await repo.findByCompanyId("co-1");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value[0]?.id).toBe("iss-1");
  });

  it("findById retourne NOT_FOUND si absent", async () => {
    const repo = new PaperclipIssueRepository(makeClient([]));
    const result = await repo.findById("co-1", "missing");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
  });
});
```

- [ ] **Étape 14 : Lancer les tests**

```bash
npx vitest run packages/mcp/test/project-repository.test.ts packages/mcp/test/issue-repository.test.ts
```

- [ ] **Étape 15 : Enregistrer les nouveaux services dans `ServiceContainer`**

Dans `packages/mcp/src/shared/container.ts`, ajouter :

```typescript
import { ProjectApplicationService } from "../application/services/project.application.js";
import { IssueApplicationService } from "../application/services/issue.application.js";
import { ProjectService } from "../domains/project/service.js";
import { IssueService } from "../domains/issue/service.js";
import { PaperclipProjectRepository } from "../infrastructure/repositories/project-repository.js";
import { PaperclipIssueRepository } from "../infrastructure/repositories/issue-repository.js";

// Dans le constructeur :
this.projectRepository = new PaperclipProjectRepository(apiClient);
this.issueRepository = new PaperclipIssueRepository(apiClient);
this.projectService = new ProjectService(this.projectRepository);
this.issueService = new IssueService(this.issueRepository);
this.projectApplicationService = new ProjectApplicationService(this.projectService);
this.issueApplicationService = new IssueApplicationService(this.issueService);

// Nouvelles méthodes publiques :
getProjectApplicationService(): ProjectApplicationService {
  return this.projectApplicationService;
}

getIssueApplicationService(): IssueApplicationService {
  return this.issueApplicationService;
}
```

- [ ] **Étape 16 : Migrer les tools Project et Issue dans `paperclip-tools.ts`**

Pour `paperclip_list_projects` :

```typescript
async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
  try {
    const company = await resolveCompany(container, company_id);
    const result = await container
      .getProjectApplicationService()
      .listProjects({ companyId: company.id, limit, offset });
    if (!result.ok) throw new Error(result.error.message);
    const dto = result.value;
    const structured = {
      total: dto.total, count: dto.count, offset: dto.offset,
      has_more: dto.hasMore,
      ...(dto.nextOffset !== undefined ? { next_offset: dto.nextOffset } : {}),
      items: dto.items,
    };
    return createTextResult(selectText(response_format, structured, renderProjects), structured);
  } catch (error) {
    return createErrorResult(error);
  }
},
```

Pour `paperclip_get_project` :

```typescript
async ({ company_id, project_id, response_format = "markdown" }) => {
  try {
    const company = await resolveCompany(container, company_id);
    const result = await container
      .getProjectApplicationService()
      .getProject({ companyId: company.id, projectId: project_id });
    if (!result.ok) throw new Error(result.error.message);
    return createTextResult(selectText(response_format, result.value, renderProject), result.value);
  } catch (error) {
    return createErrorResult(error);
  }
},
```

Pour `paperclip_list_issues` :

```typescript
async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
  try {
    const company = await resolveCompany(container, company_id);
    const result = await container
      .getIssueApplicationService()
      .listIssues({ companyId: company.id, limit, offset });
    if (!result.ok) throw new Error(result.error.message);
    const dto = result.value;
    const structured = {
      total: dto.total, count: dto.count, offset: dto.offset,
      has_more: dto.hasMore,
      ...(dto.nextOffset !== undefined ? { next_offset: dto.nextOffset } : {}),
      items: dto.items,
    };
    return createTextResult(selectText(response_format, structured, renderIssues), structured);
  } catch (error) {
    return createErrorResult(error);
  }
},
```

Pour `paperclip_get_issue` :

```typescript
async ({ company_id, issue_id, response_format = "markdown" }) => {
  try {
    const company = await resolveCompany(container, company_id);
    const result = await container
      .getIssueApplicationService()
      .getIssue({ companyId: company.id, issueId: issue_id });
    if (!result.ok) throw new Error(result.error.message);
    return createTextResult(selectText(response_format, result.value, renderIssue), result.value);
  } catch (error) {
    return createErrorResult(error);
  }
},
```

Pour `paperclip_list_blocked_tasks`, `paperclip_list_unassigned_tasks` :

```typescript
// paperclip_list_blocked_tasks
async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
  try {
    const company = await resolveCompany(container, company_id);
    const result = await container
      .getIssueApplicationService()
      .listBlockedIssues({ companyId: company.id, limit, offset });
    if (!result.ok) throw new Error(result.error.message);
    const dto = result.value;
    const structured = { total: dto.total, count: dto.count, offset: dto.offset, has_more: dto.hasMore, items: dto.items };
    return createTextResult(selectText(response_format, structured, renderBlockedTasks), structured);
  } catch (error) {
    return createErrorResult(error);
  }
},
```

Pour `paperclip_list_overdue_tasks` et `paperclip_get_task_dependencies` — ces tools dépendent d'une logique qui n'est pas encore dans le domaine Issue. Garder `container.getLegacyClient()` pour cette PR.

Pour `paperclip_get_project_status`, `paperclip_get_project_risks`, `paperclip_list_project_agents`, `paperclip_list_project_tasks` — garder `container.getLegacyClient()` car ces vues combinent Project + Issue + Agent.

- [ ] **Étape 17 : Lancer tous les tests**

```bash
npm run test && npm run typecheck && npm run lint
```

- [ ] **Étape 18 : Commit**

```bash
git add -p
git commit -m "feat(project,issue): add domain layers, migrate list/get tools

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5 — Domaine Routine (vrai endpoint)

### Fichiers
Voir liste en en-tête.

- [ ] **Étape 1 : Créer `domains/routine/types.ts`**

```typescript
export interface RoutineTriggerSnapshot {
  id: string;
  kind: "schedule" | "webhook" | "api";
  label: string | null;
  enabled: boolean;
  cronExpression: string | null;
  timezone: string | null;
  nextRunAt: string | null;
  lastFiredAt: string | null;
  lastResult: string | null;
}

export interface RoutineRunSnapshot {
  id: string;
  routineId: string;
  source: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  triggeredAt: string;
  failureReason: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface RoutineSnapshot {
  id: string;
  companyId: string;
  projectId: string | null;
  title: string;
  description: string | null;
  assigneeAgentId: string | null;
  priority: string;
  status: "active" | "paused" | "draft" | "archived";
  concurrencyPolicy: string;
  catchUpPolicy: string;
  lastTriggeredAt: string | null;
  lastEnqueuedAt: string | null;
  createdAt: string;
  updatedAt: string;
  triggers: RoutineTriggerSnapshot[];
  lastRun: RoutineRunSnapshot | null;
}
```

- [ ] **Étape 2 : Créer `domains/routine/entity.ts`**

```typescript
import type { RoutineRunSnapshot, RoutineSnapshot, RoutineTriggerSnapshot } from "./types.js";

export class RoutineTrigger {
  constructor(
    readonly id: string,
    readonly kind: "schedule" | "webhook" | "api",
    readonly label: string | null,
    readonly enabled: boolean,
    readonly cronExpression: string | null,
    readonly timezone: string | null,
    readonly nextRunAt: string | null,
    readonly lastFiredAt: string | null,
    readonly lastResult: string | null,
  ) {}

  static fromSnapshot(s: RoutineTriggerSnapshot): RoutineTrigger {
    return new RoutineTrigger(s.id, s.kind, s.label, s.enabled, s.cronExpression, s.timezone, s.nextRunAt, s.lastFiredAt, s.lastResult);
  }
}

export class RoutineRun {
  constructor(
    readonly id: string,
    readonly routineId: string,
    readonly source: string,
    readonly status: "pending" | "running" | "completed" | "failed" | "skipped",
    readonly triggeredAt: string,
    readonly failureReason: string | null,
    readonly completedAt: string | null,
    readonly createdAt: string,
  ) {}

  static fromSnapshot(s: RoutineRunSnapshot): RoutineRun {
    return new RoutineRun(s.id, s.routineId, s.source, s.status, s.triggeredAt, s.failureReason, s.completedAt, s.createdAt);
  }

  hasFailed(): boolean { return this.status === "failed"; }
}

export class Routine {
  private constructor(
    readonly id: string,
    readonly companyId: string,
    readonly projectId: string | null,
    readonly title: string,
    readonly description: string | null,
    readonly assigneeAgentId: string | null,
    readonly priority: string,
    readonly status: "active" | "paused" | "draft" | "archived",
    readonly concurrencyPolicy: string,
    readonly catchUpPolicy: string,
    readonly lastTriggeredAt: string | null,
    readonly lastEnqueuedAt: string | null,
    readonly createdAt: string,
    readonly updatedAt: string,
    readonly triggers: RoutineTrigger[],
    readonly lastRun: RoutineRun | null,
  ) {}

  static fromSnapshot(s: RoutineSnapshot): Routine {
    return new Routine(
      s.id, s.companyId, s.projectId, s.title, s.description, s.assigneeAgentId,
      s.priority, s.status, s.concurrencyPolicy, s.catchUpPolicy,
      s.lastTriggeredAt, s.lastEnqueuedAt, s.createdAt, s.updatedAt,
      s.triggers.map(RoutineTrigger.fromSnapshot),
      s.lastRun ? RoutineRun.fromSnapshot(s.lastRun) : null,
    );
  }

  isActive(): boolean { return this.status === "active"; }
  lastRunFailed(): boolean { return this.lastRun?.hasFailed() ?? false; }

  nextRunAt(): string | null {
    return this.triggers.find((t) => t.enabled && t.nextRunAt !== null)?.nextRunAt ?? null;
  }
}
```

- [ ] **Étape 3 : Créer `domains/routine/repository.ts`**

```typescript
import type { Result } from "../../shared/api/errors.js";
import type { Routine } from "./entity.js";

export interface RoutineRepository {
  findByCompanyId(companyId: string): Promise<Result<Routine[]>>;
}
```

- [ ] **Étape 4 : Créer `domains/routine/service.ts`**

```typescript
import type { Result } from "../../shared/api/errors.js";
import type { Routine } from "./entity.js";
import type { RoutineRepository } from "./repository.js";

export class RoutineService {
  constructor(private readonly routineRepository: RoutineRepository) {}

  async listRoutines(companyId: string): Promise<Result<Routine[]>> {
    return this.routineRepository.findByCompanyId(companyId);
  }

  async listFailedRoutines(companyId: string): Promise<Result<Routine[]>> {
    const result = await this.routineRepository.findByCompanyId(companyId);
    if (!result.ok) return result;
    return { ok: true, value: result.value.filter((r) => r.lastRunFailed()) };
  }
}
```

- [ ] **Étape 5 : Créer `domains/routine/mapper.ts`**

La shape API Routine telle qu'observée en local :

```typescript
import { Routine } from "./entity.js";
import type { RoutineRunSnapshot, RoutineSnapshot, RoutineTriggerSnapshot } from "./types.js";

interface ApiRoutineTrigger {
  id: string; kind: string; label: string | null; enabled: boolean;
  cronExpression: string | null; timezone: string | null;
  nextRunAt: string | null; lastFiredAt: string | null; lastResult: string | null;
}

interface ApiRoutineRun {
  id: string; routineId: string; source: string; status: string;
  triggeredAt: string; failureReason: string | null; completedAt: string | null; createdAt: string;
}

export interface ApiRoutine {
  id: string; companyId: string; projectId: string | null;
  title: string; description: string | null; assigneeAgentId: string | null;
  priority: string; status: string; concurrencyPolicy: string; catchUpPolicy: string;
  lastTriggeredAt: string | null; lastEnqueuedAt: string | null;
  createdAt: string; updatedAt: string;
  triggers: ApiRoutineTrigger[];
  lastRun: ApiRoutineRun | null;
}

function mapTrigger(t: ApiRoutineTrigger): RoutineTriggerSnapshot {
  return {
    id: t.id,
    kind: (t.kind as "schedule" | "webhook" | "api"),
    label: t.label, enabled: t.enabled,
    cronExpression: t.cronExpression, timezone: t.timezone,
    nextRunAt: t.nextRunAt, lastFiredAt: t.lastFiredAt, lastResult: t.lastResult,
  };
}

function mapRun(r: ApiRoutineRun): RoutineRunSnapshot {
  return {
    id: r.id, routineId: r.routineId, source: r.source,
    status: (r.status as RoutineRunSnapshot["status"]),
    triggeredAt: r.triggeredAt, failureReason: r.failureReason,
    completedAt: r.completedAt, createdAt: r.createdAt,
  };
}

export function routineToDomain(api: ApiRoutine): Routine {
  const snapshot: RoutineSnapshot = {
    id: api.id, companyId: api.companyId, projectId: api.projectId,
    title: api.title, description: api.description, assigneeAgentId: api.assigneeAgentId,
    priority: api.priority, status: (api.status as RoutineSnapshot["status"]),
    concurrencyPolicy: api.concurrencyPolicy, catchUpPolicy: api.catchUpPolicy,
    lastTriggeredAt: api.lastTriggeredAt, lastEnqueuedAt: api.lastEnqueuedAt,
    createdAt: api.createdAt, updatedAt: api.updatedAt,
    triggers: api.triggers.map(mapTrigger),
    lastRun: api.lastRun ? mapRun(api.lastRun) : null,
  };
  return Routine.fromSnapshot(snapshot);
}

export function routineToDomainList(apis: ApiRoutine[]): Routine[] {
  return apis.map(routineToDomain);
}
```

- [ ] **Étape 6 : Créer `infrastructure/repositories/routine-repository.ts`**

```typescript
import type { RoutineRepository } from "../../domains/routine/repository.js";
import type { Routine } from "../../domains/routine/entity.js";
import { type ApiRoutine, routineToDomainList } from "../../domains/routine/mapper.js";
import type { PaperclipApiClient } from "../../shared/api/client.js";
import { ApiPaths } from "../../shared/api/paths.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";

export class PaperclipRoutineRepository implements RoutineRepository {
  constructor(private readonly client: PaperclipApiClient) {}

  async findByCompanyId(companyId: string): Promise<Result<Routine[]>> {
    logger.debug("Fetching routines", { companyId });
    const result = await this.client.get<ApiRoutine[]>(ApiPaths.routines(companyId));
    if (!result.ok) return result as Result<Routine[]>;
    return { ok: true, value: routineToDomainList(result.value) };
  }
}
```

- [ ] **Étape 7 : Écrire le test repository routine**

Créer `packages/mcp/test/routine-repository.test.ts` :

```typescript
import { describe, expect, it, vi } from "vitest";
import { PaperclipRoutineRepository } from "../src/infrastructure/repositories/routine-repository.js";
import type { PaperclipApiClient } from "../src/shared/api/client.js";

const mockRoutine = {
  id: "r-1", companyId: "co-1", projectId: null,
  title: "Daily sync", description: null, assigneeAgentId: null,
  priority: "medium", status: "active", concurrencyPolicy: "coalesce_if_active",
  catchUpPolicy: "skip_missed", lastTriggeredAt: null, lastEnqueuedAt: null,
  createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  triggers: [{ id: "t-1", kind: "schedule", label: null, enabled: true, cronExpression: "0 9 * * *", timezone: "UTC", nextRunAt: "2026-05-04T09:00:00Z", lastFiredAt: null, lastResult: null }],
  lastRun: null,
};

function makeClient(value: unknown): PaperclipApiClient {
  return { get: vi.fn().mockResolvedValue({ ok: true, value }), baseUrl: "http://test" } as unknown as PaperclipApiClient;
}

describe("PaperclipRoutineRepository", () => {
  it("findByCompanyId retourne une liste de Routine avec triggers", async () => {
    const repo = new PaperclipRoutineRepository(makeClient([mockRoutine]));
    const result = await repo.findByCompanyId("co-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]?.id).toBe("r-1");
      expect(result.value[0]?.triggers).toHaveLength(1);
      expect(result.value[0]?.nextRunAt()).toBe("2026-05-04T09:00:00Z");
    }
  });
});
```

- [ ] **Étape 8 : Lancer le test**

```bash
npx vitest run packages/mcp/test/routine-repository.test.ts
```

- [ ] **Étape 9 : Créer `application/dtos/routine.dto.ts`**

```typescript
export interface ListRoutinesQuery { companyId: string; limit?: number; offset?: number; }

export interface RoutineTriggerDto {
  id: string; kind: string; enabled: boolean;
  cronExpression: string | null; nextRunAt: string | null; lastFiredAt: string | null; lastResult: string | null;
}

export interface RoutineRunDto {
  id: string; status: string; triggeredAt: string; failureReason: string | null; completedAt: string | null;
}

export interface RoutineResponseDto {
  id: string; companyId: string; projectId: string | null; title: string;
  description: string | null; assigneeAgentId: string | null; priority: string;
  status: string; concurrencyPolicy: string; catchUpPolicy: string;
  lastTriggeredAt: string | null; nextRunAt: string | null;
  isActive: boolean; lastRunFailed: boolean;
  createdAt: string; updatedAt: string;
  triggers: RoutineTriggerDto[];
  lastRun: RoutineRunDto | null;
}

export interface PaginatedRoutinesResponseDto {
  total: number; count: number; offset: number; hasMore: boolean; nextOffset: number | undefined; items: RoutineResponseDto[];
}
```

- [ ] **Étape 10 : Créer `application/services/routine.application.ts`**

```typescript
import type { RoutineService } from "../../domains/routine/service.js";
import type { Routine } from "../../domains/routine/entity.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type { ListRoutinesQuery, PaginatedRoutinesResponseDto, RoutineResponseDto } from "../dtos/routine.dto.js";

function toDto(r: Routine): RoutineResponseDto {
  return {
    id: r.id, companyId: r.companyId, projectId: r.projectId, title: r.title,
    description: r.description, assigneeAgentId: r.assigneeAgentId, priority: r.priority,
    status: r.status, concurrencyPolicy: r.concurrencyPolicy, catchUpPolicy: r.catchUpPolicy,
    lastTriggeredAt: r.lastTriggeredAt, nextRunAt: r.nextRunAt(),
    isActive: r.isActive(), lastRunFailed: r.lastRunFailed(),
    createdAt: r.createdAt, updatedAt: r.updatedAt,
    triggers: r.triggers.map((t) => ({
      id: t.id, kind: t.kind, enabled: t.enabled,
      cronExpression: t.cronExpression, nextRunAt: t.nextRunAt,
      lastFiredAt: t.lastFiredAt, lastResult: t.lastResult,
    })),
    lastRun: r.lastRun
      ? { id: r.lastRun.id, status: r.lastRun.status, triggeredAt: r.lastRun.triggeredAt, failureReason: r.lastRun.failureReason, completedAt: r.lastRun.completedAt }
      : null,
  };
}

export class RoutineApplicationService {
  constructor(private readonly routineService: RoutineService) {}

  async listRoutines(query: ListRoutinesQuery): Promise<Result<PaginatedRoutinesResponseDto>> {
    logger.debug("Application: Listing routines", { companyId: query.companyId });
    const result = await this.routineService.listRoutines(query.companyId);
    if (!result.ok) return result as Result<PaginatedRoutinesResponseDto>;
    const routines = result.value;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const items = routines.slice(offset, offset + limit).map(toDto);
    return {
      ok: true,
      value: {
        total: routines.length, count: items.length, offset,
        hasMore: offset + limit < routines.length,
        nextOffset: offset + limit < routines.length ? offset + limit : undefined,
        items,
      },
    };
  }
}
```

- [ ] **Étape 11 : Enregistrer dans `ServiceContainer`**

Ajouter les imports et champs :

```typescript
import { RoutineApplicationService } from "../application/services/routine.application.js";
import { RoutineService } from "../domains/routine/service.js";
import { PaperclipRoutineRepository } from "../infrastructure/repositories/routine-repository.js";

// Dans constructor :
this.routineRepository = new PaperclipRoutineRepository(apiClient);
this.routineService = new RoutineService(this.routineRepository);
this.routineApplicationService = new RoutineApplicationService(this.routineService);

// Méthode publique :
getRoutineApplicationService(): RoutineApplicationService {
  return this.routineApplicationService;
}
```

- [ ] **Étape 12 : Mettre à jour `renderRoutines` dans `paperclip-renderers.ts`**

Remplacer la fonction `renderRoutines` existante :

```typescript
export function renderRoutines(data: { items: RoutineResponseDto[]; total: number }): string {
  if (data.items.length === 0) return "No routines found.";
  const lines = [`## Routines (${data.total} total)\n`];
  for (const r of data.items) {
    lines.push(`### ${r.title}`);
    lines.push(`- **Status:** ${r.status}${r.isActive ? " ✓" : ""}`);
    lines.push(`- **Priority:** ${r.priority}`);
    if (r.nextRunAt) lines.push(`- **Next run:** ${r.nextRunAt}`);
    if (r.lastTriggeredAt) lines.push(`- **Last triggered:** ${r.lastTriggeredAt}`);
    if (r.lastRun) {
      lines.push(`- **Last run:** ${r.lastRun.status}${r.lastRun.failureReason ? ` — ${r.lastRun.failureReason}` : ""}`);
    }
    if (r.triggers.length > 0) {
      lines.push("- **Triggers:**");
      for (const t of r.triggers) {
        const schedule = t.cronExpression ? ` \`${t.cronExpression}\`` : "";
        lines.push(`  - ${t.kind}${schedule}${t.enabled ? "" : " (disabled)"}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}
```

Ajouter l'import du DTO dans le fichier :

```typescript
import type { RoutineResponseDto } from "../application/dtos/routine.dto.js";
```

- [ ] **Étape 13 : Réécrire `paperclip_list_routines` dans `paperclip-tools.ts`, supprimer les 4 tools fake**

Supprimer les `server.registerTool` pour :
- `paperclip_get_routine`
- `paperclip_list_routine_runs`
- `paperclip_get_routine_run`
- `paperclip_get_routine_schedule`

Réécrire `paperclip_list_routines` :

```typescript
server.registerTool(
  "paperclip_list_routines",
  {
    title: "List Paperclip routines",
    description: "List active routines in a company with triggers and last run status.",
    inputSchema: companyReadOnlyListSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
    try {
      const company = await resolveCompany(container, company_id);
      const result = await container
        .getRoutineApplicationService()
        .listRoutines({ companyId: company.id, limit, offset });
      if (!result.ok) throw new Error(result.error.message);
      const dto = result.value;
      const structured = {
        total: dto.total, count: dto.count, offset: dto.offset,
        has_more: dto.hasMore,
        ...(dto.nextOffset !== undefined ? { next_offset: dto.nextOffset } : {}),
        items: dto.items,
      };
      return createTextResult(selectText(response_format, structured, renderRoutines), structured);
    } catch (error) {
      return createErrorResult(error);
    }
  },
);
```

- [ ] **Étape 14 : Lancer tous les tests**

```bash
npm run test && npm run typecheck && npm run lint
```

- [ ] **Étape 15 : Commit**

```bash
git add -p
git commit -m "feat(routine): add domain layer, real API endpoint, remove 4 fake tools

Supprimés: get_routine, get_routine_run, list_routine_runs, get_routine_schedule
list_routines expose triggers et lastRun depuis /api/companies/:id/routines

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6 — Domaine Approval + suppression du legacy

### Fichiers
Voir liste en en-tête.

- [ ] **Étape 1 : Créer `domains/approval/types.ts`**

```typescript
export type ApprovalType = "hire_agent" | string;
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalSnapshot {
  id: string;
  companyId: string;
  type: ApprovalType;
  requestedByAgentId: string | null;
  requestedByUserId: string | null;
  status: ApprovalStatus;
  payload: Record<string, unknown>;
  decisionNote: string | null;
  decidedByUserId: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Étape 2 : Créer `domains/approval/entity.ts`**

```typescript
import type { ApprovalSnapshot, ApprovalStatus, ApprovalType } from "./types.js";

export class Approval {
  private constructor(
    readonly id: string,
    readonly companyId: string,
    readonly type: ApprovalType,
    readonly requestedByAgentId: string | null,
    readonly requestedByUserId: string | null,
    readonly status: ApprovalStatus,
    readonly payload: Record<string, unknown>,
    readonly decisionNote: string | null,
    readonly decidedByUserId: string | null,
    readonly decidedAt: string | null,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  static fromSnapshot(s: ApprovalSnapshot): Approval {
    return new Approval(
      s.id, s.companyId, s.type, s.requestedByAgentId, s.requestedByUserId,
      s.status, s.payload, s.decisionNote, s.decidedByUserId, s.decidedAt,
      s.createdAt, s.updatedAt,
    );
  }

  isPending(): boolean { return this.status === "pending"; }
}
```

- [ ] **Étape 3 : Créer `domains/approval/repository.ts`**

```typescript
import type { Result } from "../../shared/api/errors.js";
import type { Approval } from "./entity.js";

export interface ApprovalRepository {
  findById(companyId: string, approvalId: string): Promise<Result<Approval>>;
  findByCompanyId(companyId: string): Promise<Result<Approval[]>>;
}
```

- [ ] **Étape 4 : Créer `domains/approval/service.ts`**

```typescript
import type { Result } from "../../shared/api/errors.js";
import type { Approval } from "./entity.js";
import type { ApprovalRepository } from "./repository.js";

export class ApprovalService {
  constructor(private readonly approvalRepository: ApprovalRepository) {}

  async listApprovals(companyId: string): Promise<Result<Approval[]>> {
    return this.approvalRepository.findByCompanyId(companyId);
  }

  async listPendingApprovals(companyId: string): Promise<Result<Approval[]>> {
    const result = await this.approvalRepository.findByCompanyId(companyId);
    if (!result.ok) return result;
    return { ok: true, value: result.value.filter((a) => a.isPending()) };
  }

  async getApproval(companyId: string, approvalId: string): Promise<Result<Approval>> {
    return this.approvalRepository.findById(companyId, approvalId);
  }
}
```

- [ ] **Étape 5 : Créer `domains/approval/mapper.ts`**

```typescript
import { Approval } from "./entity.js";
import type { ApprovalSnapshot } from "./types.js";

interface ApiApproval {
  id: string; companyId: string; type: string;
  requestedByAgentId: string | null; requestedByUserId: string | null;
  status: string; payload: Record<string, unknown>; decisionNote: string | null;
  decidedByUserId: string | null; decidedAt: string | null;
  createdAt: string; updatedAt: string;
}

export function approvalToDomain(api: ApiApproval): Approval {
  const snapshot: ApprovalSnapshot = {
    id: api.id, companyId: api.companyId, type: api.type,
    requestedByAgentId: api.requestedByAgentId, requestedByUserId: api.requestedByUserId,
    status: (api.status as ApprovalSnapshot["status"]),
    payload: api.payload, decisionNote: api.decisionNote,
    decidedByUserId: api.decidedByUserId, decidedAt: api.decidedAt,
    createdAt: api.createdAt, updatedAt: api.updatedAt,
  };
  return Approval.fromSnapshot(snapshot);
}

export function approvalToDomainList(apis: ApiApproval[]): Approval[] {
  return apis.map(approvalToDomain);
}

export type { ApiApproval };
```

- [ ] **Étape 6 : Créer `infrastructure/repositories/approval-repository.ts`**

```typescript
import type { ApprovalRepository } from "../../domains/approval/repository.js";
import type { Approval } from "../../domains/approval/entity.js";
import { type ApiApproval, approvalToDomain, approvalToDomainList } from "../../domains/approval/mapper.js";
import type { PaperclipApiClient } from "../../shared/api/client.js";
import { ApiPaths } from "../../shared/api/paths.js";
import { failure } from "../../shared/api/errors.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";

export class PaperclipApprovalRepository implements ApprovalRepository {
  constructor(private readonly client: PaperclipApiClient) {}

  async findByCompanyId(companyId: string): Promise<Result<Approval[]>> {
    logger.debug("Fetching approvals", { companyId });
    const result = await this.client.get<ApiApproval[]>(ApiPaths.approvals(companyId));
    if (!result.ok) return result as Result<Approval[]>;
    return { ok: true, value: approvalToDomainList(result.value) };
  }

  async findById(companyId: string, approvalId: string): Promise<Result<Approval>> {
    logger.debug("Fetching approval", { companyId, approvalId });
    const result = await this.client.get<ApiApproval[]>(ApiPaths.approvals(companyId));
    if (!result.ok) return result as Result<Approval>;
    const approval = result.value.find((a) => a.id === approvalId);
    if (!approval) return failure(`Approval ${approvalId} not found`, "NOT_FOUND", 404);
    return { ok: true, value: approvalToDomain(approval) };
  }
}
```

- [ ] **Étape 7 : Écrire le test repository approval**

Créer `packages/mcp/test/approval-repository.test.ts` :

```typescript
import { describe, expect, it, vi } from "vitest";
import { PaperclipApprovalRepository } from "../src/infrastructure/repositories/approval-repository.js";
import type { PaperclipApiClient } from "../src/shared/api/client.js";

const mockApproval = {
  id: "appr-1", companyId: "co-1", type: "hire_agent",
  requestedByAgentId: "agent-1", requestedByUserId: null,
  status: "pending", payload: { name: "New Agent" }, decisionNote: null,
  decidedByUserId: null, decidedAt: null,
  createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
};

function makeClient(value: unknown): PaperclipApiClient {
  return { get: vi.fn().mockResolvedValue({ ok: true, value }), baseUrl: "http://test" } as unknown as PaperclipApiClient;
}

describe("PaperclipApprovalRepository", () => {
  it("findByCompanyId retourne une liste d'Approval", async () => {
    const repo = new PaperclipApprovalRepository(makeClient([mockApproval]));
    const result = await repo.findByCompanyId("co-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]?.id).toBe("appr-1");
      expect(result.value[0]?.isPending()).toBe(true);
    }
  });

  it("findById retourne NOT_FOUND si absent", async () => {
    const repo = new PaperclipApprovalRepository(makeClient([]));
    const result = await repo.findById("co-1", "missing");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
  });
});
```

- [ ] **Étape 8 : Lancer le test**

```bash
npx vitest run packages/mcp/test/approval-repository.test.ts
```

- [ ] **Étape 9 : Créer `application/dtos/approval.dto.ts`**

```typescript
export interface ListApprovalsQuery { companyId: string; limit?: number; offset?: number; }
export interface GetApprovalQuery { companyId: string; approvalId: string; }

export interface ApprovalResponseDto {
  id: string; companyId: string; type: string;
  requestedByAgentId: string | null; requestedByUserId: string | null;
  status: string; payload: Record<string, unknown>;
  decisionNote: string | null; decidedByUserId: string | null; decidedAt: string | null;
  isPending: boolean; createdAt: string; updatedAt: string;
}

export interface PaginatedApprovalsResponseDto {
  total: number; count: number; offset: number; hasMore: boolean; nextOffset: number | undefined; items: ApprovalResponseDto[];
}
```

- [ ] **Étape 10 : Créer `application/services/approval.application.ts`**

```typescript
import type { ApprovalService } from "../../domains/approval/service.js";
import type { Approval } from "../../domains/approval/entity.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type {
  ApprovalResponseDto, GetApprovalQuery, ListApprovalsQuery, PaginatedApprovalsResponseDto,
} from "../dtos/approval.dto.js";

function toDto(a: Approval): ApprovalResponseDto {
  return {
    id: a.id, companyId: a.companyId, type: a.type,
    requestedByAgentId: a.requestedByAgentId, requestedByUserId: a.requestedByUserId,
    status: a.status, payload: a.payload, decisionNote: a.decisionNote,
    decidedByUserId: a.decidedByUserId, decidedAt: a.decidedAt,
    isPending: a.isPending(), createdAt: a.createdAt, updatedAt: a.updatedAt,
  };
}

function paginate<T>(items: T[], offset: number, limit: number) {
  const page = items.slice(offset, offset + limit);
  return { total: items.length, count: page.length, offset, hasMore: offset + limit < items.length, nextOffset: offset + limit < items.length ? offset + limit : undefined, items: page };
}

export class ApprovalApplicationService {
  constructor(private readonly approvalService: ApprovalService) {}

  async listApprovals(query: ListApprovalsQuery): Promise<Result<PaginatedApprovalsResponseDto>> {
    logger.debug("Application: Listing approvals", { companyId: query.companyId });
    const result = await this.approvalService.listApprovals(query.companyId);
    if (!result.ok) return result as Result<PaginatedApprovalsResponseDto>;
    return { ok: true, value: paginate(result.value.map(toDto), query.offset ?? 0, query.limit ?? 20) };
  }

  async listPendingApprovals(query: ListApprovalsQuery): Promise<Result<PaginatedApprovalsResponseDto>> {
    logger.debug("Application: Listing pending approvals", { companyId: query.companyId });
    const result = await this.approvalService.listPendingApprovals(query.companyId);
    if (!result.ok) return result as Result<PaginatedApprovalsResponseDto>;
    return { ok: true, value: paginate(result.value.map(toDto), query.offset ?? 0, query.limit ?? 20) };
  }

  async getApproval(query: GetApprovalQuery): Promise<Result<ApprovalResponseDto>> {
    logger.debug("Application: Getting approval", query);
    const result = await this.approvalService.getApproval(query.companyId, query.approvalId);
    if (!result.ok) return result as Result<ApprovalResponseDto>;
    return { ok: true, value: toDto(result.value) };
  }
}
```

- [ ] **Étape 11 : Enregistrer dans `ServiceContainer`**

```typescript
import { ApprovalApplicationService } from "../application/services/approval.application.js";
import { ApprovalService } from "../domains/approval/service.js";
import { PaperclipApprovalRepository } from "../infrastructure/repositories/approval-repository.js";

// Dans constructor :
this.approvalRepository = new PaperclipApprovalRepository(apiClient);
this.approvalService = new ApprovalService(this.approvalRepository);
this.approvalApplicationService = new ApprovalApplicationService(this.approvalService);

// Méthode publique :
getApprovalApplicationService(): ApprovalApplicationService {
  return this.approvalApplicationService;
}
```

- [ ] **Étape 12 : Réécrire les 3 tools Approval dans `paperclip-tools.ts`**

Remplacer `paperclip_list_pending_approvals` :

```typescript
server.registerTool(
  "paperclip_list_pending_approvals",
  {
    title: "List pending approvals",
    description: "List approvals awaiting a decision in a company.",
    inputSchema: companyReadOnlyListSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
    try {
      const company = await resolveCompany(container, company_id);
      const result = await container
        .getApprovalApplicationService()
        .listPendingApprovals({ companyId: company.id, limit, offset });
      if (!result.ok) throw new Error(result.error.message);
      const dto = result.value;
      const structured = { total: dto.total, count: dto.count, offset: dto.offset, has_more: dto.hasMore, items: dto.items };
      return createTextResult(selectText(response_format, structured, renderPendingApprovals), structured);
    } catch (error) {
      return createErrorResult(error);
    }
  },
);
```

Remplacer `paperclip_get_approval_request` :

```typescript
server.registerTool(
  "paperclip_get_approval_request",
  {
    title: "Get approval request",
    description: "Get details about a specific approval request.",
    inputSchema: companyReadOnlyGetSchema.extend({ approval_id: z.string() }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ company_id, approval_id, response_format = "markdown" }) => {
    try {
      const company = await resolveCompany(container, company_id);
      const result = await container
        .getApprovalApplicationService()
        .getApproval({ companyId: company.id, approvalId: approval_id });
      if (!result.ok) throw new Error(result.error.message);
      return createTextResult(selectText(response_format, result.value, renderApprovalRequest), result.value);
    } catch (error) {
      return createErrorResult(error);
    }
  },
);
```

Remplacer `paperclip_list_high_risk_actions` :

```typescript
server.registerTool(
  "paperclip_list_high_risk_actions",
  {
    title: "List high-risk actions",
    description: "List pending approvals with high or critical priority.",
    inputSchema: companyReadOnlyListSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
    try {
      const company = await resolveCompany(container, company_id);
      const allResult = await container
        .getApprovalApplicationService()
        .listPendingApprovals({ companyId: company.id, limit: 1000, offset: 0 });
      if (!allResult.ok) throw new Error(allResult.error.message);
      const highRisk = allResult.value.items.filter(
        (a) => a.type === "hire_agent" && a.isPending,
      );
      const page = highRisk.slice(offset, offset + limit);
      const structured = { total: highRisk.length, count: page.length, offset, has_more: offset + limit < highRisk.length, items: page };
      return createTextResult(selectText(response_format, structured, renderHighRiskActions), structured);
    } catch (error) {
      return createErrorResult(error);
    }
  },
);
```

- [ ] **Étape 13 : Supprimer `getLegacyClient()` de `ServiceContainer` et retirer l'import de `PaperclipClient`**

Supprimer la méthode `getLegacyClient()` et le champ `legacyClient` du `ServiceContainer`. Supprimer l'import de `../services/paperclip-client.js`.

Vérifier que plus aucun fichier n'appelle `getLegacyClient()` :

```bash
grep -r "getLegacyClient" packages/mcp/src/
```

Résultat attendu : aucune occurrence.

- [ ] **Étape 14 : Supprimer `services/paperclip-client.ts`**

```bash
rm packages/mcp/src/services/paperclip-client.ts
```

- [ ] **Étape 15 : Lancer la suite complète**

```bash
npm run check
```

Résultat attendu : 0 erreurs, 0 warnings de lint.

- [ ] **Étape 16 : Commit**

```bash
git add -p
git commit -m "feat(approval): add domain layer, real API endpoint, remove PaperclipClient legacy

- /api/companies/:id/approvals câblé via ApprovalRepository
- list_pending_approvals, get_approval_request, list_high_risk_actions réimplémentés
- PaperclipClient (services/) supprimé définitivement
- getLegacyClient() retiré de ServiceContainer

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7 — Documentation

### Fichiers
- Modify: `docs/architecture.md`
- Modify: `docs/board-assistant-roadmap.md`
- Modify: `CLAUDE.md`
- Modify: `.serena/memories/style_and_conventions.md`
- Modify: `.serena/memories/project_overview.md`

- [ ] **Étape 1 : Mettre à jour `docs/architecture.md`**

Réécrire la section "Current runtime architecture" pour refléter :
- Règle DDD unique : Tool → ApplicationService → DomainService → Repository → PaperclipApiClient
- 6 domaines : Company, Agent, Project, Issue, Routine, Approval
- Suppression de PaperclipClient (legacy)
- Endpoints réels utilisés par chaque domaine
- Tableau des tools supprimés (4 outils routine fake)

- [ ] **Étape 2 : Mettre à jour `docs/board-assistant-roadmap.md`**

Dans la section sur la surface MCP actuelle :
- Supprimer `paperclip_get_routine`, `paperclip_get_routine_run`, `paperclip_list_routine_runs`, `paperclip_get_routine_schedule` de la liste
- Marquer `paperclip_list_routines`, `paperclip_list_pending_approvals`, `paperclip_get_approval_request`, `paperclip_list_high_risk_actions` comme basés sur les vrais endpoints

- [ ] **Étape 3 : Mettre à jour `CLAUDE.md`**

Dans la section Architecture, corriger :
- Supprimer la note sur les deux clients HTTP
- Décrire la règle DDD unique
- Mettre à jour la liste des domaines avec leurs endpoints
- Corriger la liste des tools (supprimer les 4 fake)

- [ ] **Étape 4 : Mettre à jour les mémoires Serena**

Dans `.serena/memories/style_and_conventions.md`, remplacer :
> keep all Paperclip HTTP access in src/services/paperclip-client.ts

Par :
> all Paperclip HTTP access goes through PaperclipApiClient (shared/api/client.ts) via infrastructure repositories. src/services/paperclip-client.ts has been deleted.

Dans `.serena/memories/project_overview.md`, mettre à jour la surface MCP pour retirer les 4 tools fake.

- [ ] **Étape 5 : Lancer la vérification finale**

```bash
npm run check
```

- [ ] **Étape 6 : Commit**

```bash
git add docs/ CLAUDE.md .serena/memories/
git commit -m "docs: update architecture, roadmap, CLAUDE.md and Serena memories post-refactor

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
