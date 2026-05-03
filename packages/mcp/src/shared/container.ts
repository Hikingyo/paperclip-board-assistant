import { AgentApplicationService } from "../application/services/agent.application.js";
import { CompanyApplicationService } from "../application/services/company.application.js";
import { AgentService } from "../domains/agent/service.js";
import { CompanyService } from "../domains/company/service.js";
import { PaperclipAgentRepository } from "../infrastructure/repositories/agent-repository.js";
import { PaperclipCompanyRepository } from "../infrastructure/repositories/company-repository.js";
import type { PaperclipApiClient } from "../shared/api/client.js";

/**
 * Service Container
 * Manages dependency injection for application, domain, and infrastructure layers
 */
export class ServiceContainer {
  private apiClient: PaperclipApiClient;
  private companyRepository: PaperclipCompanyRepository;
  private agentRepository: PaperclipAgentRepository;
  private companyService: CompanyService;
  private agentService: AgentService;
  private companyApplicationService: CompanyApplicationService;
  private agentApplicationService: AgentApplicationService;

  constructor(apiClient: PaperclipApiClient, defaultCompanyId?: string) {
    this.apiClient = apiClient;

    // Infrastructure Layer
    this.companyRepository = new PaperclipCompanyRepository(apiClient);
    this.agentRepository = new PaperclipAgentRepository(apiClient, defaultCompanyId || "default");

    // Domain Layer
    this.companyService = new CompanyService(this.companyRepository);
    this.agentService = new AgentService(this.agentRepository);

    // Application Layer
    this.companyApplicationService = new CompanyApplicationService(this.companyRepository);
    this.agentApplicationService = new AgentApplicationService(this.agentRepository);
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
