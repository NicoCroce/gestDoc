import { IDocumentType } from './DocumentType.interfaces';

export class DocumentType {
  constructor(
    private readonly id: number,
    private readonly denomination: string,
    private readonly signRequired: boolean,
  ) {}

  static create({
    id,
    denomination,
    signRequired,
  }: IDocumentType): DocumentType {
    return new DocumentType(id, denomination, signRequired);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this.id,
      denominacion: this.denomination,
      signRequired: this.signRequired,
    };
  }
}
