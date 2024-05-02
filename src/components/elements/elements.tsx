import { Img } from "./img";
import { Quote } from "./quote";
import { TextEle } from "./text";
import Element from "../../satori/element"
import React from "react";
import { Text } from "react-native";
import { At } from "./at";
import Video from "./video";

export const elementRendererMap = {
    img: Img,
    text: TextEle,
    quote: Quote,
    at: At,
    video: Video
}

interface ElementObject {
    type: string,
    children: ElementObject[],
    [key: string]: any
}

export const elementToObject: (e: Element) => ElementObject = (e: Element) => {
    return {
        ...e.attrs,
        type: e.type,
        children: e.children.map(elementToObject)
    }
}

export const renderElement = (v: ElementObject) => {
    if (v.type in elementRendererMap) {
        const Renderer = elementRendererMap[v.type]
        return <Renderer key={v.id} {...v} />
    } else {
        if (v.children && v.children.some(v=>v.type in elementRendererMap)) {
            return renderElements(v.children)
        } else {
            return <Text>不支持的 Element: {v.type} &nbsp; {JSON.stringify(v)} </Text>
        }
    }
}

export const toPreviewString = (v: string | any) =>
    ((typeof v === 'string') ? Element.parse(v) : [v]).map(v => {
        if (v.type === 'text') return v.attrs?.content?.replaceAll('\n', ' ') ?? v.content;
        if (v.type === 'quote') return `[回复]`
        if (v.type === 'img') return '[图片]'
        if (v.type === 'at') return `@${v.name ?? v.id}`
        return '[未知]'
    }).join(' ')

export const renderElements = (v: ElementObject[]) => {
    const textElements = ['text', 'at']

    const result: {
        isText: boolean,
        elements: ElementObject[]
    }[] = []

    for (const e of v) {
        const isText = textElements.includes(e.type)
        if (result[result.length - 1]?.isText && isText) {
            result[result.length - 1].elements.push(e)
        } else {
            result.push({
                isText,
                elements: [e]
            })
        }
    }

    return result.map(({ isText, elements }) => {
        if (isText) {
            return <Text>{elements.map(renderElement)}</Text>
        } else {
            return renderElement(elements[0])
        }
    })
}