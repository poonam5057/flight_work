const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const { createUser } = require('./createUser');
const {
  createTestManagementCompany,
} = require('./createTestManagementCompany');
const { addTripIdentifier } = require('./addTripIdentifier');
const { notifyManagers } = require('./notifyManagers');
const {
  setUserIdentifier,
  setManagementCompanyIdentifier,
} = require('./setAccountIdentifier');
const { onTripChange } = require('./onTripChange');

exports.createUser = functions.https.onCall(createUser);
exports.createTestManagementCompany = functions.https.onCall(
  createTestManagementCompany,
);
exports.notifyManagers = functions.https.onCall(notifyManagers);
exports.onCreateTrip = functions.firestore
  .document('/managementCompanies/{company}/trips/{trip}')
  .onCreate(addTripIdentifier);
exports.onChangeTrip = functions.firestore
  .document('/managementCompanies/{company}/trips/{trip}')
  .onUpdate(onTripChange);
exports.setUserIdentifier = functions.firestore
  .document('/users/{uid}')
  .onCreate(setUserIdentifier);
exports.setManagementCompanyIdentifier = functions.firestore
  .document('/managementCompanies/{uid}')
  .onCreate(setManagementCompanyIdentifier);
