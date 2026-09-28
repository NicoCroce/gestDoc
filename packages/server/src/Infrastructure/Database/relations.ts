import { relatePermissions } from '@server/domains/Permissions/Infrastructure/Database/Relations';
import { relateUsers } from '@server/domains/Users/Infrastructure/Database/Relations';
import { relateUserprofiles } from '@server/domains/Userprofiles/Infrastructure/Database/Relations';
import { relateDisclaimer } from '@server/domains/Disclaimer/Infrastructure/Database/Relations';
import { relateSegments } from '@server/domains/Segments/Infrastructure/Database/Relations';

export const relateModels = () => {
  relateUsers();
  relatePermissions();
  relateUserprofiles();
  relateDisclaimer();
  relateSegments();
};
