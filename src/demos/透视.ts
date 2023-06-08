import _code from "./透视.ts?raw";
import hljs from "highlight.js";
export const code = hljs.highlight(
  "typescript",
  _code.split("/*****分割线*****/")[2]
).value;

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext | null;
export function enter() {
  let app = document.getElementById("app");

  canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 500;

  if (app) {
    app.appendChild(canvas);
    drawTriangle();
  }
}
export function leave() {
  canvas.remove();
}
/*****分割线*****/
function drawTriangle() {
  gl = canvas.getContext("webgl");
  if (!gl) return;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let vertexSource = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    varying vec4 v_Color;
    void main() {
      gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;
      v_Color = a_Color;
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

  const verticesColors = new Float32Array([
    0.75,
    1.0,
    -2.0,
    1.0,
    1.0,
    0.4, // The middle yellow one
    0.25,
    -1.0,
    -2.0,
    1.0,
    1.0,
    0.4,
    1.25,
    -1.0,
    -2.0,
    1.0,
    0.4,
    0.4,

    // Three triangles on the right side
    0.75,
    1.0,
    -4.0,
    0.4,
    1.0,
    0.4, // The back green one
    0.25,
    -1.0,
    -4.0,
    0.4,
    1.0,
    0.4,
    1.25,
    -1.0,
    -4.0,
    1.0,
    0.4,
    0.4,

    0.75,
    1.0,
    0.0,
    0.4,
    0.4,
    1.0, // The front blue one
    0.25,
    -1.0,
    0.0,
    0.4,
    0.4,
    1.0,
    1.25,
    -1.0,
    0.0,
    1.0,
    0.4,
    0.4,

    -0.75,
    1.0,
    0.0,
    0.4,
    0.4,
    1.0, // The front blue one
    -1.25,
    -1.0,
    0.0,
    0.4,
    0.4,
    1.0,
    -0.25,
    -1.0,
    0.0,
    1.0,
    0.4,
    0.4,

    // Three triangles on the left side
    -0.75,
    1.0,
    -4.0,
    0.4,
    1.0,
    0.4, // The back green one
    -1.25,
    -1.0,
    -4.0,
    0.4,
    1.0,
    0.4,
    -0.25,
    -1.0,
    -4.0,
    1.0,
    0.4,
    0.4,

    -0.75,
    1.0,
    -2.0,
    1.0,
    1.0,
    0.4, // The middle yellow one
    -1.25,
    -1.0,
    -2.0,
    1.0,
    1.0,
    0.4,
    -0.25,
    -1.0,
    -2.0,
    1.0,
    0.4,
    0.4,
  ]);
  const n = 18;
  const FSIZE = verticesColors.BYTES_PER_ELEMENT;

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_Color = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
  const u_ProjMatrix = gl.getUniformLocation(program, "u_ProjMatrix");
  const viewMatrix = new Matrix4();
  const projMatrix = new Matrix4();

  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  // 隐藏面消除
  gl.enable(gl.DEPTH_TEST);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}
