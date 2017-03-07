// @flow

import { EditorState, ContentState, SelectionState, Modifier } from 'draft-js';
import { OPEN, CLOSE, SET_EDITOR_STATE } from './actions';

import type { Action } from './actions';
import type { Video } from '../types';

export type State = {
  video: Video,
  editorState: Object, // TODO
  open: boolean,
};

// $FlowFixMe
const initialState: State = {
  open: false,
};

const execLast = (regex, str) => {
  var lastMatch = null;
  const regexg = new RegExp(regex, 'g');
  while (true) {
    let m = regexg.exec(str);
    if (!m)
      return lastMatch;
    lastMatch = m;
  }
};

const format = (editorState) => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const block = content.getFirstBlock();
  const key = block.getKey();
  const selectAll = SelectionState.createEmpty(key).merge({
    focusKey: content.getLastBlock().getKey(),
    focusOffset: content.getLastBlock().getText().length,
  });

  const timeRegex = /(\d\d)?:?(\d\d):(\d\d)/;
  let selectCurrentRhyme = SelectionState.createEmpty(selection.getAnchorKey());
  // Find the previous 00:00:00 timestamp, and extend 'selectCurrentRhyme' selection
  // to that (or to the beginning if no timestamp is found).
  {
    let currentContentBlock = content.getBlockForKey(selection.getAnchorKey());
    let currentBlockText = currentContentBlock.getText().substring(0, selection.getAnchorOffset());
    while (true) {
      const m = execLast(timeRegex, currentBlockText);
      if (m) {
        selectCurrentRhyme = selectCurrentRhyme.merge({
          anchorKey: currentContentBlock.getKey(),
          anchorOffset: m.index + m[0].length,
        });
        break;
      }
      currentContentBlock = content.getBlockBefore(currentContentBlock.getKey());
      if (!currentContentBlock) {
        // Reached end, no timestamp found.
        selectCurrentRhyme = selectCurrentRhyme.merge({
          anchorKey: content.getFirstBlock().getKey(),
          anchorOffset: 0,
        });
        break;
      }
      currentBlockText = currentContentBlock.getText();
    }
  }
  // Find the next 00:00:00 timestamp, and extend 'selectCurrentRhyme' selection
  // to that (or to the end if no timestamp is found).
  {
    let currentContentBlock = content.getBlockForKey(selection.getAnchorKey());
    let currentBlockText = currentContentBlock.getText().substring(selection.getAnchorOffset());
    while (true) {
      const m = timeRegex.exec(currentBlockText);
      if (m) {
        selectCurrentRhyme = selectCurrentRhyme.merge({
          focusKey: currentContentBlock.getKey(),
          focusOffset: m.index + (selection.getAnchorKey() == currentContentBlock.getKey() ? selection.getAnchorOffset() : 0),
        });
        break;
      }
      currentContentBlock = content.getBlockAfter(currentContentBlock.getKey());
      if (!currentContentBlock) {
        // Reached end, no timestamp found.
        selectCurrentRhyme = selectCurrentRhyme.merge({
          focusKey: content.getLastBlock().getKey(),
          focusOffset: content.getLastBlock().getText().length,
        });
        break;
      }
      currentBlockText = currentContentBlock.getText();
    }
  }

  let contentState = editorState.getCurrentContent();
  contentState = Modifier.removeInlineStyle(contentState, selectAll, "currentRhyme");
  contentState = Modifier.applyInlineStyle(contentState, selectCurrentRhyme, "currentRhyme");
  return EditorState.acceptSelection(EditorState.createWithContent(contentState), editorState.getSelection());
}

export default function videoInspector(state: State = initialState, action: Action): State {
  switch (action.type) {
    case OPEN:
      return {
        open: true,
        video: action.video,
        editorState: format(EditorState.createWithContent(ContentState.createFromText(action.video.text))),
      };
    case CLOSE:
      return {
        ...state,
        open: false,
      };
    case SET_EDITOR_STATE:
      return {
        ...state,
        video: {
          ...state.video,
          text: action.editorState.getCurrentContent().getPlainText(),
        },
        editorState: format(action.editorState),
      };
    default:
      return state;
  }
}