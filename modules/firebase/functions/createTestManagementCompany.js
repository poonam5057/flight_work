/*
  This file is for creating a management company document in order to validate the
  setManagementCompanyIdentifer functionality. Setting up actual Management Company
  accounts will be handled in a different ticket.
*/

const admin = require('firebase-admin');
const app = admin.app();

exports.createTestManagementCompany =
  async function createTestManagementCompany(data, context) {
    const timestamp = Date.now();
    const managementCompanyData = {
      name: 'Test ' + timestamp,
    };

    try {
      await app
        .firestore()
        .collection('managementCompanies')
        .add(managementCompanyData);
      console.log('Created Management Company with timestamp ' + timestamp);
    } catch (e) {
      console.log('Transaction failure: ', e);
    }
};
