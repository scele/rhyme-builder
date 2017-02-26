import GoogleCloud from 'google-cloud';
import fs from 'fs';
import path from 'path';
import program from 'commander';
import { flow, map, flatten, filter, find, groupBy } from 'lodash/fp';
import chalk from 'chalk';
import child_process from 'child_process';

const gcloud = GoogleCloud({
  projectId: 'rhyme-builder',
  keyFilename: './.keys/google-cloud.json',
});
const datastore = gcloud.datastore();
const storage = gcloud.storage();

const die = (str) => {
  console.error();
  console.error(`  error: ${str}`);
  console.error();
  process.exit(1);
};

const scanVideoFile = x => x;
const scanFile = (file) => ['.flv', '.mp4'].includes(path.extname(file)) ? scanVideoFile(file) : null;
const scanDir = (dir) => flow(map(x => scan(path.join(dir, x))), flatten)(fs.readdirSync(dir));
const scan = (fileOrDir) => {
  return filter(x => x !== null)(fs.lstatSync(fileOrDir).isDirectory() ? scanDir(fileOrDir) : [scanFile(fileOrDir)]);
};

const parseDirectory = str => {
  if (!fs.existsSync(str) || !fs.lstatSync(str).isDirectory()) {
    die(`${str} is not a directory`);
  }
  return str;
}

const log = x => x ? console.log(chalk.green(x)) : console.log();
const error = x => x ? console.error(chalk.red(x)) : console.error();

program
  .version('0.0.1')
  .option('--lores-dir <dir>', 'Output directory for low-resolution videos', parseDirectory)
  .parse(process.argv);

if (!program.loresDir) {
  die('--lores-dir option is mandatory')
}

const videoFiles = flow(map(scan), flatten)(program.args);

log(`\nFound ${videoFiles.length} video files.`);

const stripDirAndExt = x => path.basename(x, path.extname(x));
const findEntity = videoEntities => filename =>
  find(x => stripDirAndExt(x.video).toLowerCase() == stripDirAndExt(filename).toLowerCase())(videoEntities);

const promiseFromChildProcess = (child) =>
    new Promise((resolve, reject) => {
        child.addListener("error", reject);
        child.addListener("exit", resolve);
    });

const generateLores = (input, output) => {
  log();
  log(`Generating low-resolution video...`);
  log(`  Input:  ${input}`);
  log(`  Output: ${output}`);
  const cmd = `ffmpeg -y -i "${input}" -vcodec h264 -acodec aac -strict -2 -vf scale=320:-1 -sn "${output}"`;
  return child_process.execSync(cmd, { stdio: 'inherit' });
}
const bucket = storage.bucket('rhyme-builder.appspot.com');

const uploadFile = (input, output) => {
  log();
  log(`Uploading file video...`);
  log(`  Input:  ${input}`);
  log(`  Output: ${output}`);
  return bucket.upload(input, { destination: output })
    .then((results) => {
      const file = results[0];
      console.log(`File ${file.name} uploaded.`);
      return file;
    })
    .then(file => file.acl.add({entity: 'allUsers', role: storage.acl.READER_ROLE}))
    .then(() => log(`Made public.`));
}

const insertEntity = (entity) => {
  log();
  log(`Saving entity...`);
  log(`  ${entity.title} (${entity.speakers})`);
  return datastore.save({
    key: datastore.key('Video'),
    data: entity
  }).then(() => log(`Entity saved.`));
};

const checkVideos = videoFiles => videoEntities => {
  let p = Promise.resolve();
  const status = flow(
    map(x => ({ path: x, entity: findEntity(videoEntities)(x) })),
    groupBy(x => x.entity !== undefined)
  )(videoFiles);
  if (status.true) {
    log(`\nFound ${status.true.length} videos already from the server:`);
    status.true.map(x => {
      log(`  ${x.path}`);
      log(`    ${x.entity.title} (${x.entity.speakers})`);
    });
  }

  if (status.false) {
    log(`\nProcessing ${status.false.length} videos now...`);
    status.false.map(x => {
      const input = x.path;
      const title = path.basename(input, path.extname(input));
      const output = path.join(program.loresDir, title + '.mp4');
      p = p.then(() => generateLores(x.path, output))
           .then(() => uploadFile(output, `lores/${path.basename(output)}`))
           .then(() => insertEntity({
              title: title,
              video: path.basename(output),
              text: '',
              speakers: [],
            }))
           .catch(err => error(`Failed (${err}).`));
    });
  }
};

datastore.runQuery(datastore.createQuery('Video'))
  .then(results => results[0])
  .then(checkVideos(videoFiles));
