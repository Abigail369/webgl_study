import _code from "./纹理图像.ts?raw";
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
    draw();
  }
}
export function leave() {
  canvas.remove();
}

function draw() {
  gl = canvas.getContext("webgl");
  if (!gl) return;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let vertexSource = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main() {
      gl_Position = a_Position;
      v_TexCoord = a_TexCoord;
    }
  `;
  let fragmentSource = `
    precision mediump float;
    uniform sampler2D u_Sampler; 
    varying vec2 v_TexCoord;
    void main() {
      gl_FragColor = texture2D(u_Sampler, v_TexCoord);
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

  // 设置纹理坐标
  // 前 Vertex coordinates, 后 texture coordinate
  const verticesTexCoords = new Float32Array([
    -0.5,
    0.5,
    0.0,
    1.0, // 左上
    -0.5,
    -0.5,
    0.0,
    0.0, // 左下
    0.5,
    0.5,
    1.0,
    1.0, // 右上
    0.5,
    -0.5,
    1.0,
    0.0, // 右下
  ]);
  const n = 4;

  // 将顶点坐标和纹理坐标写入缓冲区对象
  let vertexTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

  // 将顶点坐标分配给a_Position变量并开启
  let a_Position = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);
  // 获取a_TexCoord变量的存储位置，将缓冲区中的【纹理坐标】分配给改变量，并开启
  let a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);

  // 配置和加载纹理
  // 创建纹理对象->管理webgl系统中的纹理
  let texture = gl.createTexture();
  // 获取uniform变量u_Sampler的存储位置，该变量用来接受纹理图像
  let u_Sampler = gl.getUniformLocation(program, "u_Sampler");
  // 创建img对象
  let img = new Image();
  img.src = new URL(`../assets/img/sky.jpg`, import.meta.url).href;
  img.onload = function () {
    // 对纹理对象进行y轴反转
    gl?.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 开启0号纹理单元
    gl?.activeTexture(gl.TEXTURE0);
    // 绑定纹理对象
    gl?.bindTexture(gl.TEXTURE_2D, texture);
    // 配置纹理参数
    gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // 配置纹理图像
    gl?.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    // 将0号纹理传递给拾色器中的取样器变量
    gl?.uniform1i(u_Sampler, 0);

    gl?.clear(gl.COLOR_BUFFER_BIT);
    gl?.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  };
}
