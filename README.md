test-react-devtools
===

This is a test Electron app to demonstrate issues with using React DevTools in combination with a custom scheme.

The app can run in two different modes:

1) Loading content over http (using the Webpack dev server)

![](./screenshots/Screen Shot 2022-07-17 at 3.03.20 PM.png)

2) Loading content over a custom `local-scheme` URL

![](./screenshots/Screen Shot 2022-07-17 at 3.08.48 PM.png)

To switch between the two modes, locate and change the `TEST_LOCAL_SCHEME` constant in `src/indes.ts`

Observations:
--

### Content Scripts

React DevTools uses a contentScript to inject a `__REACT_DEVTOOLS_GLOBAL_HOOKS__` variable.

![](./screenshots/Screen Shot 2022-07-17 at 3.04.06 PM.png)

When using a local scheme that variable isn't injected, which implies that the content script isn't running

![](./screenshots/Screen Shot 2022-07-17 at 3.09.30 PM.png)

### Background Scripts

React DevTools uses a background script to do some additional coordination (I haven't dug into the details). I *think* this shows up in devtools as an additional context in the Console.

![](./screenshots/Screen Shot 2022-07-17 at 3.03.44 PM.png)

However, under the custom scheme that script doesn't appear to be loaded

![](./screenshots/Screen Shot 2022-07-17 at 3.09.04 PM.png)

Running App
---

```
yarn install
yarn start

# change TEST_LOCAL_SCHEME value to test other setup...

yarn start
```
