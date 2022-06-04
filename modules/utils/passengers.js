import { getMyUserDoc, getUserData } from './api';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

/**
 * Edit a single passenger stored in an owner's user document
 * @param {Object} old old version of the passenger
 * @param {Object} new new version of the passenger
 * @param {string} [uid] (optional) uid for the owner, defaults to current user
 */
export const editPassenger = async (
  old,
  { phone, firstName, lastName, email },
  uid,
) => {
  const user = await getUserData(uid);
  const passengers = user?.passengers ?? [];
  const currentPassengerIndex = passengers.findIndex(p => p.name === old.name);

  const updatedPassenger = {
    name: `${firstName} ${lastName}`,
    email,
    ...(Boolean(phone) && {
      phoneNumber: parsePhoneNumberFromString(phone, 'US').number,
    }),
  };

  if (currentPassengerIndex > -1) {
    passengers[currentPassengerIndex] = updatedPassenger;
  } else {
    passengers.push(updatedPassenger);
  }

  await saveOwnerPassengers(passengers, uid);
};

/**
 * Removes a single passenger from an owner's user document
 * @param {Object} currentPassenger complete passenger object
 * @param {string} [uid] (optional) uid for the owner, defaults to current user
 */
export const removePassenger = async (currentPassenger, uid) => {
  const user = await getUserData(uid);
  const existingPassengers = user?.passengers ?? [];

  const passengers = existingPassengers.filter(
    p => p.name !== currentPassenger.name,
  );

  await saveOwnerPassengers(passengers, uid);
};

/**
 * Save all the passengers for an owner
 * @param {Object[]} passengers all the passenger records
 */
export const saveOwnerPassengers = async passengers => {
  const userRef = getMyUserDoc();
  await userRef.update({ passengers });
};
