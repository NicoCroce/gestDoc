import { ICertificate } from './Certificate.interfaces';

export class Certificate {
  constructor(
    private readonly id: number,
    private readonly startDate: Date,
    private readonly endDate: Date,
    private readonly reason: string,
    private readonly type: string,
    private readonly files: string[],
  ) {}

  static create({ id, startDate, endDate, reason, type, files }: ICertificate) {
    return new Certificate(id, startDate, endDate, reason, type, files);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this.id,
      startDate: this.startDate,
      endDate: this.endDate,
      reason: this.reason,
      type: this.type,
      files: this.files,
    };
  }
}
