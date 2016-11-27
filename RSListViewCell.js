import React, { Component, PropTypes } from 'react';
import { View } from 'react-native';

export default class RSListViewCell extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visibility: true,
    }
    this.viewProperties = {
      width: 0,
      height: 0,
    };
  }

  static propTypes = {
    usersView: PropTypes.element.isRequired,
  }

  onLayout(evt) {

    this.viewProperties.width = evt.nativeEvent.layout.width;
    this.viewProperties.height = evt.nativeEvent.layout.height;
  }

  setVisibility(visibility) {
    if (this.state.visibility == visibility) {
      return;
    }

    if (visibility == true) {
      this.setState({ visibility: true });
    } else {
      this.setState({ visibility: false });
    }
  }

  render() {
    if (this.state.visibility === false) {
    }
    if (this.state.visibility === false) {
      return (
        <View style={{ width: this.viewProperties.width, height: this.viewProperties.height }} />
      );
    }

    return (
      <View onLayout={this.onLayout.bind(this)}>
        {this.props.usersView}
      </View>
    );
  }
}
