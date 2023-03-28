import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export default {
  users: getCollectionFn('users'),
  songs: getCollectionFn('songs'),
  artists: getCollectionFn('artists'),
  comments: getCollectionFn('comments')
};
