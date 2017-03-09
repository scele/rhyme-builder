// @flow

import express from 'express';
import jsonfile from 'jsonfile';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { flow, filter, orderBy, take, uniqBy, map, mapValues, reverse, transform, drop, zipObject, flatten, uniq, reduce, values, keyBy, keys, groupBy } from 'lodash/fp';
// $FlowFixMe
import GoogleCloud from 'google-cloud';
import type { $Request, $Response } from 'express';

import type { WordInstance, Video, ServerWordMap, ServerRhymeMap, ServerVideoMap } from '../client/src/types';

const app = express();

const gcloud = GoogleCloud({
  projectId: 'rhyme-builder',
  keyFilename: './.keys/google-cloud.json',
});

const port: number = parseInt(process.env.API_PORT) || 3001;

// Allow requests from the client development server.
const allowCrossDomain = (req: $Request, res: $Response, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
app.use(allowCrossDomain);
app.use(bodyParser.json());
app.set('json spaces', 2);

const parseVideo = (video: Video): Video => {
  const contents = video.text;
  // 1 - timestamp
  // 2 - speaker
  // 3 - word, including attached delim chars
  // 4 - preceding delim chars
  // 5 - word
  // 6 - succeeding delim chars
  // 7 - standalone non-whitespace chars
  type Token = {
    time: ?string,
    speaker: ?string,
    word: ?string,
    wordAndChars: ?string,
    index: number,
  };
  const re = /(\d+:\d+:?\d*)|\[([\w\u00C0-\u00D6\u00D8-\u00F6\s\-]+)\]|((\S*?)([\w\u00C0-\u00D6\u00D8-\u00F6\-]+)(\S*))|(\S+)/gu;
  let match;
  const tokens: Token[] = [];
  while ((match = re.exec(contents)) !== null) {
    tokens.push({
      time: match[1],
      speaker: match[2],
      word: match[5] ? match[5].toLowerCase() : null,
      wordAndChars: match[3],
      index: match.index + (match[4] ? match[4].length : 0),
    });
  }

  const takeTextLeftUntil = (length) => (tokens) =>
    transform((folded, token: Token) => {
      if (token.speaker)
        return false; // Speaker changed, don't take any more words
      if (token.wordAndChars) {
        if (folded.text.length > 0 && folded.text.length + token.wordAndChars.length > length)
          return false; // Taking this word would overflow requested length
        folded.text = token.wordAndChars + ' ' + folded.text;
      }
    }, { text: '' })(tokens).text.trim();

  const takeTextRightUntil = (length) => (tokens) =>
    transform((folded, token: Token) => {
      if (token.speaker)
        return false; // Speaker changed, don't take any more words
      if (token.wordAndChars) {
        if (folded.text.length > 0 && folded.text.length + token.wordAndChars.length > length)
          return false; // Taking this word would overflow requested length
        folded.text = folded.text + ' ' + token.wordAndChars;
      }
    }, { text: '' })(tokens).text.trim();

  const getContext = (initialToken, contextLeft, contextRight) => tokens => flow(
    take(initialToken),
    reverse,
    takeTextLeftUntil(contextLeft)
  )(tokens) + ' ' + flow(
    drop(initialToken),
    takeTextRightUntil(contextRight)
  )(tokens);

  const timeRegex = /(\d\d)?:?(\d\d):(\d\d)/;
  const timeToSeconds = (time) => {
    if (!time)
      return 0;
    const m = time.match(timeRegex);
    if (m) {
      return 60 * 60 * parseInt(m[1] || 0) + 60 * parseInt(m[2]) + parseInt(m[3]);
    } else {
      return 0;
    }
  };

  let time = 0;
  let firstTime = 0;
  let speaker = "Unknown";
  let speakers = {};
  const instances = [];
  tokens.forEach((token, i) => {
    if (token.time) {
      time = token.time;
      if (!firstTime)
        firstTime = time;
    } else if (token.speaker) {
      speaker = token.speaker;
      speakers[speaker] = true;
    } else if (token.word) {
      let obj = {
        word: token.word,
        actor: speaker,
        video: video.id,
        time: time,
        seconds: timeToSeconds(time),
        context: getContext(i, 10, 50)(tokens),
      };
      instances.push(obj);
      //(words[token.word] || (words[token.word] = { word: token.word, rhymes: [], instances: [] })).instances.push(obj);
    }
  });
  return {
    ...video,
    speakers: keys(speakers),
    wordInstances: instances,
    firstAnnotationTime: timeToSeconds(firstTime),
  };
};

const buildRhymes = (words: ServerWordMap): ServerRhymeMap => {
  let rhymes = {};
  for (let word in words) {
    for (let i = 0; i < word.length; i++) {
      const rhyme = word.substring(i);
      const r = rhymes[rhyme] || { rhyme: rhyme, total: 0, words: [] };
      r.total += words[word].instances.length;
      r.words.push(word);
      rhymes[rhyme] = r; 
    }
  }
  // Take the longest rhymes with more than one word in them.
  rhymes = flow(
    // Skip rhymes that are too short have too few word instances.
    filter(x => x.words.length > 1 && x.rhyme.length > 3),
    // Remove shorter rhymes with identical word list.
    // For example, if we have (ation, [information, station]) as a rhyme, we should not report
    // (tion, [information, station]), but should report (tion, [information, station, petition]).
    orderBy(x => x.rhyme.length, 'desc'),
    uniqBy(x => x.words.join('-')),
  )(rhymes);
  return zipObject(map(x => x.rhyme)(rhymes))(rhymes);
};

// Mutable state.
const state = {
  videos: {},
  words: {},
  rhymes: {},
};

const updateWordsAndRhymes = (state) => {
  const mapValuesNoCap = mapValues.convert({ cap: false });
  const words: ServerWordMap = flow(
    map(video => video.wordInstances),
    flatten,
    groupBy(instance => instance.word),
    mapValuesNoCap((instances, word) => ({ word: word, rhymes: [], instances: instances }))
  )(state.videos);

  const rhymes = buildRhymes(words);
  for (let word of Object.keys(words)) {
    for (let i = 0; i < word.length; i++) {
      const rhyme = word.substring(i);
      if (rhyme in rhymes) {
        words[word].rhymes.push(rhyme);
      }
    }
  }
  return {
    ...state,
    words: words,
    rhymes: rhymes,
  }
};

const updateState = (state, newVideos: Video[]) => {
  const videos: ServerVideoMap = flow(
    mapValues(video => ({
      ...video,
      lores: `https://storage.googleapis.com/rhyme-builder.appspot.com/lores/${video.video}`,
      id: video.id || video[store.KEY].id,
    })),
    mapValues(parseVideo),
    keyBy(video => video.id),
  )(newVideos);

  const newState = updateWordsAndRhymes({
    ...state,
    videos: {
      ...state.videos,
      ...videos,
    },
  });
  state.videos = newState.videos;
  state.words = newState.words;
  state.rhymes = newState.rhymes;
}

const store = gcloud.datastore();
store.runQuery(store.createQuery('Video')).then(results => {
  updateState(state, results[0]);
});

const asObject = (x: mixed): Object => typeof(x) === 'object' ? (x || {}) : {};

app.use('/', express.static('client/build'));
app.use('/videos', express.static('client/build'));
app.get('/api/rhymes', (req: $Request, res: $Response) => {
  res.json(state.rhymes);
});
app.get('/api/words', (req: $Request, res: $Response) => {
  res.json(state.words);
});
app.get('/api/videos', (req: $Request, res: $Response) => {
  res.json(mapValues(x => ({...x, wordInstances: []}))(state.videos));
});
app.post('/api/video/:videoId', (req: $Request, res: $Response) => {
  console.log(`Saving video ${req.params.videoId}: `, req.body);
  const key = store.key(['Video', parseInt(req.params.videoId)]);
  store.get(key).then(results => {
    const storedVideo = results[0];
    const userVideo: Video = asObject(req.body);
    const newVideo = {
      ...storedVideo,
      title: userVideo.title,
      text: userVideo.text,
    };
    store.update({key: key, data: newVideo}).then(data => {
      console.log('Saved video: ', data[0]);
      updateState(state, [newVideo]);
      res.json(state.videos[key.id]);
    });
  });
});

app.listen(port, () => {
  console.log(`Find the server at: http://localhost:${port}/`); // eslint-disable-line no-console
});
