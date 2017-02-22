import express from 'express';
import jsonfile from 'jsonfile';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { flow, filter, orderBy, take, uniqBy } from 'lodash/fp';

const app = express();

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

const videos = [
  {
    actor: 'Juha Sipilä',
    title: 'Puheenjohtajatentti',
    text: 'Juha Sipilä/Eduskuntavaalit 2015 - 2015-07-02 - Puheenjohtajatentissä Juha Sipilä (kesk.).txt',
    video: 'data/Juha Sipilä/long_aac.mp4',
  }
];

const getWords = (video) => {
  const contents = fs.readFileSync(`data/${video.text}`, 'utf8');
  const matches = contents.toLowerCase().match(/[\d:]+|[\w\u00C0-\u00D6\u00D8-\u00F6]+/gu);
  let time = 0;
  for (let match of matches) {
    if (match.match(/[\d:]+/gu)) {
      time = match;
      continue;
    }
    let w = words[match] || [];
    let obj = {
      actor: video.actor,
      video: video.video,
      time: time,
    }
    words[match] = [...w, obj];
  }
};

const buildRhymes = (words) => {
  let rhymes = {};
  for (let word in words) {
    for (let i = 0; i < word.length; i++) {
      const rhyme = word.substring(i);
      const r = rhymes[rhyme] || { rhyme: rhyme, total: 0, words: [] };
      r.total += words[word].length;
      r.words.push(word);
      rhymes[rhyme] = r; 
    }
  }
  // Take the longest rhymes with more than one word in them.
  return flow(
    // Skip rhymes that are too short have too few word instances.
    filter(x => x.words.length > 1 && x.rhyme.length > 3),
    // Remove shorter rhymes with identical word list.
    // For example, if we have (ation, [information, station]) as a rhyme, we should not report
    // (tion, [information, station]), but should report (tion, [information, station, petition]).
    orderBy(x => x.rhyme.length, 'desc'),
    uniqBy(x => x.words.join('-')),
  )(rhymes);
};


let words = {};
videos.map(v => getWords(v));
const rhymes = buildRhymes(words);

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
app.get('/api/data', (req, res) => {
  res.json(getActors().map(a => {
    return {
      name: a,
      videos: getVideos(a).map((x) => `/data/${a}/${x}`)
    };
  }));
});
app.get('/api/version', (req, res) => {
  res.json({ version: jsonfile.readFileSync('package.json').version });
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
