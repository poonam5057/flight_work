const admin = require('firebase-admin');
const app = admin.app();
const { generateIdentifier } = require('./identifierUtils');

const setAccountIdentifier = (collection, document, prefix = '') =>
  app.firestore().runTransaction(async t => {
    let identifier;
    let snapshot;

    do {
      identifier = `${prefix}${generateIdentifier()}`;
      snapshot = await t.get(collection.where('identifier', '==', identifier));
    } while (!snapshot.empty);

    console.log(`Setting identifier "${identifier}" to ${document.path}`);
    t.update(document, { identifier });
  });

exports.setUserIdentifier = async function setUserIdentifier(data, context) {
  const usersRef = app.firestore().collection('users');
  const uid = context.params.uid;
  const userDocRef = app.firestore().collection('users').doc(uid);

  await setAccountIdentifier(usersRef, userDocRef, 'U');
};

exports.setManagementCompanyIdentifier =
  async function setManagementCompanyIdentifier(data, context) {
    const managementCompaniesRef = app
      .firestore()
      .collection('managementCompanies');
    const uid = context.params.uid;
    const managementCompanyDocRef = app
      .firestore()
      .collection('managementCompanies')
      .doc(uid);

    await setAccountIdentifier(
      managementCompaniesRef,
      managementCompanyDocRef,
      'C',
    );
  };
