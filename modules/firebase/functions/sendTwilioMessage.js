/*
  This file is for sending Twilio text messages.
*/

const admin = require('firebase-admin');
const app = admin.app();

exports.sendTwilioMessage = async function sendTwilioMessage(data, context) {
  try {
    await app.firestore().collection('twilioMessages').add(data);
    console.log('Twilio Message sent to ' + data.to);
  } catch (e) {
    console.error('Failure sending Twilio Message: ', e);
  }
};
