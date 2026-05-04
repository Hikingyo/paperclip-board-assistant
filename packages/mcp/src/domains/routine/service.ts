import type { Result } from "../../shared/api/errors.js";
import type { Routine, RoutineRun, RoutineSchedule } from "./entity.js";
import type { RoutineRepository } from "./repository.js";

export class RoutineService {
  constructor(private readonly routineRepository: RoutineRepository) {}

  listRoutines(companyId: string): Promise<Result<Routine[]>> {
    return this.routineRepository.findAllByCompanyId(companyId);
  }

  getRoutine(companyId: string, routineId: string): Promise<Result<Routine>> {
    return this.routineRepository.findById(companyId, routineId);
  }

  listRoutineRuns(companyId: string, routineId: string): Promise<Result<RoutineRun[]>> {
    return this.routineRepository.findRunsByRoutineId(companyId, routineId);
  }

  getRoutineRun(companyId: string, runId: string): Promise<Result<RoutineRun>> {
    return this.routineRepository.findRunById(companyId, runId);
  }

  listFailedRoutineRuns(companyId: string): Promise<Result<RoutineRun[]>> {
    return this.routineRepository.findFailedRuns(companyId);
  }

  getRoutineSchedule(companyId: string, routineId: string): Promise<Result<RoutineSchedule>> {
    return this.routineRepository.findSchedule(companyId, routineId);
  }
}
