import React, { useCallback, useState } from 'react';
import styled from '@emotion/native';
import { IconButton } from 'react-native-paper';
import { Spacer } from '@appComponents/ScreenLayout';
import Button, { BorderedButton } from '@appComponents/Button';
import Text from '@appComponents/Text';
import Checkbox from '@appComponents/Checkbox';
import Icon from '@appComponents/theme/Icon';
import { Menu, MenuItem, useMenuState } from '@appComponents/Menu';
import * as Phone from '@appUtils/phone';
import ConfirmationDialog from './ConfirmationDialog';

const PassengersSection = ({
  passengers = [],
  checked = [],
  setChecked,
  setLeadPassenger,
  onRemove,
  onEdit,
  hasActions,
}) => {
  const hasMultiSelect = Boolean(setChecked);

  return (
    <PassengersOuter>
      <PassengersInner>
        <AddButton
          height={50}
          color="secondary"
          icon="add"
          iconSize={16}
          onPress={() => onEdit({})}>
          Add Passenger
        </AddButton>
        <Spacer size={5} />

        <TitleRow>
          <Text size="medium" weight="bold">
            PASSENGERS LIST
          </Text>
          {hasMultiSelect && (
            <Text size="smallest">{checked.length} passengers selected</Text>
          )}
        </TitleRow>
        <Spacer />
        {passengers.length == 0 && <Text>No Passengers Available</Text>}
        {passengers.length > 0 && (
          <PassengerList
            passengers={passengers}
            checked={checked}
            setChecked={setChecked}
            setLeadPassenger={setLeadPassenger}
            hasMultiSelect={hasMultiSelect}
            onRemove={onRemove}
            onEdit={onEdit}
            hasActions={hasActions}
          />
        )}
      </PassengersInner>
    </PassengersOuter>
  );
};

export const PassengerList = ({
  passengers = [],
  hasMultiSelect,
  hasActions,
  checked,
  setChecked,
  setLeadPassenger,
  onRemove,
  onEdit,
}) => {
  const toggleChecked = React.useCallback(
    ({ passenger, checked: alreadyChecked }) => {
      if (alreadyChecked) {
        setChecked(checked.filter(p => p.name !== passenger.name));
      } else {
        setChecked([...checked, passenger]);
      }
    },
    [checked, setChecked],
  );

  return (
    <PassengerListWrap>
      {passengers.map((passenger, i) => (
        <PassengerItem
          key={i}
          isFirst={i === 0}
          checked={checked.find(p => p.name == passenger.name)}
          toggleChecked={toggleChecked}
          setLeadPassenger={setLeadPassenger}
          passenger={passenger}
          hasMultiSelect={hasMultiSelect}
          onEdit={onEdit}
          onRemove={onRemove}
          hasActions={hasActions}
        />
      ))}
    </PassengerListWrap>
  );
};

export const PassengerItem = ({
  passenger,
  checked,
  toggleChecked,
  setLeadPassenger,
  isFirst = false,
  hasMultiSelect = false,
  hasActions = false,
  onRemove,
  onEdit,
}) => {
  const { name, email, phoneNumber } = passenger;

  return (
    <PassengerRow isFirst={isFirst}>
      {hasMultiSelect && (
        <CheckboxWrap>
          <Checkbox
            checked={checked}
            onChange={() => toggleChecked({ passenger, checked })}
          />
        </CheckboxWrap>
      )}
      <InfoColumn>
        <Text size="small">{name}</Text>
        {(email?.length > 0 || phoneNumber?.length > 0) && (
          <Spacer size={0.75} />
        )}
        {email?.length > 0 && (
          <>
            <Spacer size={0.25} />
            <Row>
              <Icon color="transparent" name="email" />
              <Text size="smallest"> {email}</Text>
            </Row>
          </>
        )}
        {phoneNumber?.length > 0 && (
          <>
            <Spacer size={0.25} />
            <Row>
              <Icon color="transparent" name="phone-call" />
              <Text size="smallest">
                {' '}
                {Phone.parse(phoneNumber).formatNational()}
              </Text>
            </Row>
          </>
        )}
        {checked && Boolean(setLeadPassenger) && (
          <>
            <Spacer size={1.5} />
            <Row>
              <PassengerLeadButton
                isLead={isFirst}
                onPress={() => setLeadPassenger(passenger)}
              />
            </Row>
          </>
        )}
      </InfoColumn>
      {hasActions && (
        <PassengerActions
          passenger={passenger}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      )}
    </PassengerRow>
  );
};

const PassengerLeadButton = ({ isLead, onPress }) => {
  if (isLead) {
    return (
      <Button color="secondary" icon="star" iconSize={16}>
        <Text color="dark">Lead</Text>
      </Button>
    );
  }

  return (
    <BorderedButton color="secondary" onPress={onPress}>
      <Text color="secondary">Make Lead</Text>
    </BorderedButton>
  );
};

const PassengerActions = ({ passenger, onRemove, onEdit }) => {
  const { anchorEl, isOpen, open, close } = useMenuState();
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleRemove = useCallback(() => {
    close();
    setDialogVisible(true);
  }, [close]);

  const handleEdit = useCallback(async () => {
    await onEdit(passenger);
    close();
  }, [close, passenger, onEdit]);

  const dialogButtons = [
    { label: 'CANCEL', onPress: () => setDialogVisible(false) },
    {
      label: 'REMOVE',
      onPress: async () => {
        setDialogVisible(false);
        await onRemove(passenger);
      },
    },
  ];

  return (
    <>
      <PassengerActionsWrap>
        <IconButton icon="ellipsis-vertical" onPress={open} ref={anchorEl} />
        <Menu
          anchor={anchorEl}
          visible={isOpen}
          onDismiss={close}
          contentStyle={{ backgroundColor: '#ffffff' }}>
          <MenuItem title="Edit" onPress={handleEdit} />
          <MenuItem title="Delete" onPress={handleRemove} />
        </Menu>
      </PassengerActionsWrap>
      <ConfirmationDialog
        text={`Are you sure you want to remove ${passenger.name}?`}
        visible={dialogVisible}
        buttons={dialogButtons}
      />
    </>
  );
};

const PassengersOuter = styled.View`
  width: 100%;
  height: 100%;
`;

const PassengersInner = styled.View(({ theme }) => ({
  paddingVertical: theme.layout.space(2.5),
  paddingHorizontal: theme.layout.space(2),
  maxHeight: '100%',
}));

const PassengerListWrap = styled.ScrollView(({ theme }) => ({
  paddingHorizontal: theme.layout.space(2),
  borderColor: '#6e6e6e',
  borderWidth: 1,
  borderRadius: 8,
}));

const CheckboxWrap = styled.View`
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  border: 2px solid #a6a6a6;
  border-radius: 3px;
  width: 22px;
  height: 22px;
  margin-right: 10px;
`;

const AddButton = styled(BorderedButton)`
  margin-left: 0;
  margin-right: 0;
`;

const PassengerActionsWrap = styled.View(({ theme }) => ({
  marginRight: theme.layout.space(-2.5),
}));

const InfoColumn = styled.View`
  flex: 1;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TitleRow = styled(Row)`
  justify-content: space-between;
`;

const PassengerRow = styled(Row)(({ theme, isFirst }) => ({
  paddingVertical: theme.layout.space(2),
  borderColor: '#ffffff',
  borderTopWidth: isFirst ? 0 : 1,
}));

export default PassengersSection;
