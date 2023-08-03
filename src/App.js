import { invoke } from "@tauri-apps/api/tauri";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const doClick = () => {
    invoke("my_function");
    invoke("my_other_function").then(() => invoke("my_function"));
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={doClick}>Press me now</button>
      </header>
    </div>
  );
}

export default App;
