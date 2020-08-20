import { FunctionComponent } from 'react'
import { ActionCreator } from '../types'

interface Options {
  alertType?: string,
  showCloseLink?: boolean,
}

/**
 * Dispatches an alert action.
 *
 * @param value The string or React Component that will be rendered in the alert.
 * @param showCloseLink Show a small 'x' in the upper right corner that allows the user to close the alert. Default: true.
 * @param type An arbitrary alert type that can be added to the alert. This is useful if specific alerts needs to be detected later on, for example, to determine if the alert should be closed, or if it has been superceded by a different alert type.
 */
const alert = (value: string | FunctionComponent | null, { alertType, showCloseLink }: Options = {}): ActionCreator => (dispatch, getState) => {

  const { alert } = getState()
  if (alert && alert.value === value) return

  dispatch({
    type: 'alert',
    alertType,
    showCloseLink,
    value,
  })

}

export default alert
