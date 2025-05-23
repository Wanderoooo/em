import _ from 'lodash'
import Modal from '../@types/Modal'
import State from '../@types/State'
import Thunk from '../@types/Thunk'
import scrollTo from '../device/scrollTo'
import { registerActionMetadata } from '../util/actionMetadata.registry'

/** Shows or hides a modal. */
const showModal = (state: State, { id }: { id: Modal }) => ({
  ...state,
  showModal: id,
})

/** Display a given modal dialog box and scroll to the top. */
export const showModalActionCreator =
  (payload: { id: Modal }): Thunk =>
  dispatch => {
    dispatch({ type: 'showModal', ...payload })
    // wait till next tick, otherwise modal may not be rendered yet
    setTimeout(() => {
      scrollTo('top')
    })
  }

export default _.curryRight(showModal)

// Register this action's metadata
registerActionMetadata('showModal', {
  undoable: false,
})
