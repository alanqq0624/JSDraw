var lc = null;
var tools;
var strokeWidths;
var colors;
var setCurrentByName;
var findByName;
// the only LC-specific thing we have to do
var containerOne = document.getElementsByClassName('literally')[0];
var showLC = function () {
    lc = LC.init(containerOne, {
        //reload last time paint back, more detail in "save"
        snapshot: JSON.parse(localStorage.getItem('drawing')),
        //筆刷大小
        strokeWidths: [10, 20, 50],
        defaultStrokeWidth: 10,
        secondaryColor: 'transparent'
    });
    window.demoLC = lc;

    //set a snapshot after drawingchange, pan(move draw), and zoom(draw zoom in or out)
    //To let you can keep your paint when reopening the page without lost your paint after last time you close tab 
    var save = function () {
        localStorage.setItem('drawing', JSON.stringify(lc.getSnapshot()));
    }
    lc.on('drawingChange', save);
    lc.on('pan', save);
    lc.on('zoom', save);

    //set tooltab action event
    $("#open-image").click(function () {
        window.open(lc.getImage({
            scale: 1,
            margin: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        }).toDataURL());//out put PNG/base-64, work on firefox
    });
    $("#change-size").click(function () {
        lc.setImageSize(null, 200);
    });
    $("#reset-size").click(function () {
        lc.setImageSize(null, null);
    });
    $("#clear-lc").click(function () {
        lc.clear();
    });

    // Set up our own tools...
    tools = [{
        name: 'pencil',
        el: document.getElementById('tool-pencil'),
        tool: new LC.tools.Pencil(lc)
    }, {
        name: 'eraser',
        el: document.getElementById('tool-eraser'),
        tool: new LC.tools.Eraser(lc)
    }, {
        name: 'text',
        el: document.getElementById('tool-text'),
        tool: new LC.tools.Text(lc)
    }, {
        name: 'line',
        el: document.getElementById('tool-line'),
        tool: new LC.tools.Line(lc)
    }, {
        name: 'arrow',
        el: document.getElementById('tool-arrow'),
        tool: function () {
            arrow = new LC.tools.Line(lc);
            arrow.hasEndArrow = true;
            return arrow;
        }()
    }, {
        name: 'dashed',
        el: document.getElementById('tool-dashed'),
        tool: function () {
            dashed = new LC.tools.Line(lc);
            dashed.isDashed = true;
            return dashed;
        }()
    }, {
        name: 'ellipse',
        el: document.getElementById('tool-ellipse'),
        tool: new LC.tools.Ellipse(lc)
    }, {
        name: 'tool-rectangle',
        el: document.getElementById('tool-rectangle'),
        tool: new LC.tools.Rectangle(lc)
    }, {
        name: 'tool-polygon',
        el: document.getElementById('tool-polygon'),
        tool: new LC.tools.Polygon(lc)
    }, {
        name: 'tool-select',
        el: document.getElementById('tool-select'),
        tool: new LC.tools.SelectShape(lc)
    }];

    strokeWidths = [{
        name: 10,
        el: document.getElementById('sizeTool-1'),
        size: 10
    }, {
        name: 20,
        el: document.getElementById('sizeTool-2'),
        size: 20
    }, {
        name: 50,
        el: document.getElementById('sizeTool-3'),
        size: 50
    }];

    colors = [{
        name: 'black',
        el: document.getElementById('colorTool-black'),
        color: '#000000'
    }, {
        name: 'blue',
        el: document.getElementById('colorTool-blue'),
        color: '#0000ff'
    }, {
        name: 'red',
        el: document.getElementById('colorTool-red'),
        color: '#ff0000'
    }];

    setCurrentByName = function (ary, val) {
        ary.forEach(function (i) {
            $(i.el).toggleClass('current', (i.name == val));
        });
    };
    findByName = function (ary, val) {
        var vals;
        vals = ary.filter(function (v) {
            return v.name == val;
        });
        if (vals.length == 0)
            return null;
        else
            return vals[0];
    };

    // Wire tools to click event
    tools.forEach(function (t) {
        $(t.el).click(function () {
            var sw;
            lc.setTool(t.tool);
            setCurrentByName(tools, t.name);
            setCurrentByName(strokeWidths, t.tool.strokeWidth);
            $('#tools-sizes').toggleClass('disabled', (t.name == 'text'));
        });
    });
    //set initial state currrent(only look like, function is initial with last time(?))
    setCurrentByName(tools, tools[0].name);

    // Wire Stroke Widths
    // NOTE: This will not work until the stroke width PR is merged...
    strokeWidths.forEach(function (sw) {
        $(sw.el).click(function () {
            lc.trigger('setStrokeWidth', sw.size);
            setCurrentByName(strokeWidths, sw.name);
        })
    })
    setCurrentByName(strokeWidths, strokeWidths[0].name);
    // Wire Colors
    colors.forEach(function (clr) {
        $(clr.el).click(function () {
            lc.setColor('primary', clr.color)
            setCurrentByName(colors, clr.name);
        })
    })
    setCurrentByName(colors, colors[0].name);
};

$(document).ready(function () {
    // disable scrolling on touch devices so we can actually draw
    $(document).bind('touchmove', function (e) {
        if (e.target === document.documentElement) {
            return e.preventDefault();
        }
    });
    showLC();
});

//set clickevent of show or hide(disable) the whole draw
$('#hide-lc').click(function () {
    if (lc) {
        lc.teardown();
        lc = null;
    }
});
$('#show-lc').click(function () {
    if (!lc) {
        showLC();
    }
});