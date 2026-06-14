import { IEmpresaUsuario } from './EmpresasUsuarios.types';

export class EmpresaUsuario {
  constructor(
    protected readonly _id_empresa: number,
    protected readonly _id_usuario: number,
    protected readonly _id?: number,
    protected readonly _razon_social?: string,
    protected readonly _cuit?: number,
    protected readonly _logo?: string | null,
  ) {}

  static create(props: IEmpresaUsuario): EmpresaUsuario {
    return new EmpresaUsuario(
      props.id_empresa,
      props.id_usuario,
      props.id,
      props.razon_social,
      props.cuit,
      props.logo,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      id_empresa: this._id_empresa,
      id_usuario: this._id_usuario,
      razon_social: this._razon_social,
      cuit: this._cuit,
      logo: this._logo,
    };
  }
}
