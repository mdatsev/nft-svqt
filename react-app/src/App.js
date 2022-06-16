import './App.css';
import Map from './components/Map';
import ParcelBlock from './components/ParcelBlock';
import Header from './components/Header';
import { Container } from 'semantic-ui-react';
import background from "./images/retro-sky.png";

function App() {
  return (
    <div style={{ backgroundImage: `url(${background})`, backgroundSize:'cover', height:'100vh' }}>
      <Header />
      <Map />
    </div>
  );
}

export default App;
