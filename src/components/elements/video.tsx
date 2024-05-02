import { useState } from 'react';
import Video from 'react-native-video';



export default ({ src }) => {
    const [width, setWidth] = useState(200)
    const [height, setHeight] = useState(100)
    const [visible, setIsVisible] = useState(false);

    return <>
        <Video source={{
            uri: src
        }} onLoad={data => {
            setWidth(data.naturalSize.width)
            setHeight(data.naturalSize.height)
        }}
            style={{
                borderRadius: 15,
                overflow: 'hidden',
                width, height
            }}
        />
    </>
}