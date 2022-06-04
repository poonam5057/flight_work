import app, { FirestoreFieldValue } from './app';
import firebase from 'firebase/app';

export * from './react-hooks';
export * from './notifications';

export type DocumentReference = firebase.firestore.DocumentReference;
export type DocumentData = firebase.firestore.DocumentData;
export type DocumentSnapshot = firebase.firestore.DocumentSnapshot;
export type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot;
export type SnapshotOptions = firebase.firestore.SnapshotOptions;
export type Query = firebase.firestore.Query;
export type FirestoreError = firebase.firestore.FirestoreError;

/** @type firebase.app.App */
const defaultExport = app;
export default defaultExport;
export const FieldValue = FirestoreFieldValue;
export const EmailAuthProvider = firebase.auth.EmailAuthProvider;
export const Timestamp = firebase.firestore.Timestamp;

export const getUid = () => defaultExport.auth().currentUser?.uid;
