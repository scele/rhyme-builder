declare module 'draft-js' {
  declare type EditorStateType = {
    getSelection(): Object;
  };
  declare type ContentStateType = {
  };
  declare var exports: {
    EditorState: {
      createEmpty(): EditorStateType,
      createWithContent: ContentStateType => EditorStateType,
    },
    ContentState: {
      createFromText: string => ContentStateType,
    },
    Editor: Object,
    convertFromRaw: Object => ContentStateType,
    convertToRaw: ContentStateType => Object,
  };
}
