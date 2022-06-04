import { getUid } from '@appFirebase';
import { useUserAircraft } from '@appUtils/aircraft';
import { UserRole } from '@appUtils/tripConverter';

export const useExistingAircraft = () =>
  useUserAircraft({ id: getUid(), role: UserRole.OWNER });
