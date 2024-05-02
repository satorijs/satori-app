import { Text, View } from "react-native"
import { LightBox } from "../components/lightbox/LightBox"
import FastImage from "react-native-fast-image"
import Animated from "react-native-reanimated"
import { forwardRef } from "react"

export default () => {
    return <View style={{
        paddingVertical: 60,
        paddingHorizontal: 30,
    }}>
        <Text style={{
            fontSize: 40,
            fontWeight: '500',
        }}>测试页</Text>
        <Text>组件</Text>

        <Text>LightBox</Text>
        <LightBox
            Preview={
                forwardRef((props, ref) => <Animated.Image
                    {...props}
                    ref={ref}
                    source={{
                        uri: 'https://i2.hdslb.com/bfs/archive/43d0d219f32a6cc7fddea381964401c11c162a9d.jpg'
                    }}
                    style={{
                        width: 200,
                        height: 200
                    }}
                />)
            }
            Target={
                forwardRef((props, ref) => <Animated.Image
                    {...props}
                    ref={ref}
                    source={{
                        uri: 'https://i2.hdslb.com/bfs/archive/43d0d219f32a6cc7fddea381964401c11c162a9d.jpg'
                    }}
                />)
            }
        />
    </View>
}