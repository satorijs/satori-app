import { NavigationProp, RouteProp } from "@react-navigation/native"
import { Text } from "react-native-paper"
import { StackParamList } from "../globals/navigator"

export const Contact = ({
    navigation, route
}: {
    navigation: NavigationProp<StackParamList>,
    route: RouteProp<{ Chat: StackParamList['Chat'] }>
}) => {

    return <Text>Test</Text>
}