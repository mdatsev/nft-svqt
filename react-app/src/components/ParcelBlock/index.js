import React, { useEffect, useState } from 'react';

import { Modal, Button, Header, Icon } from 'semantic-ui-react';
import { mint } from '../../services/ether-api';
import Confetti from 'react-confetti';
import _ from 'lodash';

import './index.css';

const hoveredStyle = {
    display: 'inline-block',
    backgroundColor: '#fff',
    boxShadow: '0px 0px 80px 40px #0ff',
    position: 'relative',
    maxWidth: '80px',
    height: '80px',
    zIndex: 999,
}

const unhoveredStyle = {
    display: 'inline-block',
    maxWidth: '80px',
    height: '80px',
    zIndex: 1,
}

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}


const mintedByMeStyle = { padding: 0, margin: '0%', width: '80px', height: '80px', display: 'inline', borderStyle: 'solid', borderWidth: '1px', borderColor: 'green' }
const mintedStyle = { padding: 0, margin: '0%', width: '80px', height: '80px', display: 'inline' }
const unmintedStyle = { padding: 0, margin: '0%', width: '80px', height: '80px', display: 'inline', opacity: '90%' }

const ParcelBlock = ({ x, y, wallet, parcelInfo, world }) => {

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [windowSize, setWindowSize] = React.useState();

    const [isHovering, setIsHovering] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [confetti, setConfetti] = React.useState(false);


    const isMintedByMe = (x, y) => {
        console.log(world[x][y].owner, wallet);
        console.log(!world)
        if (!world) return false;
        console.log(world[x][y].owner == wallet)
        if (world[x][y]) return world[x][y].owner.toLowerCase() == wallet.toLowerCase();
    }

    const isNotMinted = (x, y) => {
        if (!world) return true;
        if (!world[1]) return true;
        return world[x][y].owner == '0x0000000000000000000000000000000000000000'
    }

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
                    width={windowDimensions.width / 2}
                    height={windowDimensions.height / 2}
                    style={{ position: 'absolute', top: '0', left: '0' }}
                /> :
                null}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                {isNotMinted(x, y) ?
                    <>
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
                    </>
                    :
                    isMintedByMe(x, y) ?
                        <>
                            <Header content={`Parcel coordinates - x: ${x} y: ${y}`} />
                            <Modal.Content>
                                <p>
                                    Welcome to your property!
                                </p>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button color='red' onClick={() => setModalOpen(false)}>
                                    Close
                                </Button>
                                <Button color='green' onClick={() => {
                                    //update image here
                                }}>
                                    Save Changes
                                </Button>
                            </Modal.Actions>
                        </>
                        :
                        <>
                            <Header content={`Parcel coordinates - x: ${x} y: ${y}`} />
                            <Modal.Content>
                                <p>
                                    This is someone else's propety!
                                </p>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button color='red' onClick={() => setModalOpen(false)}>
                                    Close
                                </Button>
                                <Button color='green' onClick={() => {
                                }}>
                                    No action here
                                </Button>
                            </Modal.Actions>
                        </>
                }
            </Modal>
            <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleOnClick} style={isHovering ? hoveredStyle : unhoveredStyle}>
                {isNotMinted(x, y) ?
                    <div style={{
                        backgroundImage: `url(images/tile.jpg)`,
                        backgroundSize: '80px 80px',
                        backgroundRepeat: 'no-repeat',
                        width: '80px',
                        height: '80px',
                        margin: '0px',
                        opacity: '93%'
                    }} />
                    :
                    <div style={{
                        backgroundImage: `${world[x][y].image ? world[x][y].image : 'url(images/tile.jpg)'}`,
                        backgroundSize: '80px 80px',
                        backgroundRepeat: 'no-repeat',
                        width: '80px',
                        height: '80px',
                        margin: '0px',
                    }} >
                        {
                            isMintedByMe(x, y) ?
                                <Icon inverted color='yellow' name='certificate' style={{ position: 'absolute' }} />
                                :
                                <Icon inverted color='black' name='user secret' style={{ position: 'absolute' }} />
                        }
                    </div>
                }

            </span>
        </>
    )
}

export default ParcelBlock;