import React, { useEffect, useState } from 'react';

import { Image, Modal, Button, Header } from 'semantic-ui-react';
import { mint } from '../../services/ether-api';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use-window-size';

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

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

const ParcelBlock = ({ x, y }) => {

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [windowSize, setWindowSize] = React.useState();

    const [isHovering, setIsHovering] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [confetti, setConfetti] = React.useState(false);

    const handleMouseEnter = () => {
        setIsHovering(true);
    }

    const handleMouseLeave = () => {
        setIsHovering(false);
    }

    const handleOnClick = () => {
        setModalOpen(true);
    }

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {confetti ?
                <Confetti
                    width={windowDimensions.width/2}
                    height={windowDimensions.height/2}
                    style={{ position: 'absolute', top: '0', left: '0' }}
                /> :
                null}
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
                    <Button color='green' onClick={async () => {
                        setModalOpen(false);
                        if(await mint(x, y)) {
                            setConfetti(true);
                            setTimeout(function () {
                                setConfetti(false);
                            }, 5000);
                        }
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