import { ICertificate } from './Certificate.interfaces';
import { CertificateTypes } from './CertificateTypes.entity';

export class Certificate {
  constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date,
    private readonly _reason: string,
    private readonly _type: CertificateTypes,
    private readonly _files?: string[],
    private readonly _id?: number,
  ) {}

  static create({ id, startDate, endDate, reason, type, files }: ICertificate) {
    const typeInstance = CertificateTypes.create({
      id: type.values.id,
      name: type.values.name,
    });
    return new Certificate(startDate, endDate, reason, typeInstance, files, id);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      startDate: this._startDate,
      endDate: this._endDate,
      reason: this._reason,
      type: this._type,
      files: this._files,
    };
  }

  get type() {
    return this._type.values.name;
  }
}
