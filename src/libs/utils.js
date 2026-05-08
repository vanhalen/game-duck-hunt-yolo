module.exports.pointDistance = function(point1, point2) {
  return Math.sqrt(
    (Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2))
  );
};

module.exports.directionOfTravel = function(pointStart, pointEnd) {
  // positive rise = moving down (screen Y increases downward)
  const rise = pointEnd.y - pointStart.y;
  const run = pointEnd.x - pointStart.x;

  if (run === 0 && rise === 0) {
    return 'top-left';
  }

  // Nearly horizontal flight: prefer left/right sprites
  if (run !== 0 && Math.abs(rise / run) < 0.3) {
    return run > 0 ? 'right' : 'left';
  }

  if (run === 0) {
    return rise > 0 ? 'bottom-left' : 'top-left';
  }

  if (run > 0 && rise <= 0) {
    return 'top-right';
  }
  if (run > 0 && rise > 0) {
    return 'bottom-right';
  }
  if (run < 0 && rise <= 0) {
    return 'top-left';
  }
  return 'bottom-left';
};

module.exports.toggleFullscreen = function() {
  const doc = window.document;
  const docEl = doc.documentElement;

  const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen ||
    docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
};