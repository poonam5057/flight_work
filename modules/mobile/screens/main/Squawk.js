import React, { useCallback, useEffect } from 'react';
import MobileView from '../../components/MobileView';
import Button from '@appComponents/Button';
import {
  AircraftDetails,
  SecondaryButton,
  SectionDivider,
} from '../../components/TripData';
import { useForm, useFormState } from 'react-hook-form';
import { View } from 'react-native';
import { TextFormField } from '../../../components/forms/FormFields';
import AuthLayout from '../auth/AuthLayout';
import HeaderLeft from '../../components/HeaderLeft';
import { useTrip, useMyData } from '@appUtils/api';
import { UserRole } from '@appUtils/tripConverter';
import { Menu, MenuItem, useMenuState } from '@appComponents/Menu';
import { Spacer } from '@appComponents/ScreenLayout';
import { ImageViewer } from '@appComponents/ImageViewer';
import { createSquawk, updateSquawk, deleteSquawk } from '@appUtils/squawks';
import _ from 'lodash';

const menuStyle = { backgroundColor: '#ffffff' };

const useSquawkHeaderRight = ({
  navigation,
  isEditable,
  isSubmitting,
  submit,
  userRole,
  squawk,
}) => {
  const { anchorEl, isOpen, open, close } = useMenuState();
  useEffect(() => {
    const handleEdit = () => {
      navigation.navigate('Squawk', { action: 'EDIT', squawk });
    };

    const handleDelete = async () => {
      if (squawk) {
        await deleteSquawk(squawk.path);
        navigation.goBack();
      } else {
        alert('should delete squawk');
      }
    };

    const saveButton = (
      <Button loading={isSubmitting} mode="text" onPress={submit}>
        Save
      </Button>
    );

    const kebabOptions = (
      <>
        <Button onPress={open} icon="ellipsis-vertical" mode="text" />
        <Menu
          anchor={anchorEl}
          visible={isOpen}
          onDismiss={close}
          contentStyle={menuStyle}>
          <MenuItem title="Edit Squawk" onPress={handleEdit} />
          <MenuItem title="Delete Squawk" onPress={handleDelete} />
        </Menu>
      </>
    );

    const params = {
      headerRight: () => {
        if (isEditable) {
          return saveButton;
        } else {
          return kebabOptions;
        }
      },
    };
    if (userRole === UserRole.PILOT) {
      navigation.setOptions(params);
    }
  }, [
    anchorEl,
    close,
    isEditable,
    isOpen,
    isSubmitting,
    navigation,
    open,
    squawk,
    submit,
    userRole,
  ]);
};

export const useSquawkHeaderLeft = ({ navigation, route, action, trip }) => {
  const subTitle = [trip.identifier, trip.customName]
    .filter(Boolean)
    .join(' - ');
  const title = `${action} SQUAWK`;

  useEffect(() => {
    const params = {
      title: '',
      headerLeft: () => (
        <HeaderLeft title={title} subTitle={subTitle} navigation={navigation} />
      ),
    };
    navigation.setOptions(params);
  }, [navigation, route, subTitle, title]);
};

const Squawk = ({ navigation, route }): Node => {
  return (
    <MobileView>
      <AuthLayout>
        <SquawkDetails navigation={navigation} route={route} />
      </AuthLayout>
    </MobileView>
  );
};

const SquawkDetails = ({ navigation, route }) => {
  const [user] = useMyData();
  const userRole = user?.role;
  const sampleTrip = useTrip(
    'managementCompanies/hWhUopbYmWN786eXlS2o/trips/D80u8FghShFisUOUmEbo',
  ).data;
  const trip = route.params.trip ?? sampleTrip;
  const aircraft = route.params.sampleAircraft ?? trip.aircraft;
  const action = route.params.action;
  const squawk = route.params.squawk;
  const defaultValues = {
    title: squawk?.title ?? '',
    description: squawk?.description ?? '',
  };
  const isEditable = action === 'ADD' || action === 'EDIT';
  const { control, handleSubmit } = useForm({ defaultValues });
  const { isSubmitting } = useFormState({ control });
  const submit = handleSubmit(
    useCallback(
      async payload => {
        const filteredPayload = {
          ..._.omitBy(payload, [_.isUndefined, _.isEmpty]),
          trip: {
            id: trip.id,
            identifier: trip.identifier,
          },
        };
        if (squawk) {
          await updateSquawk({
            payload: filteredPayload,
            squawkPath: squawk.path,
          });
        } else {
          await createSquawk({
            payload: filteredPayload,
            collection: `${aircraft.path}/squawks`,
          });
        }
      },
      [aircraft.path, squawk, trip.id, trip.identifier],
    ),
  );

  useSquawkHeaderLeft({ navigation, route, action, trip });
  useSquawkHeaderRight({
    navigation,
    isEditable,
    isSubmitting,
    submit,
    userRole,
    squawk,
  });

  return (
    <View>
      <AircraftDetails aircraft={aircraft} />
      <SectionDivider />

      <TextFormField
        label="Squawk Title"
        name="title"
        control={control}
        editable={isEditable}
        backgroundColor={isEditable ? null : 'transparent'}
      />
      <TextFormField
        label="Description"
        name="description"
        control={control}
        multiline
        mode="contained"
        style={{ minHeight: 24 * 5 }}
        editable={isEditable}
        backgroundColor={isEditable ? null : 'transparent'}
      />
      <ImageViewerExample />
      <Spacer />
      {isEditable && (
        <SecondaryButton width="50%">+ Add Images</SecondaryButton>
      )}
    </View>
  );
};

const ImageViewerExample = () => {
  const images = [
    {
      thumbnail:
        'https://images.unsplash.com/photo-1574266965598-733f8ff7e41a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=60',
      original:
        'https://images.unsplash.com/photo-1574266965598-733f8ff7e41a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
    {
      thumbnail:
        'https://images.unsplash.com/photo-1610171310539-abaf3344489e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=60',
      original:
        'https://images.unsplash.com/photo-1610171310539-abaf3344489e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
    {
      thumbnail:
        'https://images.unsplash.com/photo-1623053795318-f8bb2f5897dd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=60',
      original:
        'https://images.unsplash.com/photo-1623053795318-f8bb2f5897dd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
    {
      thumbnail:
        'https://images.unsplash.com/photo-1610171310539-abaf3344489e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=60',
      original:
        'https://images.unsplash.com/photo-1610171310539-abaf3344489e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
  ];

  return <ImageViewer images={images} />;
};

export default Squawk;
