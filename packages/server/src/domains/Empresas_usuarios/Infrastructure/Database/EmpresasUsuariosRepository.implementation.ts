import { IEmpresasUsuariosRepository } from '../../Domain/EmpresasUsuarios.repository';
import { EmpresaUsuario } from '../../Domain/EmpresasUsuarios.entity';
import { EmpresasUsuariosModel } from './EmpresasUsuarios.model';
import { OwnersysModel } from '@server/domains/Ownersyss/Infrastructure/Database/Ownersys.model';

export class EmpresasUsuariosRepositoryImplementation implements IEmpresasUsuariosRepository {
  async findByUsuario(userId: number): Promise<EmpresaUsuario[]> {
    const rows = await EmpresasUsuariosModel.findAll({
      where: { id_usuario: userId },
      include: [
        {
          model: OwnersysModel,
          as: 'Empresa',
          attributes: ['id', 'razon_social', 'cuit', 'logo'],
        },
      ],
    });

    return rows.map((row) =>
      EmpresaUsuario.create({
        id: row.id,
        id_empresa: row.id_empresa,
        id_usuario: row.id_usuario,
        razon_social: row.Empresa?.razon_social,
        cuit: row.Empresa?.cuit,
        logo: row.Empresa?.logo ?? null,
      }),
    );
  }
}
