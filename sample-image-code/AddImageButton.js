/**
 * @file
 * A button that triggers the picture taking/selection flow
 */

import CameraIcon from '@carbon/icons/svg/32/camera.svg';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Alert, Linking } from 'react-native';
import { Constants, Permissions } from 'react-native-unimodules';

import { MenuButton, PrimaryIcon, RegularText } from './Theme';

export class AddImageButton extends Component {
  render() {
    const { onImageResult, showActionSheetWithOptions, label, disabled, ...rest } = this.props;

    return (
      <MenuButton slim onPress={this.showActionSheet} disabled={disabled} {...rest}>
        <RegularText>{label}</RegularText>
        <PrimaryIcon Icon={CameraIcon} />
      </MenuButton>
    );
  }

  showActionSheet = async () => {
    const options = ['Camera', 'Gallery', 'Cancel'];
    const cancelButtonIndex = 2;
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          this.onOpenCameraOption();
        }
        else if (buttonIndex === 1) {
          this.onOpenGalleryOption();
        }
      },
    );
  };

  onOpenCameraOption = async () => {
    const hasPermissions = await this.getCameraPermissions();
    if (!hasPermissions) {
      this.handleDeniedPermission('Sorry, we need permission to take pictures.');
      return;
    }

    const result = await this.launchCamera();
    this.props.onImageResult(result);
  }

  onOpenGalleryOption = async () => {
    const hasPermissions = await this.getGalleryPermissions();
    if (!hasPermissions) {
      this.handleDeniedPermission('Sorry, we need permission to view your photos.');
      return;
    }

    const result = await this.launchGallery();
    this.props.onImageResult(result);
  }

  handleDeniedPermission = (message) => {
    Alert.alert('Permissions', message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Go To Settings',
        onPress: goToAppSettings,
      },
    ]);
  }

  getCameraPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    return status === 'granted';
  }

  getGalleryPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    return status === 'granted';
  };

  launchCamera = async () => {
    try {
      const { quality } = this.props;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality,
      });

      if (!result.uri) throw new Error('Missing url from camera result');

      return result;
    } catch (e) {
      if (e.message === 'Camera not available on simulator') {
        return { cancelled: false, uri: 'https://image.freepik.com/free-vector/realistic-receipt-template_23-2147938550.jpg' };
      }

      console.error(e);

      if (e.message === 'Missing url from camera result') {
        Alert.alert('Camera', 'Failed to save an image');
      }
      else {
        Alert.alert('Camera', 'Starting the camera failed');
      }

      return { cancelled: true };
    }
  };

  launchGallery = async () => {
    try {
      const { quality } = this.props;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality,
      });

      return result;
    } catch (e) {
      console.error(e);
      Alert.alert('Gallery', 'Starting the gallery failed');
      return { cancelled: true };
    }
  };
}

AddImageButton.propTypes = {
  onImageResult: PropTypes.func.isRequired,
  showActionSheetWithOptions: PropTypes.func.isRequired,
  quality: PropTypes.number,
};

AddImageButton.defaultProps = {
  label: 'Add Image',
  quality: 0,
};

const goToAppSettings = () => {
  if (Constants.platform.ios) return Linking.openURL('app-settings:');

  // Launch Android app settings
  const pkg = Constants.manifest.android.package;

  return IntentLauncher.startActivityAsync(
    IntentLauncher.ACTION_APPLICATION_DETAILS_SETTINGS,
    { data: `package:${pkg}` },
  );
};

// Mock (Android Only) - install and use 'expo-intent-launcher' if needed
const IntentLauncher = {
  startActivityAsync: () => Promise.reject(new Error('Stub module')),
  ACTION_APPLICATION_DETAILS_SETTINGS: 'ACTION_APPLICATION_DETAILS_SETTINGS',
};

const ConnectedAddImageButton = connectActionSheet(AddImageButton);

ConnectedAddImageButton.propTypes = {
  onImageResult: PropTypes.func.isRequired,
  /** @type {number} Range from 0 to 1. 0 for compress for small size, 1  for max quality */
  quality: PropTypes.number,
};

export default ConnectedAddImageButton;
