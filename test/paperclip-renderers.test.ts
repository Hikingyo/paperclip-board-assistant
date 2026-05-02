import { describe, expect, it } from "vitest";

import {
  renderCompanies,
  renderCompany,
  renderCompanyBoardSummary,
  renderSession,
} from "../src/tools/paperclip-renderers.js";
import {
  formatJson,
  paginate,
  resolveRequestedItem,
  selectText,
} from "../src/tools/paperclip-tool-helpers.js";

describe("paperclip tool helpers", () => {
  it("paginates arrays with next_offset metadata", () => {
    expect(paginate([1, 2, 3], 2, 0)).toEqual({
      total: 3,
      count: 2,
      offset: 0,
      has_more: true,
      next_offset: 2,
      items: [1, 2],
    });
  });

  it("selects JSON output when requested", () => {
    expect(selectText("json", { status: "ok" }, () => "markdown")).toBe(
      formatJson({ status: "ok" }),
    );
  });

  it("resolves a requested item by id", () => {
    expect(
      resolveRequestedItem(
        [
          { id: "company-1", name: "Acme" },
          { id: "company-2", name: "Globex" },
        ],
        {
          itemId: "company-2",
          resourceName: "company",
          resourceNamePlural: "companies",
          idFieldName: "company_id",
        },
      ),
    ).toEqual({ id: "company-2", name: "Globex" });
  });

  it("requires company_id when multiple items are visible", () => {
    expect(() =>
      resolveRequestedItem(
        [
          { id: "company-1", name: "Acme" },
          { id: "company-2", name: "Globex" },
        ],
        {
          resourceName: "company",
          resourceNamePlural: "companies",
          idFieldName: "company_id",
        },
      ),
    ).toThrow("Multiple companies are visible");
  });
});

describe("paperclip renderers", () => {
  it("renders the empty session state clearly", () => {
    expect(
      renderSession({
        session: null,
        user: null,
      }),
    ).toContain("No active session");
  });

  it("renders companies with pagination context", () => {
    expect(
      renderCompanies({
        total: 1,
        count: 1,
        offset: 0,
        has_more: false,
        items: [
          {
            id: "company-1",
            name: "Acme",
            description: null,
            status: "active",
            issuePrefix: "ACM",
            issueCounter: 10,
            budgetMonthlyCents: 0,
            spentMonthlyCents: 0,
            attachmentMaxBytes: 1024,
            requireBoardApprovalForNewAgents: true,
            feedbackDataSharingEnabled: false,
            feedbackDataSharingConsentAt: null,
            feedbackDataSharingConsentByUserId: null,
            feedbackDataSharingTermsVersion: null,
            brandColor: null,
            logoAssetId: null,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
            logoUrl: null,
          },
        ],
      }),
    ).toContain("Acme (company-1)");
  });

  it("renders a company detail view", () => {
    expect(
      renderCompany({
        id: "company-1",
        name: "Acme",
        description: "Board-led company",
        status: "active",
        issuePrefix: "ACM",
        issueCounter: 10,
        budgetMonthlyCents: 100_000,
        spentMonthlyCents: 25_000,
        attachmentMaxBytes: 1024,
        requireBoardApprovalForNewAgents: true,
        feedbackDataSharingEnabled: false,
        feedbackDataSharingConsentAt: null,
        feedbackDataSharingConsentByUserId: null,
        feedbackDataSharingTermsVersion: null,
        brandColor: "#ff0000",
        logoAssetId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
        logoUrl: null,
      }),
    ).toContain("Board-led company");
  });

  it("renders board summary flags and budget metrics", () => {
    expect(
      renderCompanyBoardSummary({
        company: {
          id: "company-1",
          name: "Acme",
          description: null,
          status: "active",
          issuePrefix: "ACM",
          issueCounter: 10,
          budgetMonthlyCents: 100_000,
          spentMonthlyCents: 125_000,
          attachmentMaxBytes: 1024,
          requireBoardApprovalForNewAgents: true,
          feedbackDataSharingEnabled: false,
          feedbackDataSharingConsentAt: null,
          feedbackDataSharingConsentByUserId: null,
          feedbackDataSharingTermsVersion: null,
          brandColor: null,
          logoAssetId: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
          logoUrl: null,
        },
        budget_remaining_cents: -25_000,
        budget_utilization_percent: 125,
        next_issue_number: 11,
        board_flags: [
          "New agent creation is gated behind board approval.",
          "Monthly spend is above the configured budget.",
        ],
      }),
    ).toContain("Monthly spend is above the configured budget.");
  });
});
