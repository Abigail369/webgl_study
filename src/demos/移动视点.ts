import _code from "./移动视点.ts?raw";
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
    uniform mat4 u_ModelMatrix;
    varying vec4 v_Color;
    void main() {
      gl_Position = u_ViewMatrix * a_Position * u_ModelMatrix;
      // gl_Position = u_ViewMatrix * a_Position;
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
    0.0, 0.5, -0.4, 0.4, 1.0, 0.4, -0.5, -0.5, -0.4, 0.4, 1.0, 0.4, 0.5, -0.5,
    -0.4, 1.0, 0.4, 0.4,
  ]);

  const n = 3;
  const FSIZE = verticesColors.BYTES_PER_ELEMENT;

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_Color = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  // add
  const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
  const modelMatrix = new Matrix4();
  modelMatrix.setRotate(-10, 0, 0, 1);

  // gl.drawArrays(gl.TRIANGLES, 0, n);
  const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
  const viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
