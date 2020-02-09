import { isMobile } from '../browser.js'
import { store } from '../store.js'

// util
import { getThoughtsRanked } from './getThoughtsRanked.js'
import { restoreSelection } from './restoreSelection.js'


const cursorForwardThunk = () => (dispatch, getState) => {
  const state = getState()
  // pop from cursor history
  if (state.cursorHistory.length > 0) {
    const cursorNew = state.cursorHistory[state.cursorHistory.length - 1]
    dispatch({ type: 'setCursor', thoughtsRanked: cursorNew, cursorHistoryPop: true })

    if (state.cursor && (!isMobile || state.editing)) {
      restoreSelection(cursorNew, { offset: 0 })
    }
  }
  // otherwise move cursor to first child
  else {
    const cursorOld = state.cursor
    const firstSubthought = cursorOld && getThoughtsRanked(cursorOld)[0]
    if (firstSubthought) {
      const cursorNew = cursorOld.concat(firstSubthought)
      dispatch({ type: 'setCursor', thoughtsRanked: cursorNew })
      if (!isMobile || state.editing) {
        restoreSelection(cursorNew, { offset: 0 })
      }
    }
  }
}

export const cursorForward = () => store.dispatch(cursorForwardThunk())
