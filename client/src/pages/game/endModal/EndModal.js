
import React from 'react'
import { Modal } from 'antd';
import { useHistory } from 'react-router-dom'

export default function EndModal(props) {
    let history = useHistory();

    const { you, other } = props;

    const handleCancel = () => {
        history.push('/')
    }

    const handleOk = () => {
        alert('The re-match feature has yet to be implemented!')
    }

    // on-fence -> one clicked
    return (
        <Modal
            title={"You " + (you.score > other.score ? 'won!' : 'lost!')}
            visible={true}
            onOk={handleOk}
            onCancel={handleCancel}
            okText='Re-match!'
            cancelText='Go Home'
        >

            <div className='re-match'>
                <span className='title'>Re-match? <span>(25s)</span></span>
                <div className='indicators'>
                    <div className='indicator on'></div>
                    <div className='indicator'></div>
                </div>
            </div>

        </Modal>
    )
}

