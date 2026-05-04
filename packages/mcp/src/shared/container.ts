import { AgentApplicationService } from "../application/services/agent.application.js";
import { CompanyApplicationService } from "../application/services/company.application.js";
import { IssueApplicationService } from "../application/services/issue.application.js";
import { ProjectApplicationService } from "../application/services/project.application.js";
import { RoutineApplicationService } from "../application/services/routine.application.js";
import { AgentService } from "../domains/agent/service.js";
import { CompanyService } from "../domains/company/service.js";
import { IssueService } from "../domains/issue/service.js";
import { ProjectService } from "../domains/project/service.js";
import { RoutineService } from "../domains/routine/service.js";
import { PaperclipAgentRepository } from "../infrastructure/repositories/agent-repository.js";
import { PaperclipCompanyRepository } from "../infrastructure/repositories/company-repository.js";
import { PaperclipIssueRepository } from "../infrastructure/repositories/issue-repository.js";
import { PaperclipProjectRepository } from "../infrastructure/repositories/project-repository.js";
import { PaperclipRoutineRepository } from "../infrastructure/repositories/routine-repository.js";
import type { PaperclipApiClient } from "./api/client.js";

/**
 * Service Container
 * Manages dependency injection for application, domain, and infrastructure layers
 */
export class ServiceContainer {
  private readonly apiClient: PaperclipApiClient;
  private readonly companyRepository: PaperclipCompanyRepository;
  private readonly agentRepository: PaperclipAgentRepository;
  private readonly companyService: CompanyService;
  private readonly agentService: AgentService;
  private readonly projectService: ProjectService;
  private readonly issueService: IssueService;
  private readonly companyApplicationService: CompanyApplicationService;
  private readonly agentApplicationService: AgentApplicationService;
  private readonly projectApplicationService: ProjectApplicationService;
  private readonly issueApplicationService: IssueApplicationService;
  private readonly routineApplicationService: RoutineApplicationService;

  constructor(apiClient: PaperclipApiClient, defaultCompanyId?: string) {
    this.apiClient = apiClient;

    // Infrastructure Layer
    this.companyRepository = new PaperclipCompanyRepository(apiClient);
    this.agentRepository = new PaperclipAgentRepository(apiClient, defaultCompanyId ?? "default");
    const projectRepository = new PaperclipProjectRepository(apiClient);
    const issueRepository = new PaperclipIssueRepository(apiClient);
    const routineRepository = new PaperclipRoutineRepository(apiClient);

    // Domain Layer
    this.companyService = new CompanyService(this.companyRepository);
    this.agentService = new AgentService(this.agentRepository);
    this.projectService = new ProjectService(projectRepository);
    this.issueService = new IssueService(issueRepository);
    const routineService = new RoutineService(routineRepository);

    // Application Layer
    this.companyApplicationService = new CompanyApplicationService(this.companyService);
    this.agentApplicationService = new AgentApplicationService(this.agentService);
    this.projectApplicationService = new ProjectApplicationService(this.projectService);
    this.issueApplicationService = new IssueApplicationService(this.issueService);
    this.routineApplicationService = new RoutineApplicationService(routineService);
  }

  /**
   * Get Company Application Service for use cases
   */
  getCompanyApplicationService(): CompanyApplicationService {
    return this.companyApplicationService;
  }

  /**
   * Get Agent Application Service for use cases
   */
  getAgentApplicationService(): AgentApplicationService {
    return this.agentApplicationService;
  }

  getProjectApplicationService(): ProjectApplicationService {
    return this.projectApplicationService;
  }

  getIssueApplicationService(): IssueApplicationService {
    return this.issueApplicationService;
  }

  getRoutineApplicationService(): RoutineApplicationService {
    return this.routineApplicationService;
  }

  /**
   * Get Company Domain Service for business logic
   */
  getCompanyService(): CompanyService {
    return this.companyService;
  }

  /**
   * Get Agent Domain Service for business logic
   */
  getAgentService(): AgentService {
    return this.agentService;
  }

  /**
   * Get API Client (for tools not yet migrated)
   */
  getApiClient(): PaperclipApiClient {
    return this.apiClient;
  }
}
