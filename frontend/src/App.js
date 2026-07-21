import { BrowserRouter, Route, Routes } from 'react-router';
import Webcam from './Webcam';
import './App.css';
import Navbar from './Components/Navbar';
import Home from './Home';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/webcam" element={<Webcam />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
