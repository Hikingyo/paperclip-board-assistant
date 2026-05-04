import type { PaperclipCompany } from "../../types.js";
import { Company } from "./entity.js";
import type { CompanySnapshot } from "./types.js";

export function toCompanyDomain(api: PaperclipCompany): Company {
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

export function toCompanyDomainList(apis: PaperclipCompany[]): Company[] {
  return apis.map((api) => toCompanyDomain(api));
}

export function toCompanyPersistence(domain: Company): PaperclipCompany {
  return {
    id: domain.id,
    name: domain.name,
    description: domain.description,
    status: domain.status,
    issuePrefix: domain.issuePrefix,
    issueCounter: domain.issueCounter,
    budgetMonthlyCents: domain.budgetMonthlyCents,
    spentMonthlyCents: domain.spentMonthlyCents,
    attachmentMaxBytes: 0,
    requireBoardApprovalForNewAgents: false,
    feedbackDataSharingEnabled: false,
    feedbackDataSharingConsentAt: null,
    feedbackDataSharingConsentByUserId: null,
    feedbackDataSharingTermsVersion: null,
    brandColor: domain.brandColor,
    logoAssetId: null,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
    logoUrl: domain.logoUrl,
  };
}
