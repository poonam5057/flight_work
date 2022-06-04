/**
 * @file
 * Controller for cloud file storage interaction and sync
 */
import FS from 'react-native-fs';

import { deleteFile, getLocalPath } from '../utils/file';

export default class FileStore {

  /**
   * @param {FirebaseApp} firebase
   */
  constructor (firebase) {
    this.storage = firebase.storage();
    this.queue = new Map();
    this.batchStarted = false;
  }

  /**
   * Tries to synchronize changes between local and remote files for the given trip
   * @param {TripModel} trip
   */
  trySyncTripFiles(trip) {
    this.addToQueue(this.trySyncPhoto, trip.images);
    this.runNextBatch();
  }

  /**
   * Tries to delete the trip files locally and remotely
   * @param {TripModel} trip
   */
  deleteTripFiles(trip) {
    const actionHandler = file => deleteFile(this.storage.ref(file.relativePath));

    this.addToQueue(actionHandler, trip.images);
    this.runNextBatch();
  }

  addToQueue(actionHandler, files) {
    files.forEach((file) => {
      const id = file.relativePath;
      if (this.queue.has(id)) return;
      this.queue.set(id, { file, actionHandler });
    });
  }

  runNextBatch() {
    if (this.batchStarted) return;
    if (this.queue.size === 0) return;

    this.batchStarted = true;
    const current = Array.from(this.queue.values()).slice(0, BATCH_SIZE);
    const tasks = current.map(({ file, actionHandler }) => {
      return actionHandler.call(this, file)
                          .finally(() => this.queue.delete(file.relativePath));
    });

    Promise.all(tasks)
      .then(() => {
        this.batchStarted = false;
        this.runNextBatch();
      })
      .finally(() => this.batchStarted = false);
  }

  /**
   * This method will test for changes between the local and remote data about this photo
   * and will sync if necessary
   * @param {AppImage} file
   * @returns {Promise<void>}
   */
  async trySyncPhoto(file) {
    const storageRef = this.storage.ref(file.relativePath);
    const localDestination = getLocalPath(file.relativePath);

    const availableLocally = await FS.exists(localDestination);
    const availableRemotely = await storageRef.getMetadata().catch(handleMetaError);

    if (!availableLocally && !availableRemotely) throw new Error(`Unexpected - The file at "${file.relativePath}" is missing both locally and remotely`);

    if (!availableLocally) {
      console.info(`"${file.relativePath}" is missing locally - downloading`);
      await storageRef.writeToFile(localDestination);
    }

    if (!availableRemotely) {
      console.info(`"${file.relativePath}" is missing remotely - uploading`);
      await storageRef.putFile(localDestination);
    }
  }
}

const BATCH_SIZE = 15;

const handleMetaError = error => {
  if (error.code === 'storage/object-not-found') return null;
  if (/no such file/gi.test(error.message)) return null;

  throw error;
};
