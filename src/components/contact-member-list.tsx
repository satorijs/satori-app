import { View, TouchableOpacity, Text, FlatList } from "react-native"
import { Avatar } from "react-native-paper"
import { Guild, GuildMember } from "../satori/protocol"
import { useContactInfo, useLogins, useSatori } from "../globals/satori"
import { useMemo, useState } from "react"
import { useAsyncIterator } from "../globals/utils"
import { Contact } from "../satori/sas"

export const ContactMemberList = ({ contact, onClickMember }: {
    contact: Contact,
    onClickMember?: (member: GuildMember) => void
}) => {

    const satori = useSatori()
    const login = useLogins()
    const { contactInfo } = useContactInfo()
    const members = useAsyncIterator(useMemo(() => {
        if (!satori) return null
        if (!login) return null
        if (!contactInfo) return null
        return satori.bot(
            login.find(v => contact.whoIsHere.includes(v.selfId))
        ).getGuildMemberIter(contact.id)
    }, [satori, login, contactInfo]))

    return <FlatList
        data={members.values}
        renderItem={({ item }) => <TouchableOpacity
            onPress={onClickMember && (() => onClickMember(item))}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10
            }}
        >
            <Avatar.Image source={{ uri: item.avatar }} />
            <Text style={{ marginLeft: 10 }}>{item.name}</Text>
        </TouchableOpacity>}

        onEndReached={() => members.next()}
    />
}