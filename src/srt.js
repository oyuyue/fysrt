class Srt {
  constructor() {
    this._data = [];
  }

  parse(rawData) {
    let data = rawData.trim().split(/(?:\r\n\r\n|\n\n|\r\r)/);
    data = data.map(d => {
      let items = d.split(/(?:\r\n|\n|\r)/);
      let txt = items
        .slice(2)
        .map(t => t.replace(/^(?:\{\\\w.*\})+/, ''))
        .join('\n');
      return [items[1], txt];
    });

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
