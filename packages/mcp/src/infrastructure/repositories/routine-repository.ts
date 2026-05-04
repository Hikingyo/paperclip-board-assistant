import type { Routine, RoutineRun, RoutineSchedule } from "../../domains/routine/entity.js";
import {
  toRoutineDomainList,
  toRoutineRunDomain,
  toRoutineRunDomainList,
  toRoutineScheduleDomain,
} from "../../domains/routine/mapper.js";
import type { RoutineRepository } from "../../domains/routine/repository.js";
import type { PaperclipApiClient } from "../../shared/api/client.js";
import { API_ERROR_CODES, PaperclipApiError, type Result } from "../../shared/api/errors.js";
import { ApiPaths } from "../../shared/api/paths.js";
import type { PaperclipIssue, PaperclipRoutineSchedule } from "../../types.js";

export class PaperclipRoutineRepository implements RoutineRepository {
  constructor(private readonly client: PaperclipApiClient) {}

  async findAllByCompanyId(companyId: string): Promise<Result<Routine[]>> {
    const issues = await this.client.get<PaperclipIssue[]>(ApiPaths.issues(companyId));
    if (!issues.ok) {
      return issues as Result<Routine[]>;
    }
    return { ok: true, value: toRoutineDomainList(issues.value) };
  }

  async findById(companyId: string, routineId: string): Promise<Result<Routine>> {
    const routines = await this.findAllByCompanyId(companyId);
    if (!routines.ok) {
      return routines as Result<Routine>;
    }
    const routine = routines.value.find((item) => item.toSnapshot().id === routineId);
    if (!routine) {
      return {
        ok: false,
        error: new PaperclipApiError(
          `Routine ${routineId} not found in company ${companyId}.`,
          API_ERROR_CODES.NOT_FOUND,
          404,
        ),
      };
    }
    return { ok: true, value: routine };
  }

  async findRunsByRoutineId(companyId: string, routineId: string): Promise<Result<RoutineRun[]>> {
    const issues = await this.client.get<PaperclipIssue[]>(
      ApiPaths.issues(companyId, { status: "done" }),
    );
    if (!issues.ok) {
      return issues as Result<RoutineRun[]>;
    }
    return { ok: true, value: toRoutineRunDomainList(issues.value.slice(0, 10), routineId) };
  }

  async findRunById(companyId: string, runId: string): Promise<Result<RoutineRun>> {
    const issue = await this.client.get<PaperclipIssue>(ApiPaths.issue(companyId, runId));
    if (!issue.ok) {
      return issue as Result<RoutineRun>;
    }
    return { ok: true, value: toRoutineRunDomain(issue.value, "unknown") };
  }

  async findFailedRuns(companyId: string): Promise<Result<RoutineRun[]>> {
    const issues = await this.client.get<PaperclipIssue[]>(
      ApiPaths.issues(companyId, { status: "blocked,cancelled" }),
    );
    if (!issues.ok) {
      return issues as Result<RoutineRun[]>;
    }
    return { ok: true, value: toRoutineRunDomainList(issues.value, "unknown") };
  }

  async findSchedule(_companyId: string, routineId: string): Promise<Result<RoutineSchedule>> {
    const schedule: PaperclipRoutineSchedule = {
      nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      frequency: "daily",
    };
    return { ok: true, value: toRoutineScheduleDomain(routineId, schedule) };
  }
}
