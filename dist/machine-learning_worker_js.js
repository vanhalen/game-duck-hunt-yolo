/******/ (() => { // webpackBootstrap
/*!************************************!*\
  !*** ./machine-learning/worker.js ***!
  \************************************/
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest');
var MODEL_PATH = "yolov5n_web_model/model.json";
var LABELS_PATH = "yolov5n_web_model/labels.json"; // Tudo o que o modelo vai reconhecer/classificar
var INPUT_MODEL_DIMENSIONS = 640;
// Limiar de confiança para detecções. Equilíbrio: muito baixo gera falsos
// positivos que confundem o tracking; muito alto perde detecções legítimas
// e quebra a continuidade entre frames.
var CLASS_THRESHOLD = 0.30;
// Valor de cinza usado como padding no letterbox (convenção do YOLO).
var LETTERBOX_PAD_VALUE = 114;
// O modelo COCO não tem "duck"; o pato é detectado normalmente como kite/bird.
var TARGET_LABELS = new Set(['kite', 'bird']);
var _labels = [];
var _model = null;
function loadModelAndLabels() {
  return _loadModelAndLabels.apply(this, arguments);
}
/**
 * Pré-processa a imagem para o formato esperado pelo YOLO usando letterbox:
 *  - Mantém o aspect ratio original (sem distorcer)
 *  - Redimensiona o lado maior para INPUT_MODEL_DIMENSIONS
 *  - Preenche as laterais com cinza (114), padrão do YOLO
 *
 * Retorna também os parâmetros (ratio, padX, padY) necessários para mapear as
 * caixas detectadas de volta para coordenadas da imagem original.
 */
function _loadModelAndLabels() {
  _loadModelAndLabels = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var dummyInput, warmup, _t2, _t3;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _context3.n = 1;
          return tf.ready();
        case 1:
          _t2 = JSON;
          _context3.n = 2;
          return fetch(LABELS_PATH).then(function (res) {
            return res.text();
          });
        case 2:
          _t3 = _context3.v;
          _labels = _t2.parse.call(_t2, _t3);
          _context3.n = 3;
          return tf.loadGraphModel(MODEL_PATH);
        case 3:
          _model = _context3.v;
          // aquecendo o modelo (warmup)
          dummyInput = tf.ones(_model.inputs[0].shape);
          _context3.n = 4;
          return _model.executeAsync(dummyInput);
        case 4:
          warmup = _context3.v;
          tf.dispose(dummyInput);
          if (Array.isArray(warmup)) {
            warmup.forEach(function (t) {
              return tf.dispose(t);
            });
          } else {
            tf.dispose(warmup);
          }
          postMessage({
            type: 'modelLoaded'
          });
        case 5:
          return _context3.a(2);
      }
    }, _callee3);
  }));
  return _loadModelAndLabels.apply(this, arguments);
}
function preprocessImage(inputImage) {
  var W = inputImage.width;
  var H = inputImage.height;
  var ratio = Math.min(INPUT_MODEL_DIMENSIONS / W, INPUT_MODEL_DIMENSIONS / H);
  var newW = Math.round(W * ratio);
  var newH = Math.round(H * ratio);
  var padX = Math.floor((INPUT_MODEL_DIMENSIONS - newW) / 2);
  var padY = Math.floor((INPUT_MODEL_DIMENSIONS - newH) / 2);
  var padXRight = INPUT_MODEL_DIMENSIONS - newW - padX;
  var padYBottom = INPUT_MODEL_DIMENSIONS - newH - padY;
  var input = tf.tidy(function () {
    var image = tf.browser.fromPixels(inputImage);
    var resized = tf.image.resizeBilinear(image, [newH, newW]);
    var padded = tf.pad(resized, [[padY, padYBottom], [padX, padXRight], [0, 0]], LETTERBOX_PAD_VALUE);
    return padded.div(255).expandDims(0);
  });
  return {
    input: input,
    ratio: ratio,
    padX: padX,
    padY: padY
  };
}
function runInference(_x) {
  return _runInference.apply(this, arguments);
}
/**
 * Filtra e processa as predições do YOLO:
 *  - Aplica o limiar de confiança (CLASS_THRESHOLD)
 *  - Mantém apenas as classes-alvo (kite/bird)
 *  - Converte caixas normalizadas do espaço do modelo (640x640 com letterbox)
 *    de volta para o espaço da imagem original (descontando padding e escala)
 *  - Calcula o centro do bounding box
 */
