import React, { useEffect, useContext, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {fetchChat, setChatStart, setStopChat, discardChat, setOnACall} from "../../redux/actions/eventsActions";
import {Link, withRouter} from 'react-router-dom';
import userContext from '../../context/userContext';
import Fullscreen from 'react-full-screen';
import siteSettingsContext from "../../context/siteSettingsContext";
import ChatContainer from "./ChatContainer";
import ringing from "../../sounds/ringing.mp3";
import './quickCall.scss';
import classNames from 'classnames';

function ChatWidget({location, events, usersList, fetchChat, chat, setChatStart, setStopChat, discardChat, onACall, setOnACall}) {
    const { user } = useContext(userContext);
    const { translate } = useContext(siteSettingsContext);
    const [ isFullScreen, setIsFullScreen ] = useState(false);
    const [ isChatPage, setIsChatPage ] = useState(false);
    const [ caller, setCaller ] = useState(null);

    useEffect(() => {
        setIsChatPage(!!getChatID());
    }, [location]);

    useEffect(() => {
        if ( chat && chat.organizer === user.id ) {
            setOnACall(true);
        }
        if ( onACall && (!chat || (chat && !chat.started)) ) {
            setOnACall(false);
        }
    }, [chat, location]);

    useEffect(() => {
        if ( events.length ) {
            if ( getChatID() ) {
                fetchChat(getChatID(), user.id);
            }
            if ( checkForActiveChat() ) {
                fetchChat(checkForActiveChat(), user.id);
            }
            if ( !checkForActiveChat() && !getChatID() ) {
                discardChat();
            }
        }
    }, [events, location]);

    useEffect(() => {
        if ( chat && chat.started && usersList ) {
            setCaller(usersList.find(item => item.id === chat.organizer));
        }
    }, [chat, usersList]);

    if ( chat ) {
        if ( chat.started ) {
            if ( onACall ) {
                return _renderChatBox();
            }
            else {
                return _renderCallBox();
            }
        }
        else {
            return _renderStoppedChatActions();
        }
    }
    else {
        return null;
    }

    function _renderChatBox() {
        return (
            <div className={classNames('chatroom__box', {fixed: !isChatPage, isOrganizer: chat.organizer === user.id })}>
                <div className="chatroom__allow">
                    { translate('allow_audio_and_video') }
                </div>
                <Fullscreen enabled={isFullScreen}>
                    <div className={classNames('chatroom__chatHolder', { isFullscreen: isFullScreen })}>
                        <ChatContainer chat={chat} usersList={usersList}/>
                        { _renderStartedChatActions() }
                    </div>
                </Fullscreen>
            </div>
        );
    }

    function _renderCallBox() {
        return (
            <div className="quickCall">
                <div className="quickCall__overlay"/>
                <div className="quickCall__info">
                    {
                        caller ?
                            <span className="quickCall__name">{ caller.name } { translate('is_calling') }</span>
                            :
                            null
                    }
                    <span className="btn btn__success round ringing" onClick={() => setOnACall(true)}>
                        <div className="btn__before"/>
                        <i className="fas fa-phone"/>
                    </span>
                </div>
                <audio autoPlay={true} loop={true}>
                    <source src={ringing}/>
                </audio>
            </div>
        );
    }

    function _renderStartedChatActions() {
        return (
            <div className="chatroom__btnsHolder">
                <span className="btn btn_primary round" onClick={() => setIsFullScreen(!isFullScreen)}><i className="fas fa-compress" /></span>
                {
                    !isChatPage ?
                        <Link to={'/chat/' + chat.id} className="btn btn_primary round">
                            <i className="fa fa-link" />
                        </Link>
                        :
                        null
                }
                {
                    user.id === chat.organizer ?
                        <span className="btn btn__error round" onClick={stopChat}><i className="fas fa-phone-slash" /></span>
                        :
                        null
                }
            </div>
        );
    }

    function _renderStoppedChatActions() {
        if ( user.id === chat.organizer ) {
            return (
                <>
                    <div className="chatroom__message-holder">
                        <div className="chatroom__info">
                            <span>
                                <i className="fas fa-eye-slash"/>
                                { translate('you_can_start_chat') }
                            </span>
                        </div>
                    </div>
                    <div className="chatroom__btnsHolder">
                        <span className="btn btn__success round" onClick={startChat}><i className="fas fa-phone" /></span>
                    </div>
                </>
            )
        }
        else {
            return (
                <div className="chatroom__message-holder">
                    <div className="chatroom__info">
                        <span>
                            <i className="fas fa-eye-slash"/>
                            { translate('chat_will_start_soon') }
                        </span>
                    </div>
                </div>
            );
        }
    }

    function startChat() {
        setOnACall(true);
        setChatStart(chat.id, true);
    }

    function stopChat() {
        setStopChat(chat.id);
    }

    function getChatID() {
        if ( location.pathname.includes('/chat/') ) {
            return location.pathname.replace('/chat/', '');
        }
        return null;
    }

    function checkForActiveChat() {
        return events.find(eventItem => eventItem.started === true && (eventItem.organizer === user.id || eventItem.participants.indexOf(user.id) !== -1)) ? events.find(eventItem => eventItem.started === true && (eventItem.organizer === user.id || eventItem.participants.indexOf(user.id) !== -1)).id : null;
    }
}

const mapStateToProps = state => {
    return {
        events: state.eventsReducer.events,
        usersList: state.usersReducer.usersList,
        chat: state.eventsReducer.chat,
        onACall: state.eventsReducer.onACall
    }
};

const mapDispatchToProps = dispatch => {
    return {
        fetchChat: (chatID, userID) => dispatch(fetchChat(chatID, userID)),
        setChatStart: (chatID, setStarted) => dispatch(setChatStart(chatID, setStarted)),
        setStopChat: (chatID) => dispatch(setStopChat(chatID)),
        discardChat: () => dispatch(discardChat()),
        setOnACall: (value) => dispatch(setOnACall(value))
    }
};

export default compose(connect(mapStateToProps, mapDispatchToProps)(withRouter(ChatWidget)));