import _code from "./动态大小.ts?raw";
import hljs from "highlight.js";
export const code = hljs.highlight(
  "typescript",
  _code.split("/*****分割线*****/")[2]
).value;

let canvas: HTMLCanvasElement;
/** webgl上下文 */
let gl: WebGLRenderingContext | null;

export function enter() {
  let app = document.getElementById("app");

  canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 500;

  if (app) {
    app.appendChild(canvas);
    drawPoint();
  }
}
export function leave() {
  canvas.remove();
}

function drawPoint() {
  gl = canvas.getContext("webgl");
  if (!gl) return;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  /*****分割线*****/
  let vertexSource = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = a_PointSize;
    }
  `;
  let fragmentSource = `
    void main() {
      gl_FragColor = vec4(0.0, 1.0, 0.0, 0.5);
    }
  `;

  let vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
  gl.shaderSource(vertexShader, vertexSource);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  let program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  // const vertices = new Float32Array([0.0, 0.0, 0.5, 0.5, 0.5, -0.5]);
  // var sizes = new Float32Array([10.0, 20.0, 30.0]);
  // const n = 3;

  // let a_Position = gl.getAttribLocation(program, "a_Position");
  // let a_PointSize = gl.getAttribLocation(program, "a_PointSize");

  // const vertexBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  // gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(a_Position);

  // const sizeBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
  // gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(a_PointSize);

  // gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // gl.drawArrays(gl.POINTS, 0, n);

  // 使用gl.vertexAttribPointer()的步进和偏移参数
  const verticesSizes = new Float32Array([
    0.0,
    0.0,
    10.0, //第1个点
    0.5,
    0.5,
    20.0, //第2个点
    0.5,
    -0.5,
    30.0, //第3个点
  ]);
  const n = 3;
  // 类型化数组具有 BYTES_PER_ELEMENT 属性，表示这种数据类型占据的字节数
  // Float32Array.BYTES_PER_ELEMENT // 4
  const FSIZE = verticesSizes.BYTES_PER_ELEMENT;

  let a_Position = gl.getAttribLocation(program, "a_Position");
  let a_PointSize = gl.getAttribLocation(program, "a_PointSize");

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
  gl.enableVertexAttribArray(a_PointSize);

  gl.drawArrays(gl.POINTS, 0, n);
}
