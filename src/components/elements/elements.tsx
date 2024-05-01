import { Img } from "./img";
import { Quote } from "./quote";
import { TextEle } from "./text";
import Element from "../../satori/element"
import React from "react";
import { Text } from "react-native";
import { At } from "./at";

export const elementRendererMap = {
    img: Img,
    text: TextEle,
    quote: Quote,
    at: At
}

export const elementToObject = (e: Element) => {
    return {
        ...e.attrs,
        type: e.type,
        child: e.children.map(elementToObject)
    }
}

export const renderElement = (v: any) => (v.type in elementRendererMap)
    ? React.createElement(elementRendererMap[v.type], {
        ...v,
        key: v.id
    })
    : <Text>不支持的 Element: {v.type} &nbsp; {JSON.stringify(v)} </Text>

export const toPreviewString = (v: string | any) =>
    ((typeof v === 'string') ? Element.parse(v) : [v]).map(v => {
        if (v.type === 'text') return v.attrs?.content?.replaceAll('\n', ' ') ?? v.content;
        if (v.type === 'quote') return `[回复]`
        if (v.type === 'img') return '[图片]'
        if (v.type === 'at') return `@${v.name ?? v.id}`
        return '[未知]'
    }).join(' ')

export const renderElements = (v: Element[]) => {
    const textElements = ['text', 'at']

    const result: {
        isText: boolean,
        elements: Element[]
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