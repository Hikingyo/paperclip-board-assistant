import { describe, expect, it } from "vitest";

import {
  buildCompanyActivityFeed,
  buildCompanyBoardSummary,
  buildCompanyMetrics,
  buildCompanyPolicies,
} from "../src/tools/paperclip-company-insights.js";
import {
  renderCompanies,
  renderCompany,
  renderCompanyActivityFeed,
  renderCompanyBoardSummary,
  renderCompanyExecutionSummary,
  renderCompanyMetrics,
  renderCompanyPolicies,
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

  it("derives company metrics from visible company metadata", () => {
    expect(
      buildCompanyMetrics({
        id: "company-1",
        name: "Acme",
        description: null,
        status: "active",
        issuePrefix: "ACM",
        issueCounter: 10,
        budgetMonthlyCents: 100_000,
        spentMonthlyCents: 25_000,
        attachmentMaxBytes: 5_242_880,
        requireBoardApprovalForNewAgents: true,
        feedbackDataSharingEnabled: true,
        feedbackDataSharingConsentAt: "2026-01-02T00:00:00.000Z",
        feedbackDataSharingConsentByUserId: "user-1",
        feedbackDataSharingTermsVersion: "2026-01",
        brandColor: null,
        logoAssetId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
        logoUrl: null,
      }),
    ).toMatchObject({
      budget_status: "within_budget",
      budget_remaining_cents: 75_000,
      budget_utilization_percent: 25,
      next_issue_number: 11,
      attachment_max_bytes: 5_242_880,
      attachment_max_mebibytes: 5,
    });
  });

  it("derives governance flags from company policy metadata", () => {
    expect(
      buildCompanyPolicies({
        id: "company-1",
        name: "Acme",
        description: null,
        status: "active",
        issuePrefix: "ACM",
        issueCounter: 10,
        budgetMonthlyCents: 100_000,
        spentMonthlyCents: 25_000,
        attachmentMaxBytes: 1024,
        requireBoardApprovalForNewAgents: true,
        feedbackDataSharingEnabled: true,
        feedbackDataSharingConsentAt: null,
        feedbackDataSharingConsentByUserId: null,
        feedbackDataSharingTermsVersion: null,
        brandColor: null,
        logoAssetId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
        logoUrl: null,
      }).governance_flags,
    ).toEqual([
      "New agent creation is gated behind board approval.",
      "Feedback data sharing is enabled but consent metadata is incomplete.",
    ]);
  });

  it("derives a company activity feed from visible metadata", () => {
    expect(
      buildCompanyActivityFeed({
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
        feedbackDataSharingEnabled: true,
        feedbackDataSharingConsentAt: "2026-01-03T00:00:00.000Z",
        feedbackDataSharingConsentByUserId: "user-1",
        feedbackDataSharingTermsVersion: "2026-01",
        brandColor: null,
        logoAssetId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-04T00:00:00.000Z",
        logoUrl: null,
      }),
    ).toMatchObject({
      derived_from: "visible_company_metadata",
      total_events: 5,
      latest_event_at: "2026-01-04T00:00:00.000Z",
      activity: [
        {
          id: "board-flag-1",
          kind: "board_flag",
          title: "Board signal visible in latest snapshot",
          summary: "New agent creation is gated behind board approval.",
        },
        {
          id: "board-flag-2",
          kind: "board_flag",
          title: "Board signal visible in latest snapshot",
          summary: "Monthly spend is above the configured budget.",
        },
        {
          id: "company-metadata-updated",
          kind: "lifecycle",
          title: "Company metadata updated",
        },
        {
          id: "feedback-data-sharing-consent-recorded",
          kind: "governance",
          title: "Feedback sharing consent recorded",
        },
        {
          id: "company-created",
          kind: "lifecycle",
          title: "Company created",
        },
      ],
    });
  });

  it("keeps board summary aligned with shared company insights", () => {
    expect(
      buildCompanyBoardSummary({
        id: "company-1",
        name: "Acme",
        description: null,
        status: "active",
        issuePrefix: "ACM",
        issueCounter: 10,
        budgetMonthlyCents: 0,
        spentMonthlyCents: 0,
        attachmentMaxBytes: 1024,
        requireBoardApprovalForNewAgents: false,
        feedbackDataSharingEnabled: false,
        feedbackDataSharingConsentAt: null,
        feedbackDataSharingConsentByUserId: null,
        feedbackDataSharingTermsVersion: null,
        brandColor: null,
        logoAssetId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
        logoUrl: null,
      }).board_flags,
    ).toEqual(["Feedback data sharing is disabled.", "Monthly budget is not configured."]);
  });

  it("renders company metrics with derived budget status", () => {
    expect(
      renderCompanyMetrics({
        company: {
          id: "company-1",
          name: "Acme",
          description: null,
          status: "active",
          issuePrefix: "ACM",
          issueCounter: 10,
          budgetMonthlyCents: 100_000,
          spentMonthlyCents: 125_000,
          attachmentMaxBytes: 5_242_880,
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
        budget_status: "over_budget",
        budget_remaining_cents: -25_000,
        budget_utilization_percent: 125,
        next_issue_number: 11,
        attachment_max_bytes: 5_242_880,
        attachment_max_mebibytes: 5,
      }),
    ).toContain("Budget status**: Over budget");
  });

  it("renders company policies with governance flags", () => {
    expect(
      renderCompanyPolicies({
        company: {
          id: "company-1",
          name: "Acme",
          description: null,
          status: "active",
          issuePrefix: "ACM",
          issueCounter: 10,
          budgetMonthlyCents: 100_000,
          spentMonthlyCents: 25_000,
          attachmentMaxBytes: 1024,
          requireBoardApprovalForNewAgents: true,
          feedbackDataSharingEnabled: true,
          feedbackDataSharingConsentAt: null,
          feedbackDataSharingConsentByUserId: null,
          feedbackDataSharingTermsVersion: null,
          brandColor: "#ff0000",
          logoAssetId: "logo-1",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
          logoUrl: "https://example.com/logo.png",
        },
        require_board_approval_for_new_agents: true,
        feedback_data_sharing_enabled: true,
        feedback_data_sharing_consent_at: null,
        feedback_data_sharing_consent_by_user_id: null,
        feedback_data_sharing_terms_version: null,
        brand_color: "#ff0000",
        logo_asset_id: "logo-1",
        logo_url: "https://example.com/logo.png",
        governance_flags: [
          "New agent creation is gated behind board approval.",
          "Feedback data sharing is enabled but consent metadata is incomplete.",
        ],
      }),
    ).toContain("Feedback data sharing is enabled but consent metadata is incomplete.");
  });

  it("renders company activity feed entries in order", () => {
    expect(
      renderCompanyActivityFeed({
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
          feedbackDataSharingEnabled: true,
          feedbackDataSharingConsentAt: "2026-01-03T00:00:00.000Z",
          feedbackDataSharingConsentByUserId: "user-1",
          feedbackDataSharingTermsVersion: "2026-01",
          brandColor: null,
          logoAssetId: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-04T00:00:00.000Z",
          logoUrl: null,
        },
        derived_from: "visible_company_metadata",
        total_events: 2,
        latest_event_at: "2026-01-04T00:00:00.000Z",
        activity: [
          {
            id: "company-metadata-updated",
            kind: "lifecycle",
            occurred_at: "2026-01-04T00:00:00.000Z",
            title: "Company metadata updated",
            summary: "Latest visible metadata shows status active and issue counter 10.",
          },
          {
            id: "company-created",
            kind: "lifecycle",
            occurred_at: "2026-01-01T00:00:00.000Z",
            title: "Company created",
            summary: "Acme became visible with status active.",
          },
        ],
      }),
    ).toContain("Company metadata updated");
  });

  it("renders a company execution summary with company focus", () => {
    expect(
      renderCompanyExecutionSummary({
        derived_from: "visible_companies_metadata",
        total_companies: 2,
        active_companies: 2,
        companies_requiring_board_attention: 1,
        over_budget_companies: 1,
        board_approval_gated_companies: 1,
        feedback_sharing_disabled_companies: 1,
        total_monthly_budget_cents: 300_000,
        total_monthly_spend_cents: 175_000,
        total_budget_remaining_cents: 125_000,
        portfolio_flags: ["1 visible company requires board attention."],
        companies: [
          {
            company_id: "company-1",
            company_name: "Acme",
            status: "active",
            budget_status: "over_budget",
            budget_utilization_percent: 125,
            budget_remaining_cents: -25_000,
            board_attention_needed: true,
            board_flags: ["Monthly spend is above the configured budget."],
            last_updated_at: "2026-01-03T00:00:00.000Z",
          },
          {
            company_id: "company-2",
            company_name: "Globex",
            status: "active",
            budget_status: "within_budget",
            budget_utilization_percent: 25,
            budget_remaining_cents: 150_000,
            board_attention_needed: false,
            board_flags: [],
            last_updated_at: "2026-01-02T00:00:00.000Z",
          },
        ],
      }),
    ).toContain("## Acme (company-1)");
  });
});
