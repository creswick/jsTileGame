YUI().use('node', 'event-gestures', function(Y) {
    var V_COUNT = 2;
    var H_COUNT = 2;

//    var url = "http://i.imgur.com/sMs6L.jpg";
    var url = "sMs6L.jpg";
    var height;
    var width;

    /**
     * Calculate the size of image.
     * @param {string} url Url of the image which size to find
     * @param {function(number, number)} onSizeCalculated Callback function to run once
     *   the size of the image calculated
     */
    function ImgSize(url, onSizeCalculated) {
        // Once the image is loaded, the calls the callback function onSizeCalculated
        function setDimensions() {
            // scope changed: this = Image object
            if (onSizeCalculated) {
                onSizeCalculated(this.width, this.height);
            }
        }
        // Initialization:
        // - sets callback on image loaded - setDimensions;
        // - loads the image.
        function init() {
            var img = new Image();
            img.name = url;
            img.onload = setDimensions;
            img.src = url;
        }
        // Run initialization
        init();
    };

    var tileId = function(tile) { return "tile-"+tile.name; }
    var tileHeightPx = function() { return tileHeight()+'px'; }
    var tileHeight = function() { return height / V_COUNT; }
    var tileWidthPx = function() { return tileWidth()+'px'; }
    var tileWidth = function() { return width / H_COUNT; }

    // calculate the index of the tile to the left, return -1 if no
    // such tile exists.
    var leftIdx = function (idx) {
        var col = idx % H_COUNT;
        if (col == 0) return -1;

        var ret = idx - 1;
        Y.log(ret+" is to the left of "+idx);
        return ret;
    }

    var rightIdx = function (idx) {
        var col = idx % H_COUNT;
        if (col == (H_COUNT - 1)) return -1;

        var ret = idx + 1;
        Y.log(ret+" is to the right of "+idx);
        return ret;
    }

    var aboveIdx = function(idx) {
        // first row:
        if (idx < H_COUNT) return -1;

        var ret = idx - H_COUNT;
        Y.log(ret+" is above "+idx);
        return ret;
    }

    var belowIdx = function(idx) {
        // last row:
        if (idx >= (H_COUNT * V_COUNT) - H_COUNT) return -1;

        var ret = idx + H_COUNT;
        Y.log(ret+" is below "+idx);
        return ret;
    }

    // Create a DOM node that will be inserted into the document.
    function Board(x, y) {
        var populate = function () {
            Y.log("creating storage");
            var board = new Array(x * y);
            for(var i = 0; i < x; i++) {
                for (var j = 0; j < y; j++ ) {
                    var idx = i * x + j;
                    board[idx] = { name: "tile-"+idx,
                                   // loc represents the location in an image:
                                   loc: { x: j,
                                          y: i},
                                   blank: false
                                 };
                    if (idx + 1 == V_COUNT * H_COUNT) {
                        board[idx].blank = true;
                    }
                }
            }
            Y.log("Created storage:"+board);
            return board;
        }

        // create the board:
        this.tiles = populate();

        this.repaint = function () {
            var n = Y.one('#board');
            n.replace(this.render());
        }

        this.swapTiles = function (t1, t2) {
            var temp = this.tiles[t1];
            this.tiles[t1] = this.tiles[t2];
            this.tiles[t2] = temp;
        }

        getTileIdx = function (tile, tiles) {
            var idx=0;
            for (; idx < tiles.length; idx++){
                if (tiles[idx].name == tile.name) {
                    // found it, return the index:
                    return idx;
                }
            }
            return idx;
        }

        // create an movement event handler for a tile:
        this.eventHandler = function (tile, tiles, board) {
            return function(e) {
                // do nothing if we are the blank tile:
                if (tile.blank) {
                    return;
                }
                // see if we're adjacent to the 15 tile:
                var tileIdx = getTileIdx(tile, tiles);
                // check to the left:
                var left = leftIdx(tileIdx);
                var right = rightIdx(tileIdx);
                var above = aboveIdx(tileIdx);
                var below = belowIdx(tileIdx);

                var swapIdx = -1;
                if (-1 != left && tiles[left].blank) {
                    swapIdx = left;
                } else if (-1 != right && tiles[right].blank) {
                    swapIdx = right;
                } else if (-1 != above && tiles[above].blank) {
                    swapIdx = above;
                } else if (-1 != below && tiles[below].blank) {
                    swapIdx = below;
                }

                // swap the tiles.
                board.swapTiles(tileIdx, swapIdx);

                // render again:
                board.repaint();
            }
        }

        this.render = function() {
            Y.log("creating board");
            var node = Y.Node.create('<div id="board"/>')
            node.setStyle('position', 'relative');
            node.setStyle('height', height+'px');
            node.setStyle('width', width+'px');

            for (var i=0; i < x; i++) {
                for (var j=0; j < y; j++ ) {
                    var idx = i * x + j;
                    var tile = this.tiles[idx];
                    Y.log("rendering tile: "+tile.name);
                    var child =
                        Y.Node.create('<div id="'+tileId(tile)+'" class="tile"/>');

                    child.setStyle('position', 'absolute');
                    child.setStyle('top', (i * tileHeight())+'px');
                    child.setStyle('left', (j * tileWidth())+'px');
                    child.setStyle('height', tileHeight()+'px' );
                    child.setStyle('width', tileWidth()+'px' );
                    if (tile.blank) {
                        child.setStyle('background', 'black');
                    } else {
                        child.setStyle('backgroundImage',
                                       'url("'+url+'")');
                        child.setStyle('overflow', 'hidden');
                        child.setStyle('backgroundRepeat', 'no-repeat');
                        var bgLeft = (-1 * tile.loc.x * tileWidth())+'px';
                        var bgTop  = (-1 * tile.loc.y * tileHeight())+'px';
                        var bgPos  = bgLeft + ' ' + bgTop;
                        Y.log("setting tile "+idx+" bg: "+bgPos);
                        child.setStyle('backgroundPositionX', bgLeft);
                        child.setStyle('backgroundPositionY', bgTop);
                    }

                    child.set('text', tile.name);

                    child.on("dblclick", this.eventHandler(tile, this.tiles, this));

                    Y.log("Created node: "+child);
                    node.appendChild(child);
                }
            }
            return node;
        }
    }

    new ImgSize(url, function(w,h) {
        width = w;
        height = h;

        // Game logic entry point:
        var boardNode = Y.one('#image');
        Y.log("constructing board");
        var board = new Board(H_COUNT, V_COUNT);
        Y.log("built board");
        boardNode.appendChild(board.render());
    });
});

