
import React, { Component } from 'react'
import { SocketManager } from '../../../utils/SocketManager'
import { Button, Modal } from 'antd'
import GameItem from './GameItem'
import { withRouter } from "react-router-dom";


class GamesModal extends Component {

    socket = new SocketManager()

    state = {
        isConnected: false,
        isConnecting: true,
        games: []
    }

    history;

    constructor(props) {
        super(props);
        this.history = props.history;
    }

    componentWillUnmount() {
        this.socket.disconnectList()
    }

    componentDidMount() {
        this.socket.connectList(() => {
            this.setState({
                ...this.state,
                isConnecting: false,
                isConnected: true
            })
        })
 
        this.socket.onList('init', payload => {
            this.setState({
                ...this.state,
                games: payload.games
            })
        })

        this.socket.onList('added', payload => {
            this.setState({
                ...this.state,
                games: [
                    ...this.state.games,
                    payload.game
                ]
            })
        })

        this.socket.onList('updated', payload => {
            const game = payload.game;

            this.setState({
                ...this.state,
                games: this.state.games.map(g => g.id === game.id ? game : g)
            })
        })

        this.socket.onList('removed', payload => {
            this.setState({
                ...this.state,
                games: this.state.games.filter(g => g.id !== payload.gameId)
            })
        })
    }

    onJoin = (game) => {
        this.history.push('/game?id=' + game.id);
    }

    render() {
        return (
            <div>
                <Modal
                    title="Available Games"
                    visible={true}
                    onCancel={this.props.onHide}
                    footer={[
                        <Button key="back" onClick={this.props.onHide}>
                            Hide
                    </Button>,
                    ]}
                >


                    <div className='games-holder'>
                        {
                            this.state.games.length === 0 ? <span className='games-heading'>No Games found!</span> : null
                        }
                    {
                        this.state.games.map((game, i) => <GameItem onJoin={this.onJoin} game={game} key={i}></GameItem>)
                    }
                    </div>

                </Modal>
            </div>
        )
    }
}


export default withRouter(GamesModal)
