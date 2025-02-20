import { ICertificateTypes } from './Certificate.interfaces';

export class CertificateTypes {
  constructor(
    private readonly id: number,
    private readonly name: string,
    private readonly description: string,
  ) {}

  static create({ id, name, description }: ICertificateTypes) {
    return new CertificateTypes(id, name, description);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
    };
  }
}