function _runInference() {
  _runInference = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(tensor) {
    var output, _output, boxes, scores, classes, _yield$Promise$all, _yield$Promise$all2, boxesData, scoresData, classesData;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.n = 1;
          return _model.executeAsync(tensor);
        case 1:
          output = _context4.v;
          tf.dispose(tensor);

          // As 3 primeiras saídas são: caixas, pontuações e classes.
          _output = _slicedToArray(output, 3), boxes = _output[0], scores = _output[1], classes = _output[2];
          _context4.n = 2;
          return Promise.all([boxes.data(), scores.data(), classes.data()]);
        case 2:
          _yield$Promise$all = _context4.v;
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 3);
          boxesData = _yield$Promise$all2[0];
          scoresData = _yield$Promise$all2[1];
          classesData = _yield$Promise$all2[2];
          output.forEach(function (t) {
            return tf.dispose(t);
          });
          return _context4.a(2, {
            boxes: boxesData,
            scores: scoresData,
            classes: classesData
          });
      }
    }, _callee4);
  }));
  return _runInference.apply(this, arguments);
}
function processPrediction(_ref, ratio, padX, padY) {
  var boxes = _ref.boxes,
    scores = _ref.scores,
    classes = _ref.classes;
  return /*#__PURE__*/_regenerator().m(function _callee() {
    var i, score, label, _boxes$slice, _boxes$slice2, x1, y1, x2, y2, centerX, centerY;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          i = 0;
        case 1:
          if (!(i < scores.length)) {
            _context.n = 5;
            break;
          }
          score = scores[i];
          if (!(score < CLASS_THRESHOLD)) {
            _context.n = 2;
            break;
          }
          return _context.a(3, 4);
        case 2:
          label = _labels[classes[i]];
          if (TARGET_LABELS.has(label)) {
            _context.n = 3;
            break;
          }
          return _context.a(3, 4);
        case 3:
          _boxes$slice = boxes.slice(i * 4, (i + 1) * 4), _boxes$slice2 = _slicedToArray(_boxes$slice, 4), x1 = _boxes$slice2[0], y1 = _boxes$slice2[1], x2 = _boxes$slice2[2], y2 = _boxes$slice2[3]; // Caixas vêm normalizadas em [0..1] do input do modelo (640).
          // Desfazemos o letterbox: pixels_no_input = norm * 640
          // depois subtraímos o padding e dividimos pelo ratio para voltar ao
          // espaço da imagem original.
          x1 = (x1 * INPUT_MODEL_DIMENSIONS - padX) / ratio;
          y1 = (y1 * INPUT_MODEL_DIMENSIONS - padY) / ratio;
          x2 = (x2 * INPUT_MODEL_DIMENSIONS - padX) / ratio;
          y2 = (y2 * INPUT_MODEL_DIMENSIONS - padY) / ratio;
          centerX = (x1 + x2) / 2;
          centerY = (y1 + y2) / 2;
          _context.n = 4;
          return {
            x: centerX,
            y: centerY,
            score: score,
            label: label
          };
        case 4:
          i++;
          _context.n = 1;
          break;
        case 5:
          return _context.a(2);
      }
    }, _callee);
  })();
}
loadModelAndLabels();
self.onmessage = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_ref2) {
    var data, _data$image, width, height, _preprocessImage, input, ratio, padX, padY, detections, inferenceResults, _iterator, _step, prediction, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          data = _ref2.data;
          if (!(data.type !== 'predict')) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2);
        case 1:
          if (_model) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2);
        case 2:
          _data$image = data.image, width = _data$image.width, height = _data$image.height;
          _preprocessImage = preprocessImage(data.image), input = _preprocessImage.input, ratio = _preprocessImage.ratio, padX = _preprocessImage.padX, padY = _preprocessImage.padY;
          detections = [];
          _context2.p = 3;
          _context2.n = 4;
          return runInference(input);
        case 4:
          inferenceResults = _context2.v;
          _iterator = _createForOfIteratorHelper(processPrediction(inferenceResults, ratio, padX, padY));
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              prediction = _step.value;
              detections.push(prediction);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          _context2.n = 6;
          break;
        case 5:
          _context2.p = 5;
          _t = _context2.v;
          // Garante resposta mesmo em erro, para o main destravar o `workerBusy`.
          console.error('AI inference failed', _t);
          detections = [];
        case 6:
          _context2.p = 6;
          // Libera memória da ImageBitmap transferida.
          if (data.image && typeof data.image.close === 'function') {
            data.image.close();
          }
          return _context2.f(6);
        case 7:
          postMessage({
            type: 'predictions',
            detections: detections,
            width: width,
            height: height,
            captureT: data.captureT
          });
        case 8:
          return _context2.a(2);
      }
    }, _callee2, null, [[3, 5, 6, 7]]);
  }));
  return function (_x2) {
    return _ref3.apply(this, arguments);
  };
}();
/******/ })()
;
//# sourceMappingURL=machine-learning_worker_js.js.map