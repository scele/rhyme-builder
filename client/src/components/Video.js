// @flow

import React from 'react';
import { Block } from 'jsxstyle';

export class Video extends React.Component {
  videoElement: HTMLVideoElement;
  state: { paused: boolean };

  constructor(props: {src: string, currentTime: number}) {
    super(props);
    this.state = {
      paused: true,
    };
  }
  componentDidMount() {
    this.videoElement.currentTime = this.props.currentTime;
  }
  componentDidUpdate() {
    this.videoElement.currentTime = this.props.currentTime;
  }
  onClick() {
    this.setState({ paused: !this.videoElement.paused });
    this.videoElement.paused ? this.videoElement.play() : this.videoElement.pause();
  }
  render() {
    return (
      <Block position="relative" cursor="pointer">
        <video preload="metadata" style={{width:300}}
              onClick={this.onClick.bind(this)} ref={c => this.videoElement = c}>
          <source src={this.props.src} type='video/mp4'/>
        </video>
        { this.state.paused
          ? <input type="image" src="/play.png" style={{position: 'absolute', left: '50%', top: '50%', margin: '-36px', pointerEvents: 'none'}} />
          : null }
      </Block>
    );
  }
}