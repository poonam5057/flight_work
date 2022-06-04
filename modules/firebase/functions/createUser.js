/*
  This file is for creating new user accounts.
  Creating an account requests access to the management company that should govern the user
*/

const admin = require('firebase-admin');
const { handleResult } = require('./resultUtils');

exports.createUser = input => handleResult(run(input));

async function run(input) {
  const data = await validateInput(input);
  const user = await createAccount(data);

  if (data.companyDoc) {
    await handleAccountRequest(user, data.companyDoc);
  }
}

async function validateInput(input) {
  REQUIRED_FIELDS.forEach(field => {
    if (!input[field]) {
      throw new Error(`Missing required field: "${field}"`);
    }
  });

  if (USER_ROLES.includes(input.role) === false) {
    throw new Error(`Unsupported user role: "${input.role}"`);
  }

  if (input.signUpCode) {
    const companySnap = await admin
      .firestore()
      .collection('managementCompanies')
      .where('identifier', '==', input.signUpCode.toUpperCase())
      .limit(1)
      .get();

    if (companySnap.empty) {
      throw new Error('The sign up code is not matching any company');
    }

    const companyDoc = companySnap.docs[0].ref;
    return { ...input, companyDoc };
  }

  return input;
}

async function createAccount(data) {
  const { email, phoneNumber, password, firstName, lastName, role } = data;

  const newUser = await admin.auth().createUser({
    email,
    phoneNumber,
    password,
    displayName: firstName,
  });

  const accountInfo = { firstName, lastName, role, phoneNumber, email };
  const dateCreated = admin.firestore.FieldValue.serverTimestamp();

  await admin
    .firestore()
    .collection('users')
    .doc(newUser.uid)
    .create({
      ...accountInfo,
      dateCreated,
      dateUpdated: dateCreated,
    });

  console.info('Created User with uid ' + newUser.uid);
  return { ...accountInfo, uid: newUser.uid };
}

async function handleAccountRequest(account, companyDoc) {
  const accountRequests = companyDoc.collection('accountRequests');
  const existingRequest = await accountRequests.doc(account.uid).get();

  if (existingRequest.exists) {
    console.info('User already requested access to this company, skipping');
    return Promise.resolve();
  }

  return accountRequests.doc().create({ ...account, state: 'New Request' });
}

const REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'password',
  'role',
];

const USER_ROLES = ['pilot', 'employee', 'manager', 'owner'];
