import { View } from "react-native"
import { Avatar, Card, Text } from "react-native-paper"
import { renderElement, toPreviewString } from "./elements"

export const Quote = ({ children }) => {
    return <Card mode="contained" style={{
        paddingTop: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        paddingBottom: 10
    }}>
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 10 }}>
            <Avatar.Image source={{ uri: children[0].avatar }} size={20} />
            <Text style={{ opacity: 0.7 }}>{children[0].name ?? children[0].id}</Text>
        </View>

        <Text>{children.slice(1).map(toPreviewString).join(' ')}</Text>
    </Card>
}