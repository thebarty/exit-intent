import {log} from './tools.js'
import throttle from 'lodash/throttle'
import isTouchDevice from 'is-touch-device'
const isDesktop = !isTouchDevice()
/**
 * References
 *  => original https://www.npmjs.com/package/exit-intent
 *  => some tips https://www.thepolyglotdeveloper.com/2018/11/using-exit-intent-listener-manage-popups-page/
 */
export default function ExitIntent (options = {}) {
  const defaultOptions = {
    maxDisplays: 99999,
    eventThrottle: 200,
    showAfterInactiveSecondsDesktop: 60,
    showAfterInactiveSecondsMobile: 40,
    showAgainAfterSeconds: 10,
    onExitIntent: () => {}
  }
  const config = {...defaultOptions, ...options}
  // ===========================
  // TRIGGER INTEND
  // ... DISPLAY (only maxDisplays-times)
  let displays = 0
  const doDisplay = () => {
    if (displays < config.maxDisplays) {
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
  const onMouse = () => {
    log('mouseleave')
    display()
  }
  let onMouseLeaveListener
  if (isDesktop) {
    log('register mouseleave for desktop')
    onMouseLeaveListener = document.body.addEventListener(
      'mouseleave',
      throttle(onMouse, config.eventThrottle),
      false
    )
  }
  // ===========================
  // TIMEOUT (show exit-intend AFTER timeout)
  let timer
  const timeoutOnDevice = isDesktop
    ? config.showAfterInactiveSecondsDesktop
    : config.showAfterInactiveSecondsMobile
  log('timeoutOnDevice', timeoutOnDevice)
  const restartTimer = () => {
    if (timer) {
      log('restartTimer clearTimeout')
      window.clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      log('display after timeout')
      display()
    }, timeoutOnDevice * 1000)
  }
  timer = restartTimer() // start initial timer
  // ===========================
  // LISTENERS FOR `restartTimer()`
  const listeners = [] // array to store listeners
  const registerEvent = (event, target) => {
    log('registering event for restartTimer', event, target)
    const listener = window.addEventListener(
      event,
      throttle(event => {
        log(event)
        restartTimer()
      }, config.eventThrottle),
      false
    )
    listeners.push({event, listener, target})
    return listener
  }
  if (isDesktop) {
    registerEvent('scroll', window)
    registerEvent('mousemove', window)
  }
  if (isTouchDevice) {
    registerEvent('touchstart', document.body)
    registerEvent('touchend', document.body)
    registerEvent('touchmove', document.body)
  }
  // ===========================
  // CLEANUP
  const removeEvents = () => {
    if (onMouseLeaveListener) {
      document.body.removeEventListener('mouseleave', onMouseLeaveListener)
    }
    listeners.forEach(theListener => {
      const {event, listener, target} = theListener
      target.removeEventListener(event, listener)
    })
  }
  return removeEvents
}
