import React, { useState } from 'react';
import {
  Headline,
  ActivityIndicator,
  Surface,
  Paragraph,
} from 'react-native-paper';
import styled from '@emotion/native';
import app, { useCollection } from '@appFirebase';
import Button from '@appComponents/Button';

import { Icon } from './theme';
import Checkbox from '@appComponents/Checkbox';
import RadioGroup from '@appComponents/RadioGroup';
import Text, { Title } from '@appComponents/Text';
import ProgressTracker from '@appComponents/ProgressTracker';
import TextField, { PasswordField } from './TextField';
import Dialog from './Dialog';
import { Menu, MenuItem, useMenuState } from './Menu';
import Tabs from './Tabs';
import Notification from './Notification';
import { createTestManagementCompany } from '../utils/CloudFunctions';
import { ImageViewer } from '@appComponents/ImageViewer';
import DateTimeField from '@appComponents/DateTimeField';
import { DateTime } from 'luxon';

export default function Playground({ navigation }) {
  const [snaps, isLoading, error] = useCollection(collectionRef);

  return (
    <>
      <Headline>Dev Playground</Headline>
      <Button onPress={() => navigation.navigate('Details')}>
        Go to Details
      </Button>
      <Button
        icon="aircraft"
        iconSize={22}
        color="accent"
        onPress={() => navigation.navigate('Welcome')}>
        Go to Welcome
      </Button>

      <Text>
        <Icon name="trips" /> Text Icon
      </Text>

      <ActivityIndicator animating={isLoading} />

      <Spacer />

      <Button onPress={() => createTestManagementCompany()}>
        Create Test Management Company
      </Button>

      {snaps?.size > 0 && (
        <PaddedCard margin={1}>
          <Title>Sample data from firestore</Title>
          {snaps.docs.map(doc => (
            <Paragraph key={doc.id}>
              {doc.id}: {JSON.stringify(doc.data())}
            </Paragraph>
          ))}
        </PaddedCard>
      )}

      {Boolean(error) && <Paragraph>Error: {error.message}</Paragraph>}

      <Headline>Tabs Component</Headline>
      <TabsExample />

      <Spacer />

      <Headline>RadioGroup Component</Headline>
      <RadioGroupExample />

      <Spacer />

      <Headline>Checkbox Component</Headline>
      <CheckboxExample />

      <Spacer />

      <Headline>Checkbox with Label Component</Headline>
      <CheckboxExample label="Checkbox Label" />

      <Spacer />

      <Headline>Text Component</Headline>
      <Title>Title Text</Title>
      <Text>Body Text</Text>

      <Spacer />

      <Headline>TextField Components</Headline>
      <TextFieldExample />

      <Spacer />

      <Headline>Dialog Component</Headline>
      <DialogExample />

      <Spacer />

      <Headline>Menu Component</Headline>
      <MenuExample />

      <Spacer />

      <Headline>Notification Component</Headline>
      <NotificationExample />

      <Spacer />

      <Headline>ImageViewer Component</Headline>
      <ImageViewerExample />

      <Spacer />

      <Headline>ProgressTracker Component</Headline>
      <ProgressTracker steps={['SJC', 'LAX', 'DEN']} currentStep={2} />

      <Spacer />

      <DatePickerExample />

      <Spacer />
    </>
  );
}

const collectionRef = app.firestore().collection('sample');

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
  ];

  return <ImageViewer images={images} />;
};

const TabsExample = () => {
  const [tabIndex, setTabIndex] = React.useState(0);
  const routes = [
    { key: 'first', title: 'First', content: TabFirst },
    { key: 'second', title: 'Second', content: TabSecond },
  ];

  return (
    <Tabs
      tabIndex={tabIndex}
      onIndexChange={setTabIndex}
      routes={routes}
      tabBarInline
    />
  );
};

const TabFirst = () => (
  <PaddedCard>
    <Text>Tab 1</Text>
  </PaddedCard>
);

