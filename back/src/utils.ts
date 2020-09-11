import moment from 'moment'
import { Socket } from 'socket.io'

/**
 * @function isNotNull
 * @description check if all args are not null
 *
 * @param {unknown[]} values - any arguments to checks
 * @return {boolean}
 *
 * @example
 * isNotNull(x, y, z, process.env.PORT)
 *
 */
export const isNotNull = (...values: unknown[]): boolean => {
  for (const v of values) {
    if (v === undefined || v === null) {
      return false
    }
  }
  return true
}

/**
 * @function isNull
 * @description check if all args are null
 *
 * @param {unknown[]} values - any arguments to checks
 * @return {boolean}
 *
 * @example
 * isNull(x, y, z, process.env.PORT)
 *
 */
export const isNull = (...values: unknown[]): boolean => !isNotNull(...values)

/**
 * @function display
 * @description display on output with time
 *
 * @param {string} str - data to display
 * @return {void}
 *
 * @example
 * display("Il a pas dit bonjour")
 *
 */
export const display = (str: string): void => console.log(`[${moment()}] ${str}`)

export const startGame = (roomId: number, socket: Socket): void => {
  const magicNumber: number =  Math.floor(Math.random() * Math.floor(1337))
  socket.emit('game::magicNumber', { roomId, magicNumber }) 
}