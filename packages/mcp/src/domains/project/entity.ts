import type { ProjectSnapshot } from "./types.js";

export class Project {
  constructor(private readonly snapshot: ProjectSnapshot) {}

  static fromSnapshot(snapshot: ProjectSnapshot): Project {
    return new Project(snapshot);
  }

  toSnapshot(): ProjectSnapshot {
    return this.snapshot;
  }
}
