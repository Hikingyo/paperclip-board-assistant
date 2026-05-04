import type { Result } from "../../shared/api/errors.js";
import type { Routine, RoutineRun, RoutineSchedule } from "./entity.js";

export interface RoutineRepository {
  findAllByCompanyId(companyId: string): Promise<Result<Routine[]>>;
  findById(companyId: string, routineId: string): Promise<Result<Routine>>;
  findRunsByRoutineId(companyId: string, routineId: string): Promise<Result<RoutineRun[]>>;
  findRunById(companyId: string, runId: string): Promise<Result<RoutineRun>>;
  findFailedRuns(companyId: string): Promise<Result<RoutineRun[]>>;
  findSchedule(companyId: string, routineId: string): Promise<Result<RoutineSchedule>>;
}