const TabSecond = () => (
  <PaddedCard>
    <Text>Tab 2</Text>
  </PaddedCard>
);

const TextFieldExample = () => {
  const [value, setValue] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <FormWrap>
      <TextField
        value={value}
        label="Field Label"
        onChangeText={text => setValue(text)}
      />
      <PasswordField
        value={password}
        label="Password"
        onChangeText={pass => setPassword(pass)}
      />
    </FormWrap>
  );
};

const MenuExample = () => {
  const { anchorEl, isOpen, open, close } = useMenuState();

  return (
    <>
      <Button color="accent" onPress={open} ref={anchorEl}>
        Show Menu
      </Button>
      <Menu anchor={anchorEl} visible={isOpen} onDismiss={close} arrowVisible>
        <MenuItem
          active
          icon="aircraft"
          title="Menu Item 1"
          onPress={() => console.log('Pressed menu item')}
        />
        <MenuItem
          title="Menu Item 2"
          icon="aircraft"
          subItem
          onPress={() => console.log('Pressed menu item')}
        />
        <MenuItem
          title="Menu Item 3"
          icon="aircraft"
          subItem
          disabled
          onPress={() => console.log('Pressed disabled menu item')}
        />
      </Menu>
    </>
  );
};

const GetCheckbox = () => {
  const [checked, setChecked] = React.useState(false);

  return (
    <Checkbox
      label={''}
      checked={checked}
      onChange={() => setChecked(!checked)}
    />
  );
};

function SortDataTableExampleRows(rows) {
  let sortedRows = [];
  if (rows) {
    sortedRows = [
      rows[7],
      rows[6],
      rows[5],
      rows[4],
      rows[3],
      rows[2],
      rows[1],
      rows[0],
    ];
  }
  return sortedRows;
}

// TODO: Remove after adding storybook
const RadioGroupExample = () => {
  const options = [
    {
      value: 'option1',
      label: 'Option 1',
    },
    {
      value: 'option2',
      label: 'Option 2',
    },
  ];

  const [value, setValue] = React.useState(options[1].value);

  return (
    <RadioGroup options={options} value={value} onChange={v => setValue(v)} />
  );
};

const CheckboxExample = ({ label = '' }) => {
  const [checked, setChecked] = React.useState(false);

  return (
    <Checkbox
      label={label}
      checked={checked}
      onChange={() => setChecked(!checked)}
    />
  );
};

const NotificationExample = () => {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <Button onPress={() => setVisible(true)}>Show Notification</Button>
      <Notification
        color="accent"
        visible={visible}
        onDismiss={() => setVisible(false)}>
        We have sent an email with a sign-in link to your email address.
      </Notification>
    </>
  );
};

const DialogExample = () => {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <Button icon="messages" onPress={() => setVisible(true)}>
        Show Dialog
      </Button>
      <Dialog
        title="Dialog Title"
        visible={visible}
        onDismiss={() => setVisible(false)}
        actionSlot={
          <Button color="error" onPress={() => setVisible(false)}>
            Dismiss Dialog
          </Button>
        }>
        <Text>Dialog Content here</Text>
      </Dialog>
    </>
  );
};

const DatePickerExample = () => {
  const [date, setDate] = useState(() =>
    DateTime.fromObject().setZone('America/New_York'),
  );

  return (
    <DateTimeField label="Departure Date" value={date} onChange={setDate} />
  );
};

const Spacer = styled.View`
  margin: ${({ theme }) => theme.layout.space(0.5).toString()}px 0;
`;

const PaddedCard = styled(Surface)`
  padding: ${({ theme }) => theme.layout.space(2).toString()}px;
  margin: ${({ theme, margin = 0 }) => theme.layout.space(margin).toString()}px;
`;

const FormWrap = styled.View`
  width: 100%;
  max-width: 400px;
`;
