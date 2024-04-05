import { View } from "react-native"
import { Avatar, Card, Text } from "react-native-paper"
import { renderElement } from "./elements"

export const Quote = ({ child }) => {
    return <Card mode="contained" style={{
        paddingTop: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        paddingBottom: 10
    }}>
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 10 }}>
            <Avatar.Image source={{ uri: child[0].avatar }} size={20} />
            <Text style={{ opacity: 0.7 }}>{child[0].name ?? child[0].id}</Text>
        </View>

        {child.slice(1).map(renderElement)}
    </Card>
}