export default function scenes(state = [], action) {
  switch (action.type) {
    case 'LOAD_VERSION_SUCCESS':
      return action.response;
    default:
      return state;
  }
}