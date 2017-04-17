$(document).ready(function() {
    var indexController = new IndexController();
    indexController.start();
});

IndexController = function() {};

IndexController.prototype.start = function() {
    this.lazerpegcanvas = $(document).find('#lazerpeg');
    this.lazerpegcanvas.lazerpeg();

    $(".lazerpegUI input[name=color]").change($.proxy(this._updateColor, this));
    $(".lazerpegUI input[type=button]").click($.proxy(this._onActionClick, this));

    this._updateColor();
};

IndexController.prototype._updateColor = function() {
    var colorValue = $(".lazerpegUI input[name=color]:checked").val();
    this.lazerpegcanvas.lazerpeg('color', colorValue);
    return false;
};

IndexController.prototype._onActionClick = function(event) {
    var action = $(event.target).attr('name');
    this.lazerpegcanvas.lazerpeg(action);
    return false;
};

// Resize canvas to fit window
$(document).ready( function(){
    var c = $('#lazerpeg');
    var container = $(c).parent();

    $(window).resize( respondCanvas );

    function respondCanvas(){
        c.attr('width', $(container).width() - 20 ); //max width
        var h = (($(container).width() - 20) / 913 * 573);
        c.attr('height', h ); //max height

        //Call a function to redraw other content (texts, images etc)
        for(var key in window) {
            var value = window[key];
            if (value instanceof lazerpeg) {
                value.refreshReady = true;
            }
        }
    }
    respondCanvas();
});

var touchEnabled = true;

function lazerpeg(canvas) {

    this.refreshReady = true;
    var self = this;
    this.refreshTimer = setInterval(function() { self.updateTimer(); }, 120);

    this.canvas = canvas;

    this._color = 'yellow';

    this._grid = [];

    this._margin = 10;
    this._radius = ((this.canvas.width - (this._margin * 2)) * 13) / 1786;
    this._distDot = (this._radius * 40) / 13;

    this.ctx = this.canvas.getContext('2d');

    this.xDot = Math.round((this.canvas.width -  (this._margin * 2)) / this._distDot);
    this.yDot = Math.round((this.canvas.height - (this._margin * 2)) / this._distDot);
    this.dots = this.xDot * this.yDot;

    this.clear();

    $(this.canvas).select(function () { return false; });
    $(this.canvas).mouseup($.proxy(this._onCanvasMouseUp, this));
    $(this.canvas).mousedown($.proxy(this._onCanvasMouseDown, this));
    $(this.canvas).mousemove($.proxy(this._onCanvasMouseMove, this));
    $(this.canvas).click($.proxy(this._onCanvasMouseClick, this));

    this.refreshReady = true;
}

lazerpeg.colors = {
    'n': 'transparent',
    'r': 'red',
    'o': 'orange',
    'y': 'yellow',
    'g': 'green',
    'b': 'blue',
    'p': 'pink',
    'v': 'purple',
    'w': 'white'
};

lazerpeg.prototype.refresh = function() {
    this.ctx = this.canvas.getContext('2d');
    this.ctx.clearRect(
        0, 0,
        this.canvas.width,
        this.canvas.height
    );

    this._margin = 10;
    this._radius = ((this.canvas.width - (this._margin * 2)) * 13) / 1786;
    this._distDot = (this._radius * 40) / 13;

    //draw pegs
    for(var i=0; i<this.dots; i++) {
        var x = i % this.xDot;
        var y = Math.floor(i / this.xDot) % this.yDot;

        this._draw(x, y, this._grid[i]);
    }
};

lazerpeg.prototype.color = function(a) {
    this._color = a;
};

lazerpeg.prototype.clear = function() {
    for(var i=0; i<this.dots; i++) {
        this._grid[i] = 'n';
    }
    this.refreshReady = true;
    $('#share-box').hide();
};

lazerpeg.prototype._draw = function(x, y, colorName) {
    if (colorName == 'n'){
        this.ctx.strokeStyle = "#00e0ff";
    } else {
        this.ctx.strokeStyle = lazerpeg.colors[colorName];
    }

    this.ctx.lineWidth = 1;

    this.ctx.beginPath();

    if (x >= this.xDot - (y % 2) | y >= this.yDot) {
        return ;
    }

    if (x < 0 | y < 0) {
        return ;
    }

    this._grid[x + (y * this.xDot)] = colorName;

    this.ctx.fillStyle = lazerpeg.colors[colorName];

    var offset = ((y % 2) * this._distDot / 2);

    //peg hole
    if (colorName == 'n'){
        this.ctx.arc(
            this._margin + this._radius + offset + (x * this._distDot),
            this._margin + this._radius + y * this._distDot,
            this._radius, 0, Math.PI*2, true
        );
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    //peg image
    pegsize = 44 / 13 * this._radius;
    peg_xoffset = 4 / 22 * pegsize;
    peg_yoffset = 7 / 22 * pegsize;
    if (colorName !== 'n'){
        var img = new Image();
        img.src = colorName.concat(".png");
        this.ctx.drawImage(img,
            this._margin - peg_xoffset + offset + (x * this._distDot),
            this._margin - peg_yoffset + y * this._distDot,
            pegsize, pegsize);
    }
    this.refreshReady = true;
};

lazerpeg.prototype._onCanvasMouseUp = function(event) {
    this._mouseDown = false;
};

lazerpeg.prototype._onCanvasMouseDown = function(event) {
    this._mouseDown = true;
    $('#share-box').hide();
};

lazerpeg.prototype._onCanvasMouseClick = function(event) {
    this._mouseDown = true;
    this._drawUsingMouseEvent(event);
    this._mouseDown = false;
}

lazerpeg.prototype._onCanvasMouseMove = function(event) {
    this._drawUsingMouseEvent(event);
    this.refreshReady = true;
};

lazerpeg.prototype._drawUsingMouseEvent = function(event) {
    var relX = event.pageX - $(this.canvas).offset().left - this._margin + (this._radius);
    var relY = event.pageY - $(this.canvas).offset().top - this._margin + (this._radius);

    if (this._mouseDown === true && touchEnabled === true) {
        var x = Math.floor(relX / this._distDot);
        var y = Math.floor(relY / this._distDot);
        var offset = y % 2;
        this._draw(x - offset, y, this._color);
        this.refreshReady = true;
    }

};

lazerpeg.prototype.updateTimer = function() {
    if(this.refreshReady == true) {
        this.refresh();
        this.refreshReady = false;
    }
};

(function($) {
    var methods = {
        init: function() {
            this.each(function(index, node) {
                $(node).data('lazerpeg', new lazerpeg(node));
            });
        },
        refresh: function() {
            this.each(function(index, node) {
                $(node).data('lazerpeg').refresh();
            });
        },
        color: function(value) {
            this.each(function(index, node) {
                $(node).data('lazerpeg').color(value);
            });
        },
        clear: function() {
            this.each(function(index, node) {
                $(node).data('lazerpeg').clear();
            });
        },
        updateTimer: function() {
            this.each(function(index, node) {
                $(node).data('lazerpeg').updateTimer();
            });
        }
    };

    $.fn.lazerpeg = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on $.tooltip' );
        }
    };

})( $ );