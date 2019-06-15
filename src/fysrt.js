#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs-extra');
const walk = require('klaw');
const commander = require('commander');
const inquirer = require('inquirer');
const signale = require('signale');

const Srt = require('./srt');
const translate = require('translate-google-cn');

const { version } = require('../package.json');

const interactive = new signale.Signale({ interactive: true });

commander
  .version(version)
  .option('-d, --delete', '删除原文件')
  .option('-s, --single', '单语字幕，而不是双语字幕')
  .option('-f, --from <lang>', '原始语言，默认 auto')
  .option('-t, --to <lang>', '翻译成什么语言，默认 zh-cn')
  .option(
    '-S, --size <size>',
    '一次给 google api 翻译的文本量，默认一次 100 行字幕'
  )
  .on('--help', () => {
    console.log();
    console.log('Examples:');
    console.log('  $ fysrt ./subtitles');
    console.log('  $ fysrt -d a.srt');
    console.log('  $ fysrt -f en a.srt');
  })
  .parse(process.argv);

async function translateSubtitleFile(
  target,
  { from, to, single, keep, size = 100 }
) {
  const srt = new Srt();
  const textArr = srt.parse(fs.readFileSync(target, 'utf-8'));

  const requests = [];
  for (let i = 0, len = textArr.length; i <= len; i += size) {
    requests.push(
      translate(textArr.slice(i, i + size).join('\n\n'), {
        from,
        to
      })
    );
  }

  const res = await Promise.all(requests);
  const text = srt.genFileText(
    res.map(r => r.text.split('\n\n')).flat(),
    !single
  );

  const { dir, name } = path.parse(target);
  const fileName = keep
    ? path.resolve(dir, `${name}_${to}.srt`)
    : `${target}.tmp`;
  fs.writeFileSync(fileName, text);

  if (!keep) {
    fs.removeSync(target);
    fs.renameSync(target + '.tmp', target);
  } else {
    fs.removeSync(target + '.tmp');
  }
}

async function run() {
  let target = commander.args[0];
  if (!target) {
    const ans = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'dir',
        message: '翻译当前文件夹下的所有字幕文件?',
        default: false
      }
    ]);

    if (!ans.dir) return;
    target = './';
  }

  target = path.resolve(process.cwd(), target);

  let stat = null;
  stat = fs.statSync(target);

  const options = {
    keep: !commander.delete,
    single: commander.single,
    from: commander.from || 'auto',
    to: commander.to || 'zh-cn',
    size: commander.size || 100
  };

  if (stat.isFile()) {
    if (!target.endsWith('.srt')) {
      return signale.error('文件必须是 .srt 文件');
    }

    interactive.await(target);
    await translateSubtitleFile(target, options);
    interactive.success('翻译完成！');
  } else if (stat.isDirectory()) {
    const files = [];
    walk(target)
      .on('data', ({ path: p }) => p && p.endsWith('.srt') && files.push(p))
      .on('end', async () => {
        const len = files.length;
        if (len === 0) {
          signale.error(`目录下没有 .srt 文件 -> ${target}`);
          process.exit(1);
        }

        const errors = [];

        for (let i = 0; i < len; i++) {
          interactive.await('[%d/%d] - %s', i + 1, len, files[i]);
          try {
            await translateSubtitleFile(files[i], options);
          } catch (error) {
            interactive.fatal(error);
            errors.push(files[i]);
          }
        }

        interactive.success('[%d/%d] - 全部翻译完成', len, len);

        if (errors.length > 0) {
          signale.debug('以下文件翻译出错 >>>>>>>>>>>>>>');
          console.log();
          errors.forEach(e => {
            signale.error(e);
          });
          process.exit(1);
        }
      });
  } else {
    throw new Error(`非法资源 -> ${target}`);
  }
}

if (module.parent == null) {
  run().catch(e => {
    signale.fatal(e);
    process.exit(1);
  });
}
