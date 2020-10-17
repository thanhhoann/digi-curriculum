import React, { Component } from 'react';
import { Checkbox } from '@material-ui/core';

class CourseHeaderItem extends Component {
  render() {
    return (
      <div
        style={{
          width: '20px',
          height: '170px',
          display: 'flex',
          flexDirection: 'column',
          margin: `1px ${this.props.index % 5 === 0 ? 5 : 1}px 1px ${this.props.index % 5 === 1 ? 5 : 1}px`,
          justifyContent: 'flex-end',
        }}
      >
        <div
          style={{
            width: '180px',
            height: '20px',
            transform: 'rotate(-60deg) translate(42px, -69px)',
            fontSize: '10px',
            color: this.props.isSelected ? 'black' : 'grey',
            fontWeight: this.props.isSelected ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          {this.props.name.length <= 31 ? this.props.name : `${this.props.name.substring(0, 31)}...`}
        </div>
        <Checkbox defaultChecked={this.props.isSelected} style={{ color: '#007FFF', margin: '0px', padding: '0px' }} size="small" />
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: this.props.backgroundColor,
            color: this.props.color ?? 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '1px 0px',
          }}
        >
          {this.props.averageScore}
        </div>
        <div
          style={{
            width: '20px',
            height: '20px',
            color: this.props.color ?? 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '5px 0px -5px 0px',
          }}
        >
          <svg width="20px" height="20px" fill="#CCCCCC">
            <circle r={3} cx={10} cy={10} />
          </svg>
        </div>
      </div>
    );
  }
}

export default CourseHeaderItem;
