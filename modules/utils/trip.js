import { rawTimeZones } from '@vvo/tzdb';
import { DateTime } from 'luxon';
import _ from 'lodash';
import { createDraft, getUserData } from '@appUtils/api';
import tripConverter, { TripState, OwnerState } from './tripConverter';

export const saveTrip = async (payload, doc) => {
  if (!doc) {
    const { id, firstName, lastName, phoneNumber } = await getUserData();

    doc = await createDraft({
      state: TripState.OWNER_DRAFT,
      owner: {
        id,
        firstName,
        lastName,
        phoneNumber,
        state: OwnerState.OWNER_DRAFT,
      },
      archived: false,
    });
  }

  const { legs, ...rest } = payload;
  rest.legs = legs?.map(setDepartureDate);
  const data = tripConverter.toFirestore(rest);

  await doc.update(data);
  return doc;
};

const setDepartureDate = leg => {
  const { date, time, timeZone, ...rest } = leg;
  const zone = rawTimeZones.find(
    tz => tz.countryCode === 'US' && tz.abbreviation === timeZone,
  );

  const departureDate = DateTime.fromJSDate(leg.date)
    .setZone(zone?.name ?? 'local')
    .set({ hour: time.getHours(), minute: time.getMinutes(), second: 0 });

  return {
    ...rest,
    departureDate: departureDate,
  };
};
