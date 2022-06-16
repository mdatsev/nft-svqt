import React, { useEffect } from 'react';
import { Container, Grid } from 'semantic-ui-react';
import _ from 'lodash';
import ParcelBlock from '../ParcelBlock';
import { getWorld } from '../../services/ether-api';


const TileRow = ({ rowNum, N }) => {

    return (
        <div style={{ marginLeft: '0%', marginRight: '0%' }}>
            {_.times(N, i => <ParcelBlock key={i} x={rowNum} y={i} />)}
        </div>
    )
}

const Map = () => {

    useEffect(() => {
        const world = getWorld();
        console.log(world);
    }, []);


    return (
        <Container>
                <Grid style={{width:'900px', marginLeft:'10%'}}>
                    <Grid.Row style={{ paddingBottom: 0 }}>
                        <Grid.Column style={{ padding: 0, width: '20px' }} />
                        <Grid.Column style={{ width: '800px', padding: '0' }}>
                            {
                                _.times(10, i =>
                                    <div style={{
                                        width: '80px', height: '20px', display: 'inline-block',
                                        borderWidth: '0px 1px 0px 1px',
                                        borderStyle: 'solid solid solid solid',
                                    }} key={i} >
                                        <span style={{ margin: '50%' }}>{i}</span>
                                    </div>)
                            }
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row style={{ paddingTop: 0 }}>
                        <Grid.Column style={{ padding: 0, width: '20px' }}>
                            {
                                _.times(10, i =>
                                    <div style={{
                                        width: '20px', height: '80px', display: 'flex',
                                        borderWidth: '1px 0px 1px 0px',
                                        borderStyle: 'solid solid solid solid',
                                        verticalAlign: 'middle', textAlign: 'center',
                                        lineHeight: '80px', margin: 0
                                    }} key={i} >
                                        {i}
                                    </div>)
                            }
                        </Grid.Column>
                        <Grid.Column style={{ width: '800px', padding: '0' }}>
                            {
                                _.times(10, i =>
                                    <TileRow key={i} rowNum={i} N={10} />)
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
        </Container>
    )
}


export default Map;