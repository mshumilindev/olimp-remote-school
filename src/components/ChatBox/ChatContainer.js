import React, { useRef, useEffect, useContext, useState } from 'react';
import Jitsi from "./jitsi";
import userContext from "../../context/userContext";

export default function ChatContainer({chat, usersList}) {
    const [ organizerChatID, setOrganizerChatID ] = useState(null);
    const $localTracksContainer = useRef(null);
    const $remoteTracksContainer = useRef(null);
    const $chatroomUsersOrganizer = useRef(null);
    const $chatroomUsersParticipants = useRef(null);
    const { user } = useContext(userContext);

    useEffect(() => {
        let jitsi = new Jitsi();

        jitsi.start({
            containers: {
                local: $localTracksContainer.current,
                remote: $remoteTracksContainer.current,
                organizer: $chatroomUsersOrganizer.current,
                participants: $chatroomUsersParticipants.current
            },
            user: user,
            roomName: chat.id,
            onDisplayNameChange: onDisplayNameChange,
            usersList: usersList,
            onRemoteAdded: onRemoteAdded
        });
        return () => {
            jitsi.stop();
        }
    }, []);

    useEffect(() => {
        makeVideoMain();

        const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        const obs = new MutationObserver((mutations) => {
            setTimeout(() => {
                makeVideoMain();
            }, 0);
        });
        obs.observe( $remoteTracksContainer.current, { childList:true, subtree:true });
    }, [organizerChatID]);

    return (
        <>
            <div className="chatroom__users">
                <div className="chatroom__users-organizer" ref={$chatroomUsersOrganizer} />
                <div className="chatroom__users-participants" ref={$chatroomUsersParticipants} />
            </div>
            <div className="chatroom__chatContainer">
                <div className="chatroom__localTracks" ref={$localTracksContainer}/>
                <div className="chatroom__remoteTracks" ref={$remoteTracksContainer}/>
            </div>
        </>
    );

    function onDisplayNameChange(id, displayName) {
        if ( usersList.find(item => item.name === displayName).id === chat.organizer ) {
            setOrganizerChatID(id ? id : 'local');
        }
    }

    function onRemoteAdded() {
        makeVideoMain();
    }

    function makeVideoMain() {
        if ( organizerChatID ) {
            if ( organizerChatID === 'local' ) {
                const video = $localTracksContainer.current.querySelector('video');

                if ( video ) {
                    video.classList.add('main-video');
                }
            }
            else {
                const video = $remoteTracksContainer.current.querySelector(('#video' + organizerChatID));

                if ( video ) {
                    video.classList.add('main-video');
                }
            }
        }
    }
}