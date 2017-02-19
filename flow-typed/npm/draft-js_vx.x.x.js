declare module 'draft-js' {
  declare type EditorStateType = {
    getSelection(): Object;
  };
  declare var exports: {
    EditorState: {
      createEmpty(): EditorStateType,
    },
    Editor: Object
  };
}
