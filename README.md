

# RSListView

RSListView 是彻底解决 react-native 长列表在 iOS 端内存过高问题的 ListView，是对 ListView的封装（参照了SGListView，但SGListView存在的问题是容易丢掉renderRow的视图，RSListView 是 SGListView 的一个改良版本）。

## Usage

在 你的 render 方法里面直接用 RSListView 替换 ListView

Import RSListView

```js
import RSListView from './RSListView/RSListView';
```

将:
```jsx
<ListView ... />
```
替换为:
```jsx
<RSListView ... />
```
例如:
```jsx
<RSListView
        initialListSize={10}
        pageSize={20}
        {...this.props}
        dataSource={this.state.dataSource}
        renderFooter={this.renderFooter}
        onScroll={(e)=>this.onScroll(e)}
        onContentSizeChange={(w, h)=>this.onContentSizeChange(w, h)}
      />
```
