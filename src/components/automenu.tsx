import { useState } from "react";
import { Pressable } from "react-native";
import { Menu } from "react-native-paper";

export const AutoMenu = ({ children, anchor }: {
    anchor: React.ReactNode,
    children: React.ReactNode
})=>{
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
            <Pressable onPress={openMenu}>
                {anchor}
            </Pressable>
        }
    >
        {children}
    </Menu>
}