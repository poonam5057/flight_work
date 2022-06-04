/**
 * @file
 * Web linking configuration
 * Configuring Linking: https://reactnavigation.org/docs/configuring-links
 *
 * @format
 * @flow strict-local
 */

const linking = {
  prefixes: [
    'flightapp://',
    'io.ensembleapps.flightapp://',
    'https://flightworks-dev.web.app/',
    'http://localhost',
  ],

  config: {
    screens: {
      Main: {
        path: '',
        initialRouteName: 'Trips',
        screens: {
          Trips: 'Trips',
          Trip: {
            path: 'Trip/:documentPath',
            stringify: {
              documentPath: tripPathToUrl,
              title: () => undefined,
            },
            parse: {
              documentPath: urlToTripPath,
            },
          },
          'Trip Builder': {
            path: 'Draft/:documentPath?',
            stringify: {
              documentPath: tripPathToUrl,
              title: () => undefined,
            },
            parse: {
              documentPath: urlToTripPath,
            },
          },
          Aircraft: 'Aircraft',
          'Aircraft Details': {
            path: 'Aircraft/:documentPath',
            stringify: {
              documentPath: tripPathToUrl,
            },
          },
          Owners: 'Owners',
          Pilots: 'Pilots',
          'Account Requests': 'Account-Requests',
          Settings: 'Settings',
          'Archived Trips': 'Archived/Trips',
        },
      },
      Terms: 'Terms',
      Privacy: 'Privacy',
    },
  },
};

const re = /managementCompanies\/(?<mc>.+)\/trips\/(?<trip>.+)$/;

function tripPathToUrl(path) {
  const res = re.exec(path);

  if (res?.length === 3) {
    const [, mc, trip] = res;
    return `${mc}-${trip}`;
  }

  return path;
}

function urlToTripPath(id) {
  const [mc, trip] = id.split('-');
  if (mc && trip) {
    return `managementCompanies/${mc}/trips/${trip}`;
  }

  return id;
}

export default linking;
