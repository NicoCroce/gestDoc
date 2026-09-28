import { protectedProcedure } from '@server/Infrastructure';
import { OwnersysService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class OwnersysController {
  constructor(private ownersysService: OwnersysService) {}
  getOwnersys = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID is requerida'))
      .query(
        executeService(
          this.ownersysService.getOwnersys.bind(this.ownersysService),
        ),
      );
  updateTheme = () =>
    protectedProcedure
      .input(z.number())
      .mutation(
        executeService(
          this.ownersysService.updateTheme.bind(this.ownersysService),
        ),
      );

  getOwnerTheme = () =>
    protectedProcedure.query(
      executeService(
        this.ownersysService.getOwnerTheme.bind(this.ownersysService),
      ),
    );
}
