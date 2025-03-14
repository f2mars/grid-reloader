# About grid-reloader

Simple Omega grid reloader browser extension.\
When Reloader is activated a small "lamp" indicator will appear on the refresh button.\
Lamp indicator has 3 states:

- green - reloader is active and it will work as scheduled
- red - reloader is not active
- orange - the grid is currently reloading (at that moment reloader is stopped and it will reactivate when the data will finaly load)

## Usage

By default it automatically enables on the [scope-items](https://dev.omega365.com/nt/scope-items/) app and starts refreshing the grid every 5 minutees.\
To manually activate or stop the Reloader use right click on the refresh button

## Customization

`autoStart`, `refreshPause` and `lampColors` can be easily customized under the `Parameters to customize` section in the script.

## Fixing issues

By the time has passed the page structure might change and selectors should be updated accordingly.

# Installation

- Add "Tampermonkey" extension to your browser ("User Scripts" for Safari).
- Open extension and navigate to the "Utilities" tab.
- Insert `https://raw.githubusercontent.com/f2mars/grid-reloader/main/script.js` to the "Import from URL" input and click "Install"
