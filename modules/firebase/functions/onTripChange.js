const _ = require('lodash');
const admin = require('firebase-admin');

// Enable this if you need to see more logging: https://firebase.google.com/docs/functions/config-env
const IS_DEBUG = process.env.DEBUG_CLOUD_FUNCTIONS === 'true';
console.info('Debug logs enabled: ', IS_DEBUG);

// A change in any of these fields is worthy of notification
const MEANINGFUL_CHANGE_PATHS = [
  'owner',
  'pilots',
  'legs',
  'aircraft',
  'state',
  'customName',
  'notes',
  'archived',
];

async function onTripChange(change, context) {
  const prevValue = change.before.data();
  const newValue = change.after.data();

  console.info('Trip changed', newValue.identifier);
  if (hasChanged(prevValue, newValue, MEANINGFUL_CHANGE_PATHS) === false) {
    console.info('Skipping notifications because the change is not worthy');
    return Promise.resolve();
  }

  const updatedBy = await getUserMakingTheChange(newValue.updatedBy);
  debug('Updated by: ', updatedBy);

  if (updatedBy?.role !== 'manager') {
    console.info('Skipping notifications for change not made by a Manager');
    return Promise.resolve();
  }

  const tokens = await getNotificationDataByToken(prevValue, newValue);
  if (_.isEmpty(tokens)) {
    console.info('No one on the trip qualifies for a notification');
    return Promise.resolve();
  }

  return sendNotifications(tokens, newValue, context.resource.name).catch(
    console.error,
  );
}

async function getUserMakingTheChange(uid) {
  const snap = await getUser(uid);
  return snap.data();
}

async function sendNotifications(tokens, trip, resourceName) {
  const name = trip.customName || trip.identifier || '-';
  const from = _.head(trip.legs)?.from || '-';
  const to = _.last(trip.legs)?.to || '-';
  const documentPath = /managementCompanies\/.+$/.exec(resourceName).pop();

  const messages = tokens.map(({ title, token }) => ({
    token,
    data: {
      type: 'trip-update',
      documentPath,
    },
    notification: {
      title,
      body: `${title}: ${name} from ${from} to ${to}`,
    },
    apns: {
      headers: {
        'apns-collapse-id': documentPath.split('/').pop(),
      },
      payload: {
        aps: {
          sound: 'default',
          contentAvailable: true,
        },
      },
    },
  }));

  debug('Notification messages: ', messages);

  const result = await admin.messaging().sendAll(messages);

  return handleNotificationResponseErrors(tokens, result);
}

async function handleNotificationResponseErrors(tokens, result) {
  if (result.failureCount === 0) {
    return Promise.resolve();
  }

  const batch = admin.firestore().batch();

  result.responses.forEach((response, i) => {
    debug('Notification result: ', response);
    const error = response.error;

    if (error) {
      console.error(error);

      if (error.code === 'messaging/registration-token-not-registered') {
        const { token, uid } = tokens[i];

        // We clean up outdated tokens. Newer tokens are automatically registered if the user is still using App
        console.info('Deleting outdated user token: ', { token, uid });
        batch.update(
          admin.firestore().collection('users').doc(uid),
          'notificationTokens',
          admin.firestore.FieldValue.arrayRemove(token),
        );
      }
    }
  });

  if (batch.isEmpty) {
    return Promise.resolve();
  }

  return batch.commit();
}

async function getNotificationDataByToken(tripBefore, tripAfter) {
  const list = [];

  const oldUsers = createUsersMap(tripBefore);
  const newUsers = createUsersMap(tripAfter);

  await Promise.all(
    Array.from(newUsers.values()).map(async ({ id, state }) => {
      const oldUser = oldUsers.get(id);
      const isStateChanged = oldUser?.state !== state;
      const hasSeenChanges = ['Accepted', 'Seen'].includes(state);
      debug('old vs new state', [oldUser?.state, state]);

      // We want to ping users only when there's something they haven't seen
      // If there's already something unseen or action pending we skip notifying them
      if (!isStateChanged && !hasSeenChanges) {
        console.info(`Skip notifying user: ${id} - already notified once`);
        return;
      }

      const tokens = await getUserTokens(id);
      const title = getNotificationTitle(state);

      if (_.isEmpty(tokens)) {
        console.info(`Skip notifying user: ${id} - no notification tokens`);
        return;
      }

      tokens.forEach(token => list.push({ token, id, title }));
    }),
  );

  // When a user is using both a pilot and an owner account on the same device the token would be the same for both
  // It can result in 2 push notifications unless we filter out duplicate tokens
  return _.uniqBy(list, 'token');
}

async function getUserTokens(uid) {
  const snap = await getUser(uid);
  return snap.get('notificationTokens');
}

const getNotificationTitle = state => {
  switch (state) {
    case 'Manager Requested':
      return 'New Trip';
    case 'Acknowledged':
      return 'Trip Acknowledged';
    default:
      return 'Updated Trip';
  }
};

function hasChanged(a, b, paths) {
  const hasChange = _.some(
    paths,
    path => _.isEqual(_.get(a, path), _.get(b, path)) === false,
  );

  debug('hasChanged: ', { hasChange, paths });
  debug('Object A', a);
  debug('Object B', b);

  return hasChange;
}

const getUser = uid => admin.firestore().collection('users').doc(uid).get();

const createUsersMap = trip =>
  new Map(
    [trip.owner, ...(trip.pilots || [])]
      .filter(Boolean)
      .map(user => [user.id, user]),
  );

const debug = IS_DEBUG
  ? function debugValue(message, value = '') {
      console.debug(message, _.isObject(value) ? JSON.stringify(value) : value);
    }
  : _.noop;

exports.onTripChange = onTripChange;
