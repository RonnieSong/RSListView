import React, { Component, PropTypes } from 'react';
import { ListView, ScrollView } from 'react-native';
import RSListViewCell from './RSListViewCell';
var isEmpty = require('isEmpty');
var merge = require('merge');

const PrivateMethods = {
  captureReferenceFor(cellData, sectionId, rowId, row) {
    if (cellData[sectionId] === undefined) {
      cellData[sectionId] = {};
    }

    cellData[sectionId][rowId] = row;
  },

  updateCellsVisibility(cellData, changedRows) {
    for (const section in changedRows) {
      if (changedRows.hasOwnProperty(section)) {
        const currentSection = changedRows[section];

        for (const row in currentSection) {
          if (currentSection.hasOwnProperty(row)) {
            const currentCell = cellData[section][row];
            const currentCellVisibility = currentSection[row];

            // 更改 cell 的可见状态
            if (currentCell && currentCell.setVisibility) {
              currentCell.setVisibility(currentCellVisibility);
            }
          }
        }
      }
    }
  },
};

export default class RSListView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visibility: true,
    }
    this._visibleRows = {};
  }

  static propTypes = {

    ...ListView.propTypes,

    renderScrollComponent: React.PropTypes.func,

    onChangeVisibleRows: React.PropTypes.func,

    onScroll: React.PropTypes.func,

    premptiveLoading: PropTypes.number,
  }

  getDefaultProps() {
    return {
      premptiveLoading: 2,
    };
  }

  componentWillMount() {
    this.cellData = {
      lastVisibleRow: 0,
    };
  }

  visibleRowsResult(visibleRows, changedRows) {

    PrivateMethods.updateCellsVisibility(this.cellData, changedRows);

    if (this.props.onChangeVisibleRows) {
      this.props.onChangeVisibleRows(visibleRows, changedRows);
    }
  }

  getNativeListView() {
    return this.refs.nativeListView;
  }

  getScrollResponder() {
    return this.refs.nativeListView.getScrollResponder();
  }

  scrollTo(...args: Array<any>) {
    return this.refs.nativeListView.scrollTo(...args);
  }

  calculateVisibaleRows(updatedFrames?: Array<Object>) {

    let isVertical = !this.props.horizontal;
    let dataSource = this.props.dataSource;
    let visibleMin = this.refs.nativeListView.scrollProperties.offset;
    let visibleMax = visibleMin + this.refs.nativeListView.scrollProperties.visibleLength;
    let allRowIDs = dataSource.rowIdentities;

    let header = this.props.renderHeader && this.props.renderHeader();
    let totalIndex = header ? 1 : 0;
    let visibilityChanged = false;
    let changedRows = {};
    for (var sectionIdx = 0; sectionIdx < allRowIDs.length; sectionIdx++) {
      var rowIDs = allRowIDs[sectionIdx];
      if (rowIDs.length === 0) {
        continue;
      }
      var sectionID = dataSource.sectionIdentities[sectionIdx];
      if (this.props.renderSectionHeader) {
        totalIndex++;
      }
      var visibleSection = this._visibleRows[sectionID];
      if (!visibleSection) {
        visibleSection = {};
      }
      for (var rowIdx = 0; rowIdx < rowIDs.length; rowIdx++) {
        var rowID = rowIDs[rowIdx];
        var frame = this.refs.nativeListView._childFrames[totalIndex];
        totalIndex++;
        if (this.props.renderSeparator &&
           (rowIdx !== rowIDs.length - 1 || sectionIdx === allRowIDs.length - 1)){

          var separator = this.props.renderSeparator(
            sectionID,
            rowID,
          );
          if (separator) {
            totalIndex++;
          }
        }
        if (!frame) {
          break;
        }
        var rowVisible = visibleSection[rowID];
        var min = isVertical ? frame.y : frame.x;
        var max = min + (isVertical ? frame.height : frame.width);
        if ((!min && !max) || (min === max)) {
          continue;
        }
        if (min > visibleMax || max < visibleMin) {
          if (rowVisible) {
            visibilityChanged = true;
            delete visibleSection[rowID];
            if (!changedRows[sectionID]) {
              changedRows[sectionID] = {};
            }
            changedRows[sectionID][rowID] = false;
          }
        } else if (!rowVisible) {
          visibilityChanged = true;
          visibleSection[rowID] = true;
          if (!changedRows[sectionID]) {
            changedRows[sectionID] = {};
          }
          changedRows[sectionID][rowID] = true;
        }
      }
      if (!isEmpty(visibleSection)) {
        this._visibleRows[sectionID] = visibleSection;
      } else if (this._visibleRows[sectionID]) {
        delete this._visibleRows[sectionID];
      }
    }
    visibilityChanged && this.visibleRowsResult(this._visibleRows, changedRows);
  }

  onChangeVisibleRows(visibleRows, changedRows) {
    console.log(changedRows);
  }

  onScroll(event) {
    this.calculateVisibaleRows(event.nativeEvent.updatedChildFrames);
    this.props.onScroll && this.props.onScroll(event);
  }

  onContentSizeChange(width, height) {
    this.calculateVisibaleRows();
    this.props.onContentSizeChange && this.props.onContentSizeChange(width, height);
  }

  onLayout(event) {
    this.calculateVisibaleRows();
    this.props.onLayout && this.props.onLayout(event);
  }

  renderScrollComponent(props) {
    let component;

    if (props.renderScrollComponent) {
      component = props.renderScrollComponent(props);
    } else {
      component = (
        <ScrollView {...props} />
      );
    }

    return component;
  }

  renderRow(rowData, sectionID, rowID) {

    const view = this.props.renderRow(rowData, sectionID, rowID);

    return (
      <RSListViewCell
        usersView={view}
        ref={(row) => {
          PrivateMethods.captureReferenceFor(this.cellData, sectionID, rowID, row);
        }} />
    );
  }

  render() {
    return (
      <ListView
        {...this.props}
        ref="nativeListView"
        renderScrollComponent={this.renderScrollComponent.bind(this)}
        renderRow={this.renderRow.bind(this)}
        onScroll={this.onScroll.bind(this)}
        onContentSizeChange={this.onContentSizeChange.bind(this)}
        onLayout={this.onLayout.bind(this)}
        onChangeVisibleRows={this.onChangeVisibleRows.bind(this)} />
    );
  }
}
