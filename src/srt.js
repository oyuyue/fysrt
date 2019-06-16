class Srt {
  constructor() {
    this._data = [];
  }

  parse(rawData) {
    const lines = rawData.trim().split(/(?:\r\n|\n|\r)/);
    const data = [];

    for (let i = 0, len = lines.length; i < len; i++) {
      let l = lines[i].trim();
      // eslint-disable-next-line eqeqeq
      if (!l || ~~l !== 0 || l == 0) continue;

      if (/^(?:\d+:){2}\d+,\d+\s-->\s(?:\d+:){2}\d+[,.]\d+$/.test(l)) {
        data.push([l]);
      } else if (/^\d+:\d+\.\d+\s-->\s\d+:\d+\.\d+$/.test(l)) {
        data.push([
          l
            .replace(/\./g, ',')
            .split(' --> ')
            .map(s => '00:' + s)
            .join(' --> ')
        ]);
      } else {
        l = l.replace(/^(?:\{\\\w.*\})+/, '');
        let last = data[data.length - 1];
        if (last.length === 1) {
          last.push(l);
        } else {
          last[1] = last[1] + '\n' + l;
        }
      }
    }

    this._data = data;
    return data.map(d => d[1]);
  }

  genFileText(translate, keep) {
    return (
      this._data
        .map(
          (d, i) =>
            `${i + 1}\n${d[0]}\n${translate[i]}${keep ? '\n' + d[1] : ''}`
        )
        .join('\n\n') + '\n\n'
    );
  }
}

module.exports = Srt;
