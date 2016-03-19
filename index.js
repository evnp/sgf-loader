/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Created by: Evan Purcer <evanpurcer@gmail.com> (http://evnp.ca)

    return format:
    {
        "info": {
            "match": "Google DeepMind Challenge Match",
            "game": "Game 1",
            "date": "2016-03-09",
            "location": "Seoul, Korea",
            "result": "W+Resign",
            "source": { // the actual SGF keys and values
                "PW": "Lee Sedol",
                "PB": "AlphaGo",
                "EV": "Google DeepMind Challenge Match",
                ...
            }
        },
        "players": {
            "black": {
                "name": "AlphaGo",
                "team": "Computer",
                "source": { // the actual SGF keys and values
                    "PB": "AlphaGo",
                    "BT": "Computer"
                }
            },
            "white": {
                "name": "Lee Sedol",
                "rank": "9d",
                "team": "Human",
                "source": { // the actual SGF keys and values
                    "PW": "Lee Sedol",
                    "WR": "9d",
                    "WT": "Human"
                }
            }
        },
        "moves": [{
            "player": "black",
            "x": 16,
            "y": 3,
            "source": { // the actual SGF keys and values
                "B": "pd"
            }
        }, {
            "player": "white",
            "x": 3,
            "y": 3,
            "source": { // the actual SGF keys and values
                "W": "dd"
            }
        }, {

        ...

        }]
    }
*/

var COLOR_LABELS = {
    B: 'black',
    W: 'white'
};

var PLAYER_LABELS = {
    PB: 'player',
    PW: 'player',
    BT: 'team',
    WT: 'team',
    BR: 'rank',
    WR: 'rank'
};

var INFO_LABELS = {
    EV: 'event',
    RO: 'game',
    DT: 'date',
    PC: 'location',
    SZ: 'board_size',
    TM: 'time',
    OT: 'overtime',
    RE: 'result'
};

function trim(str) { return str.trim(); }
function length(str) { return str.length; }

function chunk(array, size) {
    size = Math.max(parseInt(size, 10), 0);
    if (!array || !array.length || size < 1) {
        return [];
    }

    var index = 0
      , resIndex = 0
      , result = Array(Math.ceil(array.length / size))
      ;

    while (index < array.length) {
        result[resIndex++] = array.slice(index, (index += size));
    }

    return result;
}

function fromPairs(pairs) {
    var index = -1
      , length = pairs ? pairs.length : 0
      , result = {}
      , pair = null
      ;

    while (++index < length) {
        pair = pairs[index];
        result[pair[0]] = pair[1];
    }

    return result;
}

module.exports = function (source) {
    this.cacheable && this.cacheable();

    var value = {info: {source: {}}, players: {}, moves: []}
      , parts = source.split(';').map(trim).filter(length)
      ;

    parts.forEach(function (part) {
        var data = fromPairs(chunk(part.match(/[^\[\]]+/g).map(trim).filter(length), 2))
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var datum = data[key]
                  , color_label = COLOR_LABELS[key]
                  , player_label = PLAYER_LABELS[key]
                  , info_label = INFO_LABELS[key]
                  ;

                if (color_label) {
                    value.moves.push({
                        player: color_label,
                        x: datum.charCodeAt(0) - 97,
                        y: datum.charCodeAt(1) - 97,
                        source: data
                    });
                } else if (player_label) {
                    var color = COLOR_LABELS[key.replace(/[^WB]/, '')];

                    if (!value.players[color]) {
                        value.players[color] = {source: {}};
                    }

                    value.players[color][player_label] = datum;
                    value.players[color].source[key] = datum;
                } else if (info_label) {
                    value.info[info_label] = datum;
                    value.info.source[key] = datum;
                }
            }
        }
    });

    this.value = [value];
    return "module.exports = " + JSON.stringify(value, undefined, "  ") + ";";
};
