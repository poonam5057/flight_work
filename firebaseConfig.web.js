/**
 * @file
 * This is the firebase connection configuration for Web
 */

module.exports = function getConfig(env) {
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  switch (env) {
    case 'dev':
      return {
        apiKey: 'AIzaSyBxsrBEBZ1ukIlfIl3xFOfG0lA9A8vjm8k',
        authDomain: 'flightworks-dev.firebaseapp.com',
        projectId: 'flightworks-dev',
        storageBucket: 'flightworks-dev.appspot.com',
        messagingSenderId: '449517905574',
        appId: '1:449517905574:web:bdd698d2190afe2857f667',
        measurementId: 'G-R1C2JSH0N5',
      };
    case 'staging':
      return {
        apiKey: 'AIzaSyB2BArvxdlLxG-JlRt1dqayrlAuRqb6vLw',
        authDomain: 'flightapp-staging.firebaseapp.com',
        projectId: 'flightapp-staging',
        storageBucket: 'flightapp-staging.appspot.com',
        messagingSenderId: '834260486250',
        appId: '1:834260486250:web:f879572251cfa9c191a213',
        measurementId: 'G-2EP7FKMB7S',
      };
    case 'prod':
      return {
        apiKey: 'AIzaSyB1xxuduSBDEs8uyoAAqwtVinBFGmgJdRs',
        authDomain: 'flightapp-prod.firebaseapp.com',
        projectId: 'flightapp-prod',
        storageBucket: 'flightapp-prod.appspot.com',
        messagingSenderId: '815930620185',
        appId: '1:815930620185:web:12bc525bcf3db931bfad88',
        measurementId: 'G-T4SMGFQKRX',
      };
    default:
      throw new Error(`Unexpected env param: ${env}`);
  }
};
