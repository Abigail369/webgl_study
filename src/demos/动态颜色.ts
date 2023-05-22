import _code from "./动态颜色.ts?raw";
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
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = 10.0;
      v_Color = a_Color;  //将数据传给片元着色器
    }
  `;
  let fragmentSource = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
      gl_FragColor = v_Color;
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
  // 使用gl.vertexAttribPointer()的步进和偏移参数
  // 设置顶点坐标和颜色
  const verticesColors = new Float32Array([
    0.0,
    0.0,
    1.0,
    0.0,
    0.0, //第1个点
    0.5,
    0.5,
    0.0,
    1.0,
    0.0, //第2个点
    0.5,
    -0.5,
    0.0,
    0.0,
    1.0, //第3个点
  ]);
  const n = 3;
  const FSIZE = verticesColors.BYTES_PER_ELEMENT;

  let a_Position = gl.getAttribLocation(program, "a_Position");
  let a_Color = gl.getAttribLocation(program, "a_Color");

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  // gl.drawArrays(gl.POINTS, 0, n);
}
