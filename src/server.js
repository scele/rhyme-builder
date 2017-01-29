import express from 'express';
import jsonfile from 'jsonfile';
import bodyParser from 'body-parser';

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

app.use('/', express.static('client/build'));
app.get('/api/version', (req, res) => {
  res.json({ version: jsonfile.readFileSync('package.json').version });
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
