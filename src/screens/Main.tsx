import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Contacts } from './main/Contacts';
import { Icon } from 'react-native-paper';
import { Config } from './main/Config';
import { useGlobalStackNavigation } from '../globals/navigator';
import { useEffect } from 'react';

const Tab = createMaterialBottomTabNavigator();

export const Main = ({
    navigation
}) => {
    const { setNavigation } = useGlobalStackNavigation()

    useEffect(() => {
        setNavigation(navigation)
    }, [navigation])

    return (
        <Tab.Navigator>
            <Tab.Screen name="Contacts" component={Contacts} options={{
                tabBarIcon(props) {
                    return <Icon source="account-group" size={24} color={props.color} />
                },
            }} />
            <Tab.Screen name="Config" component={Config} options={{
                tabBarIcon(props) {
                    return <Icon source="cog" size={24} color={props.color} />
                },
            }} />
        </Tab.Navigator>
    );
}