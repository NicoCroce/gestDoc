import { IDocument } from './Document.interfaces';

export class Document {
  constructor(
    private readonly id: string,
    private readonly uploadDate: Date,
    private readonly title: string,
    private readonly file: unknown,
    private readonly signed: Date | null, // Si fue firmado.
    private readonly view: Date | null, // La fecha en que el usuario lo visualizó.
    private readonly type: string,
    private readonly requireSign: boolean, // Si el documento requiere ser firmado
    private readonly validationSign: string | null, //registra una huella perteneciente al usuario por cuestiones legales.
  ) {}

  static create({
    id,
    uploadDate,
    title,
    file,
    signed,
    view,
    type,
    requireSign,
    validationSign,
  }: IDocument): Document {
    return new Document(
      id,
      uploadDate,
      title,
      file,
      signed,
      view,
      type,
      requireSign,
      validationSign,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this.id,
      uploadDate: this.uploadDate,
      title: this.title,
      file: this.file,
      signed: this.signed,
      view: this.view,
      type: this.type,
      requireSign: this.requireSign,
      validationSign: this.validationSign,
    };
  }
}
