import app from '@appFirebase';

export async function sendTwilioMessage(data) {
  await app.functions().httpsCallable('sendTwilioMessage')(data);
}

export async function notifyManagers(data) {
  await app.functions().httpsCallable('notifyManagers')(data);
}

export async function createTestManagementCompany() {
  await app
    .functions()
    .httpsCallable('createTestManagementCompany')()
    .catch(e => {
      console.log('Transaction error: ' + e);
    });
}
