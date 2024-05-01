import { MD3Colors, Text } from "react-native-paper"

export const At = ({id, name})=>{
    return <Text style={{
        color: MD3Colors.primary80
    }} key={id}>@{name}</Text>
}