import React from 'react';

import { Image, Modal, Button, Header } from 'semantic-ui-react';
import { mint } from '../../services/ether-api';

import './index.css';

const hoveredStyle = {
    display: 'inline',
    backgroundColor: '#fff',
    boxShadow: '0px 0px 80px 40px #0ff',
    position: 'relative',
    zIndex: 999,
}

const unhoveredStyle = {
    display: 'inline',
    zIndex: 1,
}



const ParcelBlock = ({ x, y }) => {

    const [isHovering, setIsHovering] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);

    const handleMouseEnter = () => {
        setIsHovering(true);
    }

    const handleMouseLeave = () => {
        setIsHovering(false);
    }

    const handleOnClick = () => {
        setModalOpen(true);
    }

    return (
        <>
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <Header content={`Parcel coordinates - x: ${x} y: ${y}`} />
                <Modal.Content>
                    <p>
                        Want to mint?
                    </p>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' onClick={() => setModalOpen(false)}>
                        Close
                    </Button>
                    <Button color='green' onClick={() => {
                        setModalOpen(false);
                        mint(x, y);
                    }}>
                        Mint
                    </Button>
                </Modal.Actions>
            </Modal>
            <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleOnClick} style={isHovering ? hoveredStyle : unhoveredStyle}>
                <Image src='/images/tile.jpg' style={{ padding: 0, margin: '0%', width: '80px', height: '80px', display: 'inline' }} />
            </span>
        </>
    )
}

export default ParcelBlock;