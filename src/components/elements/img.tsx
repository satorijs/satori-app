import { useEffect, useState } from "react"
import { Image, Modal, PermissionsAndroid, Platform } from "react-native"
import { Card, TouchableRipple } from "react-native-paper"
import ImageViewer from 'react-native-image-zoom-viewer';
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import FastImage from 'react-native-fast-image'

async function hasAndroidPermission() {
    const getCheckPermissionPromise = () => {
        if (Platform.Version as number >= 33) {
            return Promise.all([
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
            ]).then(
                ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
                    hasReadMediaImagesPermission && hasReadMediaVideoPermission,
            );
        } else {
            return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        }
    };

    const hasPermission = await getCheckPermissionPromise();
    if (hasPermission) {
        return true;
    }
    const getRequestPermissionPromise = () => {
        if (Platform.Version as number >= 33) {
            return PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            ]).then(
                (statuses) =>
                    statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
                    PermissionsAndroid.RESULTS.GRANTED,
            );
        } else {
            return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((status) => status === PermissionsAndroid.RESULTS.GRANTED);
        }
    };

    return await getRequestPermissionPromise();
}


export const Img = ({ src }) => {
    const [width, setWidth] = useState(200)
    const [height, setHeight] = useState(100)
    const [visible, setIsVisible] = useState(false);

    return <>
        <TouchableRipple onPress={() => setIsVisible(true)} style={{
            borderRadius: 15,
            overflow: 'hidden',
            width, height
        
        }}>
            <FastImage 
            source={{ uri: src }} 
            style={{
                borderRadius: 15,
                overflow: 'hidden',
                width, height
            }} resizeMode={FastImage.resizeMode.contain} onLoad={e => {
                // console.log('onload')
                const maxWidth = 200, maxHeight = 200
                const scale =
                    Math.min(maxWidth / e.nativeEvent.width,
                        maxHeight / e.nativeEvent.height, 1)
                setWidth(e.nativeEvent.width * scale)
                setHeight(e.nativeEvent.height * scale)
                // console.log(e.nativeEvent.source.width * scale, e.nativeEvent.source.height * scale)
            }} />
        </TouchableRipple>
        <Modal visible={visible} transparent>
            <ImageViewer imageUrls={[{ url: src }]}
                onCancel={() => setIsVisible(false)}
                onSwipeDown={() => setIsVisible(false)}
                onClick={() => setIsVisible(false)}
                enableSwipeDown={true}
                backgroundColor="#00000099"
                menuContext={{ "saveToLocal": "保存图片", "cancel": "取消" }}
                onSave={async e => {
                    if (Platform.OS === "android" && !(await hasAndroidPermission())) {
                        return;
                    }

                    CameraRoll.saveToCameraRoll(e)
                }}
            />
        </Modal>
    </>
}