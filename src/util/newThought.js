import { store } from '../store.js'
import globals from '../globals.js'
import { tutorialNext } from '../action-creators/tutorial.js'

// constants
import {
  RANKED_ROOT,
  RENDER_DELAY,
  TUTORIAL_STEP_FIRSTTHOUGHT,
  TUTORIAL_STEP_FIRSTTHOUGHT_ENTER,
  TUTORIAL_STEP_SECONDTHOUGHT,
  TUTORIAL_STEP_SECONDTHOUGHT_ENTER,
  TUTORIAL_STEP_SUBTHOUGHT,
  TUTORIAL2_STEP_CONTEXT1_PARENT,
  TUTORIAL2_STEP_CONTEXT1_PARENT_HINT,
  TUTORIAL2_STEP_CONTEXT1,
  TUTORIAL2_STEP_CONTEXT1_HINT,
  TUTORIAL2_STEP_CONTEXT2_PARENT,
  TUTORIAL2_STEP_CONTEXT2_PARENT_HINT,
  TUTORIAL2_STEP_CONTEXT2,
  TUTORIAL2_STEP_CONTEXT2_HINT,
} from '../constants.js'

// util
import {
  asyncFocus,
  contextOf,
  getNextRank,
  getPrevRank,
  getRankAfter,
  getRankBefore,
  headValue,
  isContextViewActive,
  lastThoughtsFromContextChain,
  pathToContext,
  restoreSelection,
  splitChain,
  unroot,
} from '../util.js'

/** Adds a new thought to the cursor.
 * @param offset The focusOffset of the selection in the new thought. Defaults to end.
*/
// NOOP if the cursor is not set

const newThoughtThunk = ({ at, insertNewSubthought, insertBefore, value = '', offset } = {}) => (dispatch, getState) => {
  const state = getState()
  const tutorialStep = state.settings.tutorialStep
  const tutorialStepNewThoughtCompleted =
    // new thought
    (!insertNewSubthought && (
      Math.floor(tutorialStep) === TUTORIAL_STEP_FIRSTTHOUGHT ||
      Math.floor(tutorialStep) === TUTORIAL_STEP_SECONDTHOUGHT
    )) ||
    // new thought in context
    (insertNewSubthought && Math.floor(tutorialStep) === TUTORIAL_STEP_SUBTHOUGHT) ||
    // enter after typing text
    (state.cursor && headValue(state.cursor).length > 0 &&
      (tutorialStep === TUTORIAL_STEP_SECONDTHOUGHT_ENTER ||
        tutorialStep === TUTORIAL_STEP_FIRSTTHOUGHT_ENTER))

  const path = at || state.cursor || RANKED_ROOT

  const contextChain = splitChain(path, state.contextViews)
  const showContexts = isContextViewActive(path, { state })
  const showContextsParent = isContextViewActive(contextOf(path), { state })
  const thoughtsRanked = contextChain.length > 1
    ? lastThoughtsFromContextChain(contextChain)
    : path
  const context = pathToContext(showContextsParent && contextChain.length > 1 ? contextChain[contextChain.length - 2]
    : !showContextsParent && thoughtsRanked.length > 1 ? contextOf(thoughtsRanked) :
      RANKED_ROOT)

  // use the live-edited value
  // const thoughtsLive = showContextsParent
  //   ? contextOf(contextOf(thoughts)).concat().concat(head(thoughts))
  //   : thoughts
  // const thoughtsRankedLive = showContextsParent
  //   ? contextOf(contextOf(path).concat({ value: innerTextRef, rank })).concat(head(path))
  //   : path

  // if meta key is pressed, add a child instead of a sibling of the current thought
  // if shift key is pressed, insert the child before the current thought
  const newRank = (showContextsParent && !insertNewSubthought) || (showContexts && insertNewSubthought) ? 0 // rank does not matter here since it is autogenerated
    : (insertBefore
      ? (insertNewSubthought || !path ? getPrevRank : getRankBefore)
      : (insertNewSubthought || !path ? getNextRank : getRankAfter)
    )(thoughtsRanked)

  dispatch({
    type: 'newThoughtSubmit',
    context: insertNewSubthought
      ? pathToContext(thoughtsRanked)
      : context,
    // inserting a new child into a context functions the same as in the normal thought view
    addAsContext: (showContextsParent && !insertNewSubthought) || (showContexts && insertNewSubthought),
    rank: newRank,
    value
  })

  // tutorial step 1
  if (tutorialStepNewThoughtCompleted) {
    clearTimeout(globals.newSubthoughtModalTimeout)
    tutorialNext()
  }
  // some hints are rolled back when a new thought is created
  else if (tutorialStep === TUTORIAL2_STEP_CONTEXT1_PARENT_HINT) {
    dispatch({ type: 'tutorialStep', value: TUTORIAL2_STEP_CONTEXT1_PARENT })
  }
  else if (tutorialStep === TUTORIAL2_STEP_CONTEXT1_HINT) {
    dispatch({ type: 'tutorialStep', value: TUTORIAL2_STEP_CONTEXT1 })
  }
  else if (tutorialStep === TUTORIAL2_STEP_CONTEXT2_PARENT_HINT) {
    dispatch({ type: 'tutorialStep', value: TUTORIAL2_STEP_CONTEXT2_PARENT })
  }
  else if (tutorialStep === TUTORIAL2_STEP_CONTEXT2_HINT) {
    dispatch({ type: 'tutorialStep', value: TUTORIAL2_STEP_CONTEXT2 })
  }

  globals.disableOnFocus = true
  asyncFocus()

  // increase delay of restoreSelection as it called expandThought from setCursor before contextIndex updates (#299)
  setTimeout(() => {
    // track the transcendental identifier if editing
    globals.disableOnFocus = false
    restoreSelection((insertNewSubthought ? unroot(path) : contextOf(path)).concat({ value, rank: newRank }), { offset: offset != null ? offset : value.length })
  }, RENDER_DELAY + 10)

  return {
    rank: newRank
  }
}

export const newThought = (arg) => store.dispatch(newThoughtThunk(arg))
