import React from 'react';
import ReactDOM from 'react-dom';
import { App, mainAppFunctions, tutorFunctions } from './App';
import reportWebVitals from './reportWebVitals';

class MainController extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isShowingTutorial: true
    }
  }

  launchApp = () => {
    this.setState({ isShowingTutorial: false })
    this.forceUpdate()
  }

  render() {
    let tutorFuncs = { ...tutorFunctions, nextRoundFunc: this.launchApp.bind(this) }
    if (this.state.isShowingTutorial) {
      return <App {...tutorFuncs} />
    } else {
      return <App {...mainAppFunctions} />
    }
  }
}

ReactDOM.render(
  <React.StrictMode>
    <MainController />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
