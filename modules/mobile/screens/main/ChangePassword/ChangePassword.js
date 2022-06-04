import React, { useCallback, useEffect } from 'react';
import { Box } from '@appComponents/ScreenLayout';
import type { NavigationProp } from '@react-navigation/native';
import { PasswordFormField } from '@appComponents/forms/FormFields';
import Button from '@appComponents/Button';
import { updateChangePassword } from '@appUtils/auth';
import styled from '@emotion/native';
import { useForm, useFormState } from 'react-hook-form';
import Notification from '../../../../components/Notification';

type ChangePasswordProps = {
    navigation: NavigationProp
};

const ChangePasswordHeaderRight = ({
    navigation,
    isSubmitting,
    submit,
}) => {
    useEffect(() => {
        const params = {
            headerRight: () => <Button loading={isSubmitting} mode="text" onPress={submit}>
                Save
            </Button>
        };
        navigation.setOptions(params);
    }, [
        navigation,
        submit,
    ]);
};

const ChangePassword = ({ navigation }: ChangePasswordProps): Node => {
    const {
        control,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm();
    const { isSubmitting } = useFormState({ control });
    const submit = handleSubmit(
        useCallback(
            async payload =>
                await updateChangePassword(payload).catch((error) => {
                    setError('general', { type: 'manual', message: error.message });
                }),
            [setError]
        ),
    );

    ChangePasswordHeaderRight({
        navigation,
        isSubmitting,
        submit,
    });

    return (
        <Box ph={2} pv={4} >
            <Box pv={2} >
                <PasswordFormField control={control} label='Current Password' name="CurrentPassword" right={''} />
            </Box>
            <Box pv={2} >
                <PasswordFormField control={control} label='New Pasword' name="NewPassword" right={''} />
            </Box>
            <Row>
                <Notification
                    color="error"
                    visible={errors?.general}
                    onDismiss={() => clearErrors()}>
                    {errors?.general?.message}
                </Notification>
            </Row>
        </Box>
    );
};

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export default ChangePassword;