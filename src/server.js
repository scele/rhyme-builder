import express from 'express';
import jsonfile from 'jsonfile';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { flow, filter, orderBy, take, uniqBy, map, reverse, transform, drop, zipObject, flatten, uniq } from 'lodash/fp';
import GoogleCloud from 'google-cloud';

//import type { WordInstance } from './client/src/types';

const app = express();

const gcloud = GoogleCloud({
  projectId: 'rhyme-builder',
  keyFilename: './.keys/google-cloud.json',
});

app.set('port', (process.env.API_PORT || 3001));

// Allow requests from the client development server.
const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
app.use(allowCrossDomain);
app.use(bodyParser.json());
app.set('json spaces', 2);

const getWords = (video) => {
  const contents = video.text;
  // 1 - timestamp
  // 2 - word, including attached delim chars
  // 3 - preceding delim chars
  // 4 - word
  // 5 - succeeding delim chars
  // 6 - standalone non-whitespace chars
  const re = /(\d+:\d+:?\d*)|((\S*?)([\w\u00C0-\u00D6\u00D8-\u00F6]+)(\S*))|(\S+)/gu;
  let match;
  const tokens = [];
  while ((match = re.exec(contents)) !== null) {
    tokens.push({
      time: match[1],
      word: match[4] ? match[4].toLowerCase() : null,
      wordAndChars: match[2],
      index: match.index + (match[3] ? match[3].length : 0),
    });
  }

  const takeTextLeftUntil = (length) => (tokens) =>
    transform((folded, token) => {
      if (folded.text.length > 0 && folded.text.length + token.length > length)
        return false;
      folded.text = token + ' ' + folded.text;
    }, { text: '' })(tokens).text.trim();

  const takeTextRightUntil = (length) => (tokens) =>
    transform((folded, token) => {
      if (folded.text.length > 0 && folded.text.length + token.length > length)
        return false;
      folded.text = folded.text + ' ' + token;
    }, { text: '' })(tokens).text.trim();

  const getContext = (initialToken, contextLeft, contextRight) => tokens => flow(
    take(initialToken),
    filter(token => token.wordAndChars),
    map(token => token.wordAndChars),
    reverse,
    takeTextLeftUntil(contextLeft)
  )(tokens) + ' ' + flow(
    drop(initialToken),
    filter(token => token.wordAndChars),
    map(token => token.wordAndChars),
    takeTextRightUntil(contextRight)
  )(tokens);

  const timeRegex = /(\d\d):(\d\d):(\d\d)/;
  const timeToSeconds = (time) => {
    if (!time)
      return 0;
    const m = time.match(timeRegex);
    if (m) {
      return 60 * 60 * parseInt(m[1]) + 60 * parseInt(m[2]) + parseInt(m[3]);
    } else {
      return 0;
    }
  };

  let time = 0;
  let actor = video.speakers[0];
  tokens.forEach((token, i) => {
    if (token.time) {
      time = token.time;
    } else if (token.word) {
      let obj = {
        actor: actor,
        video: video.video,
        time: time,
        seconds: timeToSeconds(time),
        context: getContext(i, 10, 50)(tokens),
      };
      (words[token.word] || (words[token.word] = { word: token.word, rhymes: [], instances: [] })).instances.push(obj);
    }
  });
};

const buildRhymes = (words) => {
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
  return zipObject(map(x => x.rhyme)(rhymes), rhymes);
};

let videos = [];
let words = {};
let rhymes = {};
const store = gcloud.datastore();
store.runQuery(store.createQuery('Video')).then(results => {
  videos = results[0];
  videos.forEach(x => {
    x.lores = `https://storage.googleapis.com/rhyme-builder.appspot.com/lores/${x.video}`;
    x.id = x[store.KEY].id;
  });

  videos.map(v => getWords(v));
  rhymes = buildRhymes(words);
  for (let word of Object.keys(words)) {
    for (let i = 0; i < word.length; i++) {
      const rhyme = word.substring(i);
      if (rhyme in rhymes) {
        words[word].rhymes.push(rhyme);
      }
    }
  }
});

app.use('/', express.static('client/build'));
app.use('/data', express.static('data'));
app.get('/api/rhymes', (req, res) => {
  res.json(rhymes);
});
app.get('/api/words', (req, res) => {
  res.json(words);
});
app.get('/api/videos', (req, res) => {
  res.json(videos)
});
app.post('/api/video/:videoId', (req, res) => {
  console.log(`Saving video ${req.params.videoId}: `, req.body);
  const key = store.key(['Video', parseInt(req.params.videoId)]);
  store.get(key).then(results => {
    const video = results[0];
    //store.update({key: key, data: req.body})
    //  .then(console.log('Saved video.'));
    res.json({
      ...video,
      title: req.body.title,
      text: req.body.text,
    });
  });
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
