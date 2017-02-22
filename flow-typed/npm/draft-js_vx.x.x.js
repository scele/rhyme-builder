declare module 'draft-js' {
  declare type EditorStateType = {
    getSelection(): Object;
  };
  declare var exports: {
    EditorState: {
      createEmpty(): EditorStateType,
      createWithContent: Object => EditorStateType,
    },
    Editor: Object,
    convertFromRaw: Object => Object,
    convertToRaw: Object => Object,
  };
}
