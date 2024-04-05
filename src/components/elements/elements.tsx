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
    ? React.createElement(elementRendererMap[v.type], v)
    : <Text>不支持的 Element: {v.type} &nbsp; {JSON.stringify(v)} </Text>