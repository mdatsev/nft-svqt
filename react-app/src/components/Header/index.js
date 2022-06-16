import React, { useEffect } from 'react';
import { Container, Button, Image, Grid } from 'semantic-ui-react';
import { config } from '../../services/ether-api';


const Header = () => {

    const [wallet, setWallet] = React.useState();

    async function connectWallet() {
        if (!window.ethereum) {
            alert('Please install MetaMask to interact with this feature');
            return;
        }

        let accounts;
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: config.chainId }],
            });
            await new Promise(resolve => setTimeout(resolve, 500));
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWallet(accounts[0].slice(0, 6) + '...' + accounts[0].slice(-3));
            if (window.ethereum.chainId != config.chainId) {
                alert(`Please switch MetaMask network to ${config.chainId}`);
                return;
            }

        } catch (error) {
            if (error.code == -32002) {
                alert('Please open your MetaMask and select an account');
                return;
            } else if (error.code == 4001) {
                alert('Please connect with MetaMask');
                return;
            } else {
                throw error;
            }
        }

        return accounts[0];
    }

    useEffect(() => {
        const fetchAccount = async () => {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWallet(accounts[0].slice(0, 6) + '...' + accounts[0].slice(-3));
        }
        fetchAccount();
    }, []);


    return (
        <Container style={{ paddingTop: '20px' }}>
            <Grid style={{ width: '100%' }}>
                <Grid.Row>
                    <Grid.Column floated='left' style={{ minWidth: '150px' }}>
                        <Image src='/images/nft-world-logo.png' />
                    </Grid.Column>
                    <Grid.Column floated='right' >
                        {wallet ?
                            <span>
                                Welcome, {wallet}
                            </span>
                            :
                            <Button color='green' style={{ minWidth: '100px', marginTop: '50%', marginBottom: '50%' }}
                                onClick={connectWallet}>
                                Log in
                            </Button>
                        }
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    )
}

export default Header;