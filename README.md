# Exit Intent (Desktop + Mobile)

[![version][version]](http://npm.im/exit-intent)
[![MIT License][MIT License]](http://opensource.org/licenses/MIT)
[![Standard][Standard]](http://standardjs.com)
[![Standard Version][Standard Version]](https://github.com/conventional-changelog/standard-version)
[![Size][Size]](https://unpkg.com/exit-intent)
[![Size gzip][Size gzip]](https://unpkg.com/exit-intent)

Exit intent detection library. INCLUDING support for mobile and timeout.

**DESKTOP-behaviour:**
 => trigger intent if mouse leaves body ('mouseleave'-event)
 => trigger after user has been inactive for `showAfterInactiveSeconds` seconds

**MOBILE-behaviour:**
=> trigger ONLY after user has been inactive for `showAfterInactiveSeconds` seconds

## Usage

```js
import exitIntent from 'exit-intent-mobile'

// Initialise
const removeExitIntent = exitIntent({
  maxDisplays: 99999,             // default 99999
  eventThrottle: 100,             // default 200
  showAfterInactiveSeconds: 60,   // default 60
  onExitIntent: () => {
    console.log('exit-intent triggered')
  }    
})

// Destroy
removeExitIntent()
```

### Options

`maxDisplays` (default 99999)  
maximum number of times to trigger.

`eventThrottle` (default 200)  
event throttle in milliseconds.

`onExitIntent` (default no-op function)  
function to call when an exit intent has been detected.

`showAfterInactiveSeconds` (default 60 seconds)
If user does NOT move mouse or scroll for nr of seconds, `onExitIntent`-function will be called. Useful for mobile, where mouseleave does NOT exist.

### License

MIT

[version]: https://img.shields.io/npm/v/exit-intent.svg
[MIT License]: https://img.shields.io/npm/l/exit-intent.svg
[Standard]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[Standard Version]: https://img.shields.io/badge/release-standard%20version-brightgreen.svg
[Size]: https://badges.herokuapp.com/size/npm/exit-intent
[Size gzip]: https://badges.herokuapp.com/size/npm/exit-intent?gzip=true

originally based on https://github.com/danhayden/exit-intent (and https://github.com/richriscunha/Exitent)
