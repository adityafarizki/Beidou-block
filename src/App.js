import React from 'react'
import './App.css'
import './Modal.css'

export class Video extends React.Component {
  constructor(props) {
    super(props)
    this.autoPlay = props.autoPlay ? props.autoPlay : false
    this.vidTime = this.props.vidTime ? this.props.vidTime : 0
    this.vidRef = this.props.vidRef ? this.props.vidRef : React.createRef()
  }

  render = () => {
    return (
      <video
        className="video"
        ref={this.vidRef}
        autoPlay={this.autoPlay}
        muted={this.autoPlay}
      >
        <source src={this.props.source} type="video/mp4" />
      </video>
    )
  }
}

export class ScoreModal extends React.Component {
  render = () => {
    let headerMsg = ''
    let headerClassName = ''

    if (this.props.isSuccess) {
      headerMsg = 'Congratulation! you pass this round'
      headerClassName = 'modal-header-success'
    } else {
      headerMsg = 'The block failed, Give it another try?'
      headerClassName = 'modal-header-failed'
    }

    return (
      <div className="modal">
        <div className="modal-content">
          <div className={`modal-header ${headerClassName}`}>
            <span className="close">&times;</span>
            <h2>{headerMsg}</h2>
          </div>
          <div className="modal-body" style={{
            'justifyContent': 'space-between',
            display: 'flex',
            'marginTop': '20px'
          }}>
            <button className="modal-button" onClick={() => { this.props.tryAgainFunc() }}>Try Again</button>
            <button className="modal-button" onClick={() => { this.props.nextRoundFunc() }}>Next Round</button>
          </div>
        </div>
      </div>
    )
  }
}


export class App extends React.Component {
  constructor(props) {
    super(props)
    this.vidRef = React.createRef()
    this.state = {
      popupShowing: false,
      currentVideoIdx: 0,
      currentTimeIdx: 0,
      isStageFinished: false,
    }

    this.handleSkillTrigger = (e) => this.props.handleSkillTrigger(this, e)
    this.handleVidTimeUpdate = () => this.props.handleVidTimeUpdate(this)
    this.nextRoundFunc = () => this.props.nextRoundFunc(this)
  }

  setState(stateVar) {
    let state = {
      popupShowing: stateVar.popupShowing == null ? this.state.popupShowing : stateVar.popupShowing,
      currentVideoIdx: stateVar.currentVideoIdx || this.state.currentVideoIdx,
      currentTimeIdx: stateVar.currentTimeIdx || this.state.currentTimeIdx,
      isStageFinished: stateVar.isStageFinished || this.state.isStageFinished
    }

    super.setState(state)
  }

  componentDidMount = async () => {
    await this.instantiate()
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps !== this.props) {
      await this.instantiate()
    }
  }

  instantiate = async () => {
    this.vidsMetaData = await this.getVideosMetadata()
    this.addSkillListener()
    this.addVideoEndListener()
    this.setState({
      popupShowing: false,
      currentVideoIdx: 0,
      currentTimeIdx: 0
    })
    this.vidRef.current.load()
  }

  getVideosMetadata = async () => {
    let response = await fetch(this.props.vidsMetaData)
    response = await response.text()
    return JSON.parse(response)
  }

  addSkillListener = () => {
    document.addEventListener('keydown', this.handleSkillTrigger)
    this.vidRef.current.ontimeupdate = this.handleVidTimeUpdate
  }

  addVideoEndListener = () => {
    this.vidRef.current.onended = this.handleVideoEnd
  }

  handleVideoEnd = () => {
    this.setState({ isStageFinished: true })
    this.showPopup()
  }

  showFailedPopup = () => {
    this.setState({ isStageSuccess: false })
    this.showPopup()
    this.vidRef.current.pause()
  }

  showPopup = () => {
    this.setState({ popupShowing: true })
  }

  retryRound = () => {
    this.setState(
      {
        popupShowing: false
      }
    )
    this.forceUpdate()
    this.vidRef.current.load()
  }

  renderScorePopup = () => {
    if (this.state.popupShowing) {
      return <ScoreModal
        tryAgainFunc={this.retryRound}
        nextRoundFunc={this.nextRoundFunc}
        isSuccess={this.state.isStageSuccess || this.state.isStageFinished}
      />
    }
  }

  render() {
    let videoName = ''
    if (this.vidsMetaData) {
      console.log(this.vidsMetaData)
      console.log(this.state)
      videoName = this.vidsMetaData.videos[this.state.currentVideoIdx].name
    }

    return (
      <div>
        <Video
          id="mainVideo"
          vidRef={this.vidRef}
          source={`/videos/${videoName}`}
          autoPlay={true}
        />
        {this.renderScorePopup()}
      </div>
    )
  }
}

const mainAppHandleSkillTrigger = (context, e) => {
  if (e.key === 'e' && !context.state.isStageFinished) {
    let video = context.vidsMetaData.videos[context.state.currentVideoIdx]
    let time = video['counter_points'][context.state.currentTimeIdx]
    let videoTime = context.vidRef.current.currentTime

    if (time[0] <= videoTime && time[1] >= videoTime) {
      if (context.state.currentTimeIdx < video['counter_points'].lenghth - 1) {
        context.setState({ currentTimeIdx: context.state.currentTimeIdx + 1 })
      } else {
        context.setState({ isStageFinished: true })
      }
    } else {
      context.showFailedPopup()
    }
  }
}

const mainAppHandleVidTimeUpdate = (context) => {
  if (!context.state.isStageFinished) {
    let video = context.vidsMetaData.videos[context.state.currentVideoIdx]
    let time = video['counter_points'][context.state.currentTimeIdx]
    let videoTime = context.vidRef.current.currentTime

    if (videoTime > time[1]) {
      context.showFailedPopup()
    }
  }
}

const mainNextRoundFunc = (context) => {
  context.setState(
    {
      popupShowing: false,
      currentVideoIdx: context.state.currentVideoIdx + 1
    }
  )
  context.vidRef.current.load()
}


const tutorHandleSkillTrigger = (context, e) => {
  if (e.key === 'e' && !context.state.isStageFinished) {
    context.vidRef.current.play()
  }
}


const tutorHandleVidTimeUpdate = (context) => {
  if (!context.state.isStageFinished) {
    let video = context.vidsMetaData.videos[context.state.currentVideoIdx]
    let time = video['counter_points'][context.state.currentTimeIdx]
    let videoTime = context.vidRef.current.currentTime

    if (videoTime < time[1] && videoTime > time[0]) {
      context.vidRef.current.pause()
    }
  }
}


export const mainAppFunctions = {
  handleSkillTrigger: mainAppHandleSkillTrigger,
  handleVidTimeUpdate: mainAppHandleVidTimeUpdate,
  nextRoundFunc: mainNextRoundFunc,
  vidsMetaData: '/videos_metadata.json'
}

export const tutorFunctions = {
  handleSkillTrigger: tutorHandleSkillTrigger,
  handleVidTimeUpdate: tutorHandleVidTimeUpdate,
  vidsMetaData: '/tutorial_video_metadata.json'
}

export default App;
