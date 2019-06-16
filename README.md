# fysrt

一个使用谷歌翻译 .srt 字幕文件的命令行工具

## 安装

```
npm i -g fysrt
```

## 使用

```
$ fysrt -h

Usage: fysrt [options]

Options:
  -V, --version      output the version number
  -d, --delete       删除原文件
  -s, --single       单语字幕，而不是双语字幕
  -f, --from <lang>  原始语言，默认 auto
  -t, --to <lang>    翻译成什么语言，默认 zh-cn
  -T, --time <time>  每个字幕文件的翻译时间间隔 毫秒，默认 3000 毫秒
  -S, --size <size>  一次给 google api 翻译的文本量，默认一次 50 行字幕
  -h, --help         output usage information

Examples:
  $ fysrt ./subtitles
  $ fysrt -d a.srt
  $ fysrt -f en a.srt
```
