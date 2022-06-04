import React, { useEffect, useState, useCallback } from 'react';
import { Svg, Path } from 'react-native-svg';
import Text from '@appComponents/Text';
import type { Trip } from '@appUtils/tripConverter';
import { TripState } from '@appUtils/tripConverter';
import { Box } from '@appComponents/ScreenLayout';
import { useTheme } from '@appComponents/theme';
import { useTrip } from '@appUtils/api';
import Button from '@appComponents/Button';
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import {
    ChangeMarker,
} from '../../../components/TripData';
import HeaderLeft from '../../../components/HeaderLeft';
import TextField from '../../../../components/TextField';
import { TextInput } from 'react-native-paper';

type UpdateFuelHeaderProps = {
    tintColor: string,
    trip: Trip,
    route: {
        params: {
            documentPath: string,
        },
    },
};

export const UpdateFuelHeaderLeft = (props: any) => {
    const {
        route,
        tintColor,
    } = props;
    const [tripTitle, setTripTitle] = useState('')
    const [tripsubTitle, setTripsubTitle] = useState('')
    const trip = useTrip(route.params?.documentPath).data;

    useEffect(() => {
        if (trip) {
            const title = getTitle(trip);
            const subTitle = [trip.identifier, trip.customName]
                .filter(Boolean)
                .join(' - ');
            setTripTitle(title)
            setTripsubTitle(subTitle)
        }
    }, [trip])

    return (
        <HeaderLeft
            tintColor={tintColor}
            route={route}
            title={tripTitle}
            subTitle={tripsubTitle}
        />
    );
};

const getTitle = (trip: Trip) => {
    switch (trip.state) {
        case TripState.OWNER_DRAFT:
            return 'Trip Builder - Review';
        case TripState.OWNER_REQUEST:
        case TripState.DRAFT:
            return 'Requested Trip';
        case TripState.UPCOMING:
            return 'Upcoming Trip';
        case TripState.ACTIVE:
            return 'Update Fuel';
        case TripState.ENDED:
            return 'Completed Trip';
        case TripState.CANCELLED:
            return 'Cancelled Trip';
        default:
            return 'Loading Details...';
    }
};

const UpdateFuelHeaderRight = ({
    navigation,
    submit,
}) => {
    useEffect(() => {
        const params = {
            headerRight: () => <Button mode="text" onPress={submit}>
                Save
            </Button>
        };
        navigation.setOptions(params);
    }, [
        navigation,
        submit,
    ]);
};

const FuelForm = ({ data, setData, craft }) => {
    const onChange = useCallback(
        value => {
            setData(existing => ({
                ...existing,
                ...value,
            }));
        },
        [setData],
    );

    return (
        <Box>
            <Box pv={0.5} pr={28}>
                <Text>FUEL ON</Text>
                <TextField
                    label={''}
                    backgroundColor={''}
                    right={<TextInput.Affix text="lbs" textStyle={TEXT_STYLES} />}
                    value={craft?.fuel ? craft?.fuel : data}
                    onChangeText={fuel => onChange({ fuel })}
                />
            </Box>
            <Box pv={0.5} pr={28}>
                <Text>FUEL OFF</Text>
                <TextField
                    label={''}
                    backgroundColor={''}
                    right={<TextInput.Affix text="lbs" textStyle={TEXT_STYLES} />}
                    value={craft?.fuelOff ? craft?.fuelOff : data}
                    onChangeText={fuelOff => onChange({ fuelOff })}
                />
            </Box>
            <Box pv={0.5} pr={28}>
                <Text>FUEL USED</Text>
                <TextField
                    disabled
                    label={''}
                    backgroundColor={''}
                    right={<TextInput.Affix text="lbs" textStyle={TEXT_STYLES} />}
                    value={getFuelUsedValue(craft).toString()}
                    onChangeText={fuelUsed => onChange({ fuelUsed })}
                />
            </Box>
        </Box>
    );
};

const TEXT_STYLES = { color: 'white' };

const FUEL_DEFAULT_VALUES = {
    fuel: '',
    fuelOff: '',
    fuelUsed: '',
};

const getFuelUsedValue = craft => {
    if (craft?.fuel && craft?.fuelOff) {
        return craft.fuel - craft.fuelOff;
    }
    return '';
};

const UpdateFuel = ({ changes = [], route, navigation }: UpdateFuelHeaderProps) => {
    const [data1, setData1] = useState(FUEL_DEFAULT_VALUES);
    const { data, index, craft } = route.params;
    const legChanges = changes
        .filter(c => c.startsWith(`legs.${index}.`))
        .map(c => c.slice(`legs.${index}.`.length));
    const isNewLeg = legChanges.includes('id');

    // const submit = ({ documentPath, setError, closeDialog }) => handleSubmit(useCallback(
    // console.log("Path ~~~~", documentPath, closeDialog, setError);
    //     // useCallback(
    //     //     payload => {
    //     //         const filteredPayload = _.omitBy(payload, _.isUndefined);
    //     //         console.log('filteredPayload ---------->', filteredPayload);
    //     //         const task = documentPath
    //     //             ? updateAircraft(filteredPayload, documentPath)
    //     //             : createAircraft(filteredPayload);

    //     //         task
    //     //             .then(() => closeDialog())
    //     //             .catch(error => {
    //     //                 setError('general', { type: 'manual', message: error.message });
    //     //             });
    //     //     },
    //     //     [],
    //     // );
    // ))

    const submit = () => (
        console.log("Clieck Save Button and update value ", data1)
    );
    UpdateFuelHeaderRight({
        navigation,
        submit,
    });

    const LegDash = () => {
        const theme = useTheme();
        return (
            <Box mh={1}>
                <Svg width={70} height={2}>
                    <Path
                        stroke={theme.colors.heading}
                        strokeDasharray={4}
                        strokeDashoffset={-1}
                        d="M0 1L70 1"
                    />
                </Svg>
            </Box>
        );
    };

    return (
        <Box ph={2} pv={2} >
            <Box pv={1} >
                <Text size="medium" color="subTitle" weight="400" lh={24}>
                    LEG {index + 1}
                    <ChangeMarker visible={isNewLeg} />
                </Text>
                <Box dir="row" mv={1} ai="center">
                    <Text size="medium" weight="400" lh={24}>
                        {data.from || '?'}
                    </Text>
                    <LegDash />
                    <Text size="medium" weight="400" lh={24}>
                        {data.to || '?'}
                    </Text>
                    <ChangeMarker
                        visible={
                            !isNewLeg && legChanges.some(c => c === 'from' || c === 'to')
                        }
                    />
                </Box>
            </Box>
            <FuelForm data={data1} setData={setData1} craft={craft} />
        </Box>
    )
}

export default UpdateFuel;