/* @flow */

import React, {Component, PropTypes} from 'react';
import shallowEqual from 'fbjs/lib/shallowEqual';

function on(target: Object, eventName: string, callback: Function, capture?: boolean): void {
  if (target.addEventListener) {
    target.addEventListener(eventName, callback, capture);
  } else if (target.attachEvent) { // IE8+ Support
    target.attachEvent(`on${eventName}`, () => {
      callback.call(target);
    });
  }
}
function off(target: Object, eventName: string, callback: Function, capture?: boolean): void {
  if (target.removeEventListener) {
    target.removeEventListener(eventName, callback, capture);
  } else if (target.detachEvent) { // IE8+ Support
    target.detachEvent(`on${eventName}`, callback);
  }
}

type Props = {
  children?: React.Element,
  target?: EventTarget,
  [event: string]: Function
};

function forEachListener(
  props: Props,
  iteratee: (eventName: string, listener: Function, capture?: boolean) => any
): void {
  for (const name in props) {
    if (name.substring(0, 2) === 'on' && props[name] instanceof Function) {
      let eventName = name.substring(2).toLowerCase();
      const capture = name.substr(-7).toLowerCase() === 'capture';
      eventName = capture ? eventName.substring(0, eventName.length - 7) : eventName;
      iteratee(eventName, props[name], capture);
    }
  }
}

export default class EventListener extends Component<Props, void> {
  static propTypes = {
    /**
     * You can provide a children too.
     */
    children: PropTypes.node,
    /**
     * The DOM target to listen to.
     */
    target: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.string,
    ]),
  };

  componentDidMount(): void {
    this.addListeners();
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return !shallowEqual(this.props, nextProps);
  }

  componentWillUpdate(): void {
    this.removeListeners();
  }

  componentDidUpdate(): void {
    this.addListeners();
  }

  componentWillUnmount(): void {
    this.removeListeners();
  }

  addListeners(): void {
    const {
      target,
    } = this.props;

    if (target) {
      let element = target;

      if (typeof target === 'string') {
        element = window[target];
      }

      forEachListener(this.props, on.bind(null, element));
    }
  }

  removeListeners(): void {
    const {
      target,
    } = this.props;

    if (target) {
      let element = target;

      if (typeof target === 'string') {
        element = window[target];
      }

      forEachListener(this.props, off.bind(null, element));
    }
  }

  render() {
    return this.props.children || null;
  }
}
