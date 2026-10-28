/* Coordinate sampling for the twelve-pose material library.
 * Eight authored keys remain motion anchors; in-between coordinates are drawn
 * again on the native pixel grid. This module never blends bitmap frames. */
(function () {
  'use strict';
  var COUNT = 12;

  function number(value) {
    var n;
    try { n = Number(value); } catch (e) { n = 0; }
    return Number.isFinite(n) ? n : 0;
  }
  function wrap(value, count) {
    count = Math.max(1, Math.floor(number(count) || COUNT));
    var n = number(value);
    return ((n % count) + count) % count;
  }
  function normalize(value, count) { return Math.floor(wrap(value, count)); }
  function interpolate(a, b, amount) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.map(function (value, index) { return interpolate(value, b[index], amount); });
    }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      var result = {};
      Object.keys(a).forEach(function (key) { result[key] = interpolate(a[key], b[key], amount); });
      return result;
    }
    if (typeof a === 'number' || typeof b === 'number') {
      var x = number(a), y = number(b);
      return x + (y - x) * amount;
    }
    return amount < 0.5 ? a : b;
  }
  function sample8(values, frame12) {
    if (!Array.isArray(values) || !values.length) return 0;
    var position = wrap(frame12, COUNT) * values.length / COUNT;
    var before = Math.floor(position), amount = position - before;
    return interpolate(values[before], values[(before + 1) % values.length], amount);
  }
  function key8(frame12) { return Math.round(wrap(frame12, COUNT) * 8 / COUNT) % 8; }
  function resample8(values) {
    return Array.from({ length: COUNT }, function (_, index) { return sample8(values, index); });
  }
  function labels8(labels) {
    return Array.from({ length: COUNT }, function (_, index) {
      var label = labels && labels[key8(index)] || '过渡';
      return index % 3 === 0 ? label : label + '过渡';
    });
  }
  window.StudioMotion = {
    count: COUNT, normalize: normalize, sample8: sample8, key8: key8,
    resample8: resample8, labels8: labels8
  };
}());
