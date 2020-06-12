import throttle from 'lodash/throttle'
import isTouchDevice from 'is-touch-device'
import {addWheelListener, removeWheelListener} from 'wheel'
const isDesktop = !isTouchDevice()

const myScroll = (function(){ //Function that checks the speed of scrolling
  var last_position, new_position, timer, delta, delay = 50; 
  function clear() {
      last_position = null;
      delta = 0;
  }
  
  clear();
  return function(){
      new_position = window.scrollY;
      if ( last_position != null ){
          delta = new_position -  last_position;
      }
      last_position = new_position;
      clearTimeout(timer);
      timer = setTimeout(clear, delay);
      return delta;
  };
})();

/**
 * References
 *  => original https://www.npmjs.com/package/exit-intent
 *  => some tips https://www.thepolyglotdeveloper.com/2018/11/using-exit-intent-listener-manage-popups-page/
 */
export default function ExitIntent (options = {}) {
  const defaultOptions = {
    debug: false,
    maxDisplays: 99999,
    eventThrottle: 200,
    showAfterInactiveSecondsDesktop: 60,
    showAfterInactiveSecondsMobile: 40,
    showAgainAfterSeconds: 10,
    onExitIntent: () => {}
  }
  const config = {...defaultOptions, ...options}
  let cleared = false;
  const log = (...args) => {
    if (config.debug) {
      console.log('[exit-intent-mobile]', ...args)
    }
  }
  // ===========================
  // TRIGGER INTEND
  // ... DISPLAY (only maxDisplays-times)
  let displays = 0
  const doDisplay = () => {
    if (!cleared && displays < config.maxDisplays) {
      displays++
      log('display onExitIntent', displays)
      config.onExitIntent()
      if (displays >= config.maxDisplays) {
        removeEvents()
      }
    }
  }
  // ... LIMIT display to `config.showAgainAfterSeconds` to make sure that we do NOT bug the user too often
  const display = throttle(doDisplay, config.showAgainAfterSeconds * 1000, {
    trailing: false
  })
  // ===========================
  // EVENT LISTENERS
  // DESKTOP: MOUSEOUT event
  const onMouse = (e) => {
    if (!(e instanceof MouseEvent)) {
      return;
    }
    
    if (
      e.clientY < 50 &&
      e.relatedTarget == null &&
      e.target.nodeName.toLowerCase() !== 'select') {
        log('mouseout')
        display()
    }
  }
  let onMouseLeaveListener
  if (isDesktop) {
    log('register mouseleave for desktop')
    onMouseLeaveListener = document.body.addEventListener(
      'mouseout',
      throttle(onMouse, config.eventThrottle),
      false
    )
  }
  // ===========================
  // TIMEOUT (show exit-intend AFTER timeout)
  const timeoutOnDevice = isDesktop
    ? config.showAfterInactiveSecondsDesktop
    : config.showAfterInactiveSecondsMobile
  log('timeoutOnDevice', timeoutOnDevice)
  let timer
  const restartTimer = () => {
    if (typeof timeoutOnDevice === 'undefined') {
      log('display disabled')
      return
    }
    if (timer !== undefined) {
      log('clearTimeout()')
      window.clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      log('display after timeout')
      display()
    }, timeoutOnDevice * 1000)
  }
  restartTimer() // start initial timer
  // ===========================
  // LISTENERS FOR `restartTimer()`
  const listeners = [] // array to store listeners
  const registerEvent = (event, target) => {
    log('registering event for restartTimer', event, target)
    
    const defaultCB = throttle(event => {
      log('throttled listener', event)
      restartTimer()
    }, config.eventThrottle);
    let cb = null;
    if(event === 'scroll') {
      cb = function(e) {
        if(myScroll() < -200) {
          log('scroll')
          display();    
        }
        defaultCB(e);
      }
    } else if(event === 'mousemove') {
      cb = function(e) {
        if(e.clientY < 50) {
          log('intent-to-leave')
          display();
        } 
        defaultCB(e);
      } 
    }
    else {
      cb = defaultCB;
    }
    const listener = target.addEventListener(
      event,
      cb,
      false
    );
    listeners.push({event, listener, target})
    return listener
  }
  if (isDesktop) {
    registerEvent('scroll', window)
    registerEvent('mousemove', window)
    addWheelListener(window, event => {
      throttle(event => {
        log('throttled wheel listener', event)
        restartTimer()
      }, config.eventThrottle)
    })
  }
  if (isTouchDevice) {
    registerEvent('touchstart', document.body);
    registerEvent('touchend', document.body);
    registerEvent('touchmove', document.body);
    registerEvent('scroll', window);

  }
  // ===========================
  // CLEANUP
  const removeEvents = () => {
    log('removeEvents', displays)
    cleared = true;
    if (onMouseLeaveListener) {
      document.body.removeEventListener('mouseleave', onMouseLeaveListener)
      removeWheelListener(window, () => {
        log('removeWheelListener')
      })
    }
    listeners.forEach(theListener => {
      const {event, listener, target} = theListener
      target.removeEventListener(event, listener)
    })
  }
  return removeEvents
}
