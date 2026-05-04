import type { RoutineService } from "../../domains/routine/service.js";
import type { Result } from "../../shared/api/errors.js";
import type {
  PaperclipRoutine,
  PaperclipRoutineRun,
  PaperclipRoutineSchedule,
} from "../../types.js";

export class RoutineApplicationService {
  constructor(private readonly routineService: RoutineService) {}

  async listRoutines(companyId: string): Promise<Result<PaperclipRoutine[]>> {
    const result = await this.routineService.listRoutines(companyId);
    if (!result.ok) {
      return result as Result<PaperclipRoutine[]>;
    }
    return { ok: true, value: result.value.map((routine) => routine.toSnapshot().raw) };
  }

  async getRoutine(companyId: string, routineId: string): Promise<Result<PaperclipRoutine>> {
    const result = await this.routineService.getRoutine(companyId, routineId);
    if (!result.ok) {
      return result as Result<PaperclipRoutine>;
    }
    return { ok: true, value: result.value.toSnapshot().raw };
  }

  async listRoutineRuns(
    companyId: string,
    routineId: string,
  ): Promise<Result<PaperclipRoutineRun[]>> {
    const result = await this.routineService.listRoutineRuns(companyId, routineId);
    if (!result.ok) {
      return result as Result<PaperclipRoutineRun[]>;
    }
    return { ok: true, value: result.value.map((run) => run.toSnapshot().raw) };
  }

  async getRoutineRun(companyId: string, runId: string): Promise<Result<PaperclipRoutineRun>> {
    const result = await this.routineService.getRoutineRun(companyId, runId);
    if (!result.ok) {
      return result as Result<PaperclipRoutineRun>;
    }
    return { ok: true, value: result.value.toSnapshot().raw };
  }

  async listFailedRoutineRuns(companyId: string): Promise<Result<PaperclipRoutineRun[]>> {
    const result = await this.routineService.listFailedRoutineRuns(companyId);
    if (!result.ok) {
      return result as Result<PaperclipRoutineRun[]>;
    }
    return { ok: true, value: result.value.map((run) => run.toSnapshot().raw) };
  }

  async getRoutineSchedule(
    companyId: string,
    routineId: string,
  ): Promise<Result<PaperclipRoutineSchedule>> {
    const result = await this.routineService.getRoutineSchedule(companyId, routineId);
    if (!result.ok) {
      return result as Result<PaperclipRoutineSchedule>;
    }
    return { ok: true, value: result.value.toSnapshot().raw };
  }
}
