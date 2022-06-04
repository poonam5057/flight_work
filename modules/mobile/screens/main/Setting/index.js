import React from 'react';
import { Stack } from '@appComponents/navigation';
import ChangePassword from '../ChangePassword/ChangePassword';
import Settings from '../Setting/Settings';
import HeaderLeft from '../../../components/HeaderLeft';

const SettingStack = ({ children }) => (

    <Stack.Navigator initialRouteName="Settings">
        <Stack.Screen
            name="Settings"
            component={Settings}
            options={{
                title: '',
                headerLeft: props => <HeaderLeft title="Settings" {...props} />,
              }}
        />
        <Stack.Group>
            <Stack.Screen
                name="Change Password"
                component={ChangePassword}
                options={subScreenOptions}
            />
        </Stack.Group>
        {children}
    </Stack.Navigator>
);

const subScreenOptions = ({ navigation }) => ({
    title: '',
    headerLeft: props => (
        <HeaderLeft title="Change Password" {...props} navigation={navigation} />
    ),
});
export default SettingStack;