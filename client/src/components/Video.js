// @flow

import React from 'react';
import { InlineBlock } from 'jsxstyle';

export class Video extends React.Component {
  videoElement: HTMLVideoElement;
  state: { paused: boolean };

  constructor(props: {src: string, currentTime: number, onSeeked: ?Function}) {
    super(props);
    this.state = {
      paused: true,
    };
  }
  componentDidMount() {
    this.videoElement.currentTime = this.props.currentTime || 0;
  }
  componentDidUpdate() {
    this.videoElement.currentTime = this.props.currentTime || 0;
  }
  onClick = () => {
    this.setState({ paused: !this.videoElement.paused });
    this.videoElement.paused ? this.videoElement.play() : this.videoElement.pause();
  }
  onSeeked = () => {
    if (this.props.onSeeked)
      this.props.onSeeked(this.videoElement.currentTime);
  }
  render() {
    return (
      <InlineBlock position="relative" cursor="pointer" {...this.props}>
        <video preload="metadata" style={{width:'100%'}} seeked={this.onSeeked}
              onClick={this.onClick} ref={c => this.videoElement = c}>
          <source src={this.props.src} type='video/mp4'/>
        </video>
        { this.state.paused
          ? <input type="image" src="/play.png" style={{position: 'absolute', left: '50%', top: '50%', margin: '-36px', pointerEvents: 'none'}} />
          : null }
      </InlineBlock>
    );
  }
}