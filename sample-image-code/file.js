/**
 * @file
 * File handling helpers
 */

import { differenceWith } from 'ramda';
import * as FS from 'react-native-fs';

import crashlyticsDecorator from './crashlyticsDecorator';

/**
 * Removes deleted images from the local file system and attempts to also remove remote copies (not waited for)
 * Saves any newly added images locally and remotely
 * The remote push operations are not waited for
 * @param {AppImage[]} nextImageList
 * @param {AppImage[]} prevImageList
 * @param {FirebaseStorageTypes.Reference} storageRef
 * @returns {Promise<AppImage[]>}
 */
export const updateImages = async (nextImageList, prevImageList = [], storageRef) => {
  const deleted = differenceWith((a, b) => a.relativePath === b.relativePath, prevImageList, nextImageList);
  await deleteImages(deleted, storageRef);

  const images = await saveImages(nextImageList, storageRef);
  return images;
};

/**
 * Deletes local and remote copies of the given images
 * @param {AppImage[]} images
 * @param {FirebaseStorageTypes.Reference} storageRef
 * @returns {Promise}
 */
export const deleteImages = async (images, storageRef) => {
  const tasks = images.map(image => deleteFile(storageRef.root.child(image.relativePath)));
  return Promise.all(tasks);
};

/**
 * Tries to resolve the image locally if it's available
 * @param {string} relativePath
 * @returns {Promise<string>}
 */
export const resolveLocalPhoto = async (relativePath) => {
  const localPath = getLocalPath(relativePath);
  const isAvailable = await FS.exists(localPath);

  if (isAvailable) return localPath;

  throw new Error('This image is not yet synced locally');
};

/**
 * Saves newly added trip images using {@link saveFile}
 * Skips any images that are already processed and contain a `relativePath` key
 * @param {AppImage[]} images
 * @param {FirebaseStorageTypes.Reference} storageRef
 * @returns {Promise<AppImage[]>} Resolves with a list of images
 */
const saveImages = async (images, storageRef) => {
  const tasks = images.map(async ({ uri, ...image }) => {
    if (image.relativePath) return image;

    const updates = await saveFile(uri, storageRef);

    return {
      ...image,
      ...updates,
    };
  });

  return Promise.all(tasks);
};

/**
 * Use this function to save a local file to our in-app storage
 * And attempt to push it to the cloud
 * It's not critical if the push to the cloud fails so long as we have it saved
 * in our local space - it will get updated at some point
 * @param {string} localUri
 * @param {FirebaseStorageTypes.Reference} storageRef
 * @returns {Promise<{ relativePath: string, name: string }>} Resolves with the relative path to the file
 */
const saveFile = async (localUri, storageRef) => {
  // 1. copy/move to app local space - destFolder
  const name = localUri.split('/').pop();
  const localDir = getLocalPath(storageRef.fullPath);
  const cloudRef = storageRef.child(name);
  const localDestination = getLocalPath(cloudRef.fullPath);

  // Ensure local sub-folder exists
  await FS.mkdir(localDir, { NSURLIsExcludedFromBackupKey: true });

  // Remove any existing file with the same name
  await tryRemoveFile(localDestination);
  await FS.moveFile(localUri, localDestination);

  // 2. push to cloud (but don't wait for it)
  cloudRef.putFile(localDestination)
    .catch(e => {
      console.warn(e.message);
      crashlyticsDecorator.logError(e);
    });

  // 3. return relative path so it can be saved to trip data
  return {
    relativePath: cloudRef.fullPath,
    name: cloudRef.name,
  };
};

/**
 * Deletes a file locally and attempts to delete from the cloud storage
 * @param {FirebaseStorageTypes.Reference} storageRef
 * @returns {Promise<void>}
 */
export const deleteFile = async (storageRef) => {
  console.info('deleteFile: ', storageRef.name);
  const localDestination = getLocalPath(storageRef.fullPath);
  await tryRemoveFile(localDestination);

  // delete from cloud (but don't wait for it)
  storageRef.delete().catch(console.warn);
};

/**
 * Tries to remove the the file if it exists
 * @param {string} filePath
 * @returns {Promise<boolean>} Resolves to `true` when a file was removed
 */
export const tryRemoveFile = async (filePath) => {
  try {
    await FS.unlink(filePath);
    return true;
  }
  catch (e) {
    if (/ENOENT/.test(e.message) === false) throw e;
    return false;
  }
};

/**
 * Gets the local path for the passed relative Path
 * @param {string} relativePath
 * @returns {string}
 */
export const getLocalPath = (relativePath = '') => `${ FS.DocumentDirectoryPath }/${ relativePath }`;

/**
 * @typedef AppImage
 * @property {string} uri
 * @property {string} relativePath
 * @property {string} name
 */
