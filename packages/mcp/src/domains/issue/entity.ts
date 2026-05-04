import type { IssueSnapshot } from "./types.js";

export class Issue {
  constructor(private readonly snapshot: IssueSnapshot) {}

  static fromSnapshot(snapshot: IssueSnapshot): Issue {
    return new Issue(snapshot);
  }

  toSnapshot(): IssueSnapshot {
    return this.snapshot;
  }

  isBlocked(): boolean {
    return this.snapshot.blockerUnresolvedCount > 0;
  }
}
