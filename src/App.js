import React from 'react'
import './App.css'

class Video extends React.Component {
  constructor(props) {
    super(props)
    this.autoPlay = props.autoPlay ? props.autoPlay : false
    this.vidTime = this.props.vidTime ? this.props.vidTime : 0
    this.vidRef = this.props.vidRef ? this.props.vidRef : React.createRef()
  }

  render = () => {
    return (
      <video
        id={this.props.id}
        ref={this.vidRef}
        autoPlay={this.autoPlay}
        muted={this.autoPlay}
      >
        <source src={this.props.source} type="video/mp4" />
      </video>
    )
  }
}


class App extends React.Component {
  constructor(props) {
    super(props)
    this.vidRef = React.createRef()
  }

  componentDidMount = () => {
    document.addEventListener('keydown', this.handleSkillTrigger)
  }

  handleSkillTrigger = (e) => {
    if(e.key === 'e') {
      this.vidRef.current.currentTime = 4.45
    }
  }

  render() {
    return (
      <div>
        <Video 
          id="mainVideo"
          vidRef={this.vidRef}
          source="testVid.mp4"
          autoPlay={true}
        />
      </div>
    )
  }
}

export default App;
