import throttle from 'lodash/throttle'

/**
 * References
 *  => original https://www.npmjs.com/package/exit-intent
 *  => some tips https://www.thepolyglotdeveloper.com/2018/11/using-exit-intent-listener-manage-popups-page/
 */
export default function ExitIntent (options = {}) {
  const defaultOptions = {
    maxDisplays: 99999,
    eventThrottle: 200,
    showAfterInactiveSeconds: 60, // useful on mobile, where mouseleave does NOT exist
    onExitIntent: () => {}
  }
  const config = {...defaultOptions, ...options}
  const target = document.body
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
  // MOUSEOUT event
  const onMouse = () => {
    display()
  }
  const onMouseLeaveListener = target.addEventListener(
    'mouseleave',
    throttle(onMouse, config.eventThrottle),
    false
  )
  // TIMEOUT event
  let timer
  const restartTimer = () => {
    if (timer) {
      window.clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      display()
    }, config.showAfterInactiveSeconds * 1000)
  }
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
  timer = restartTimer() // start initial timer
  // CLEANUP
  const removeEvents = () => {
    target.removeEventListener('mouseleave', onMouseLeaveListener)
    window.removeEventListener('scroll', onScrollListener)
    window.removeEventListener('mousemove', onMouseMoveListener)
  }
  return removeEvents
}
