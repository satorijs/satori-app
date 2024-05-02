import { useRef, useState } from "react"
import { Pressable } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import { Portal } from "react-native-paper"
import Animated, { runOnUI, useSharedValue, withTiming } from "react-native-reanimated"

export const LightBox = ({
    Preview,
    Target
}: {
    Preview: (props) => React.ReactNode,
    Target: (props) => React.ReactNode
}) => {
    const opacity = useSharedValue(0)
    const [visible, setVisible] = useState(false)

    const width = useSharedValue(200)
    const height = useSharedValue(200)
    const top = useSharedValue(0)
    const left = useSharedValue(0)

    const refPreview = useRef(null)
    const refTarget = useRef(null)

    const start = useSharedValue({
        x: 0,
        y: 0
    })

    const pan = Gesture.Pan().onStart(e=>{
        start.value = {
            x: left.value,
            y: top.value
        }
    }).onUpdate(e => {
        top.value = e.translationY + start.value.y
        left.value = e.translationX + start.value.x
    })

    const fling = Gesture.Fling().onStart(e => {
        top.value = withTiming(0)
        left.value = withTiming(0)
    })

    return <>
        <Pressable onPress={() => {
            console.log('press')
            refPreview.current.measureInWindow((x, y, w, h) => {
                opacity.value = withTiming(1)
                console.log(x, y, w, h)

                width.value = w
                height.value = h
                top.value = y
                left.value = x

                width.value = withTiming(200)
                height.value = withTiming(200)
                top.value = withTiming(0)
                left.value = withTiming(0)

                setVisible(true)
            })
        }}>
            <Preview ref={refPreview} />
        </Pressable>
        <Portal>
            {
                visible &&
                <GestureHandlerRootView>
                    <GestureDetector gesture={Gesture.Simultaneous(pan, fling)}>
                        <Animated.View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            opacity: opacity

                        }}>
                            <Pressable onPress={() => {
                                console.log('press2')

                                refPreview.current.measureInWindow((x, y, w, h) => {
                                    opacity.value = withTiming(0)
                                    console.log(x, y, w, h)

                                    width.value = withTiming(w)
                                    height.value = withTiming(h)
                                    top.value = withTiming(y)
                                    left.value = withTiming(x)

                                    setTimeout(() => {
                                        setVisible(false)
                                    }, 300)
                                })

                            }}>
                                <Target style={{
                                    width, height, top, left
                                }} ref={refTarget} />
                            </Pressable>
                        </Animated.View>
                    </GestureDetector>
                </GestureHandlerRootView>
            }
        </Portal>
    </>
}