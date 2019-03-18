const {NODE_ENV = 'development'} = process.env

export const isDevelopment = NODE_ENV === 'development'

export function log (...args) {
  if (isDevelopment) {
    console.log('[exit-intent-mobile]', ...args)
  }
}
