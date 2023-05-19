import _code from "./三角形旋转.ts?raw";
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
    drawTriangle();
  }
}
export function leave() {
  canvas.remove();
}

function drawTriangle() {
  gl = canvas.getContext("webgl");
  if (!gl) return;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let vertexSource = `
    attribute vec4 a_Position;
    uniform float u_cosB, u_sinB;
    void main(){
      gl_Position.x = a_Position.x * u_cosB - a_Position.y * u_sinB;
      gl_Position.y = a_Position.x * u_sinB + a_Position.y * u_cosB;
      gl_Position.z = a_Position.z;
      gl_Position.w = 1.0;
      gl_PointSize = 10.0;
    }
  `;
  let fragmentSource = `
    void main(){
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

  /*****分割线*****/

  // 创建顶点集
  const vertices = new Float32Array([0.0, 0.0, 0.5, 0.5, 0.5, -0.5]);
  // 点的个数
  const n = 3;

  // 创建缓冲区对象
  let vertexBuffer = gl.createBuffer();
  // 将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 向缓冲区对象中写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  // 获取变量存储位置
  let a_Position = gl.getAttribLocation(program, "a_Position");
  // 将缓冲区对象分配给a_Position变量
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // 连接a_Position变量与分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Position);

  // --------------------- 旋转
  let ANGLE = 25.0;
  let radian = (Math.PI * ANGLE) / 180.0;
  let cosB = Math.cos(radian);
  let sinB = Math.sin(radian);
  let u_cosB = gl.getUniformLocation(program, "u_cosB");
  let u_sinB = gl.getUniformLocation(program, "u_sinB");
  gl.uniform1f(u_cosB, cosB);
  gl.uniform1f(u_sinB, sinB);
  gl.drawArrays(gl.TRIANGLES, 0, n);

  /*****分割线*****/
}
