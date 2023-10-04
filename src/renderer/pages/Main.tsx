import { Link } from 'react-router-dom';

function Main() {
  return (
    <div style={{ backgroundColor: 'white' }}>
      <div>
        <Link to="/pet">jump to pet</Link>
      </div>
      <div>
        <Link to="/petDetail">jump to petDetail</Link>
      </div>
      <div>
        <Link to="/chatgpt">jump to chatgpt</Link>
      </div>
      <div>
        <Link to="/setting">jump to setting</Link>
      </div>
    </div>
  );
}

export default Main;
