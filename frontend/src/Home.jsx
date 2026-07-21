import { Link } from 'react-router';
import './styles/home.css';

function Home() {
  return (
    <section className="home">
      <h1>Practice ASL with guided reference material</h1>
      <p className="home__intro">
        VivaSign turns each sign into a short, hands-on practice session with guided
        keyframes, written instructions, and a video demonstration.
      </p>

      <div className="home__instructions">
        <h2>How a practice session works</h2>
        <p>
          Pick the sign you want to practice and start the countdown. VivaSign takes
          one to three keyframe pictures, depending on the sign.
        </p>
        <p>
          Match each position as clearly as possible, focusing on handshape, movement,
          palm orientation, and facial expression.
        </p>
        <p>
          Review the demonstration before you begin, then compare it with your captured
          positions after the last picture. AI feedback is available when configured.
        </p>
      </div>

      <Link className="begin-button" to="/webcam">Begin practicing</Link>
    </section>
  );
}

export default Home;
