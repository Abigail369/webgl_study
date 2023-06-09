import _code from "./立方体.ts?raw";
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
    drawCube();
  }
}
export function leave() {
  canvas.remove();
}

/*****分割线*****/
function drawCube() {
  gl = canvas.getContext("webgl");
  if (!gl) return;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let vertexSource = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_MvpMatrix;
    varying vec4 v_Color;
    void main() {
      gl_Position = u_MvpMatrix * a_Position;
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

  // 隐藏面消除
  gl.enable(gl.DEPTH_TEST);

  const verticesColors = new Float32Array([
    // Vertex coordinates and color
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0, // v0 White
    -1.0,
    1.0,
    1.0,
    1.0,
    0.0,
    1.0, // v1 Magenta
    -1.0,
    -1.0,
    1.0,
    1.0,
    0.0,
    0.0, // v2 Red
    1.0,
    -1.0,
    1.0,
    1.0,
    1.0,
    0.0, // v3 Yellow
    1.0,
    -1.0,
    -1.0,
    0.0,
    1.0,
    0.0, // v4 Green
    1.0,
    1.0,
    -1.0,
    0.0,
    1.0,
    1.0, // v5 Cyan
    -1.0,
    1.0,
    -1.0,
    0.0,
    0.0,
    1.0, // v6 Blue
    -1.0,
    -1.0,
    -1.0,
    0.0,
    0.0,
    0.0, // v7 Black
  ]);
  // Indices of the vertices
  const indices = new Uint8Array([
    0,
    1,
    2,
    0,
    2,
    3, // front
    0,
    3,
    4,
    0,
    4,
    5, // right
    0,
    5,
    6,
    0,
    6,
    1, // up
    1,
    6,
    7,
    1,
    7,
    2, // left
    7,
    4,
    3,
    7,
    3,
    2, // down
    4,
    7,
    6,
    4,
    6,
    5, // back
  ]);
  const n = 18;

  let vertexColorBuffer = gl.createBuffer();
  let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const FSIZE = verticesColors.BYTES_PER_ELEMENT;

  const a_Position = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_Color = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  let u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
  let mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
