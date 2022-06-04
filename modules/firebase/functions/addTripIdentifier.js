const admin = require('firebase-admin');
const app = admin.app();

exports.addTripIdentifier = function createTrip(tripSnapshot, context) {
  // Events are delivered at least once, but a single event may result in multiple function invocations
  // So we skip doing anything if the identifier is already been set
  const id = tripSnapshot.get('identifier');
  if (id) {
    console.warn(`This trip already has an ID (${id}) - skipping`);
    return Promise.resolve();
  }

  return app.firestore().runTransaction(async t => {
    const tripsCollection = tripSnapshot.ref.parent;

    const query = await t.get(
      tripsCollection.orderBy('identifier', 'desc').limit(1),
    );

    const lastId = query.docs[0]?.data().identifier ?? 'T00000';
    console.info(`Last id for company ${context.params.company} is: ${lastId}`);
    const nextId = incrementTripIdentifier(lastId);
    console.info('nextId: ', nextId);

    return t.update(tripSnapshot.ref, {
      identifier: nextId,
      dateCreated: new Date(),
    });
  });
};

function incrementTripIdentifier(currentIdentifier, incrementIndex = 4) {
  if (currentIdentifier && currentIdentifier.length === 6) {
    let newIdentifier = currentIdentifier.substring(1);
    let newChar = incrementChar(newIdentifier.charCodeAt(incrementIndex));
    if (newChar === '0') {
      newIdentifier = buildTripIdentifier(newIdentifier, incrementIndex, newChar);
      return incrementTripIdentifier(newIdentifier, incrementIndex - 1);
    }
    if (newChar >= 'A' && newIdentifier.charAt(incrementIndex - 1) >= 'A') {
      newChar = '0';
      newIdentifier = buildTripIdentifier(newIdentifier, incrementIndex, newChar);
      return incrementTripIdentifier(newIdentifier, incrementIndex - 1);
    }
    return buildTripIdentifier(newIdentifier, incrementIndex, newChar);
  }
  return currentIdentifier;
}

function incrementChar(charCode) {
  if (charCode === 57) {
    // next character after '9' is 'A'
    charCode = 65;
  } else if (charCode === 72 || charCode === 78) {
    // skip 'I' and 'O'
    charCode += 2;
  } else if (charCode === 90) {
    // next character after 'Z' is '0'
    charCode = 48;
  } else {
    charCode++;
  }
  return String.fromCharCode(charCode);
}

function buildTripIdentifier(identifier, index, newChar) {
  return (
    'T' +
    identifier.substring(0, index) +
    newChar +
    identifier.substring(index + 1)
  );
}
