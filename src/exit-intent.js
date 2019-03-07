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
    onExitIntent: () => {}
  }
  const config = {...defaultOptions, ...options}
  let displays = 0
  // DISPLAY (only maxDisplays-times)
  const display = () => {
    if (displays < config.maxDisplays) {
      displays++
      config.onExitIntent()
      if (displays >= config.maxDisplays) {
        removeEvents()
      }
    }
  }
  // MOUSEOUT event (ONLY on DESKTOP)
  const onMouse = () => {
    display()
  }
  const target = document.body
  let onMouseLeaveListener
  if (isDesktop) {
    onMouseLeaveListener = target.addEventListener(
      'mouseleave',
      throttle(onMouse, config.eventThrottle),
      false
    )
  }
  // TIMEOUT event
  let timer
  const timeoutOnDevice = isDesktop
    ? config.showAfterInactiveSecondsDesktop
    : config.showAfterInactiveSecondsMobile
  const restartTimer = () => {
    if (timer) {
      window.clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      display()
    }, timeoutOnDevice * 1000)
  }
  // RESTART TIMER on 'scroll', 'mousemouse' and 'touch'-events (mobile)
  const onScrollListener = window.addEventListener(
    'scroll',
    throttle(restartTimer, config.eventThrottle * 2),
    false
  )
  const onMouseMoveListener = window.addEventListener(
    'mousemove',
    throttle(restartTimer, config.eventThrottle * 2),
    false
  )
  const onTouchListener = window.addEventListener(
    'touchstart',
    throttle(restartTimer, config.eventThrottle * 2),
    false
  )
  timer = restartTimer() // start initial timer
  // CLEANUP
  const removeEvents = () => {
    if (onMouseLeaveListener) {
      target.removeEventListener('mouseleave', onMouseLeaveListener)
    }
    if (onTouchListener) {
      target.removeEventListener('touchstart', onTouchListener)
    }
    window.removeEventListener('scroll', onScrollListener)
    window.removeEventListener('mousemove', onMouseMoveListener)
  }
  return removeEvents
}
