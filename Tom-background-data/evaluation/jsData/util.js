
'use strict';

module.exports = {
  lineAngle: function(cx, cy, slope, lineLength) {
    var dx = lineLength / (2*Math.sqrt(slope*slope + 1));
    var dy = slope * dx;
    return {
      x1: cx - dx,
      y1: cy - dy,
      x2: cx + dx,
      y2: cy + dy
    };
  }
};
