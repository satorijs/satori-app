import { View } from "react-native";
import { WebView } from 'react-native-webview';

export const Webview = ({ route }) => {
    const { url } = route.params;
    return <View style={{
        flex: 1
    }}>
        <WebView source={{
            uri: url
        }} style={{
            flex: 1
        }} />
    </View>
}