
import React, { useState } from 'react'
import { Button, message } from 'antd'
import axios from 'axios'
import { EndpointManager } from '../../utils/EndpointManager';
import { useHistory } from 'react-router-dom'
import CreateModal from './createModal/CreateModal'
import './Home.scss';
import GamesModal from './gamesModal/GamesModal';


export default function Home(props) {
    let history = useHistory();

    const [state, setState] = useState({
        isVisible: false,
        isLoading: false,
        showGamesList: false
    })

    const createGame = () => {
        setState({
            ...state,
            isVisible: true
        })
    }

    const onHide = () => {
        setState({
            ...state,
            isLoading: false,
            isVisible: false
        })
    }

    const onSubmit = (val) => {
        setState({
            ...state,
            isLoading: true
        })

        axios.post(EndpointManager.CREATE_GAME, val).then(v => {
            history.push('/game?id=' + v.data.id);
        }).catch(e => {
            message.error('Could not create game!');
            setState({
                ...state,
                isLoading: false
            })
        })
    }

    const onShowGamesList = () => {
        setState({
            ...state,
            showGamesList: true
        })
    }

    const onHideGamesList = () => {
        setState({
            ...state,
            showGamesList: false
        })
    }

    //     const { onHide, onSubmit, isVisible, isLoading } = props;


    return (
        <div className='home outer-part'>
            <div className='center-part'>
                <h2 className='heading'><span>React</span>-ion Game</h2>

                <div className='button-container'>
                    <Button onClick={createGame} type='primary' className='create-button' size='large'>Create Game</Button>
                    <Button onClick={onShowGamesList} className='find-button' size='large'>Find</Button>
                </div>
            </div>


            <CreateModal onHide={onHide} onSubmit={onSubmit} isVisible={state.isVisible} isLoading={state.isLoading}></CreateModal>
            {state.showGamesList ? <GamesModal onHide={onHideGamesList}></GamesModal> : null}

        </div>
    )
}

