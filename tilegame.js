YUI().use('node', 'event-gestures', function(Y) {
    var V_COUNT = 4;
    var H_COUNT = 4;

    var height = 400;
    var width = 400;

    var tileId = function(tile) { return "tile-"+tile.name; }
    var tileHeightPx = function() { return tileHeight()+'px'; }
    var tileHeight = function() { return height / V_COUNT; }
    var tileWidthPx = function() { return tileWidth()+'px'; }
    var tileWidth = function() { return width / H_COUNT; }

    // Create a DOM node that will be inserted into the document.
    function Board(x, y) {
        var populate = function () {
            Y.log("creating storage");
            var board = new Array(x * y);
            for(var i = 0; i < x; i++) {
                for (var j = 0; j < y; j++ ) {
                    var idx = i * x + j;
                    board[idx] = { name: "tile-"+idx,
                                   loc: { x: i,
                                          y: j}
                                 };
                }
            }
            Y.log("Created storage:"+board);
            return board;
        }

        // create the board:
        this.tiles = populate();
        this.render = function() {
            Y.log("creating board");
            var node = Y.Node.create('<div class="board"/>')
            node.setStyle('position', 'relative');
            node.setStyle('height', height+'px');
            node.setStyle('width', width+'px');

            for (var i=0; i < x * y; i++) {
                var tile = this.tiles[i];
//            for (var tile in this.tiles) {
                Y.log("rendering tile: "+tile.name);
                var child =
                    Y.Node.create('<div id="'+tileId(tile)+'" class="tile"/>');

                child.setStyle('position', 'absolute');
                child.setStyle('top', (tile.loc.y * tileHeight())+'px');
                child.setStyle('left', (tile.loc.x * tileWidth())+'px');
                child.setStyle('height', tileHeight()+'px' );
                child.setStyle('width', tileWidth()+'px' );

                child.set('text', tile.name);

                Y.log("Created node: "+child);
                node.appendChild(child);
            }
            return node;
        }
    }

    // Game logic entry point:
    var boardNode = Y.one('#image');
    Y.log("constructing board");
    var board = new Board(H_COUNT, V_COUNT);
    Y.log("built board");
    boardNode.appendChild(board.render());
});

