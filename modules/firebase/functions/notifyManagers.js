/*
  This file is for sending Twilio text messages to Management Company employees
  so they can be aware of changes coming in.
*/

const admin = require('firebase-admin');
const app = admin.app();
const _ = require('lodash');

exports.notifyManagers = async function notifyManagers(data, context) {
  const userDoc = await app
    .firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();
  const userData = userDoc.data();
  const companyDoc = await userData.managementCompany.ref.get();
  const company = companyDoc.data();

  const managers = _.filter(
    company?.users,
    user =>
      _.includes(user.roles, 'manager') || _.includes(user.roles, 'employee'),
  );

  managers.forEach(async manager => {
    if (!manager.phoneNumber || manager.phoneNumber === '+15055555555') {
      return;
    }

    const messageData = {
      to: manager.phoneNumber,
      body: data.messageBody,
    };
    try {
      await app.firestore().collection('twilioMessages').add(messageData);
      console.log('Twilio Message sent to ' + manager.phoneNumber);
    } catch (e) {
      console.error('Failure sending Twilio Message: ', e);
    }
  });
};
