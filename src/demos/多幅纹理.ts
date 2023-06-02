import _code from "./多幅纹理.ts?raw";
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
    draw();
  }
}
export function leave() {
  canvas.remove();
}

/*****分割线*****/

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
    uniform sampler2D u_Sampler0; 
    uniform sampler2D u_Sampler1;
    varying vec2 v_TexCoord;
    void main() {
      vec4 color0 = texture2D(u_Sampler0, v_TexCoord);
      vec4 color1 = texture2D(u_Sampler1, v_TexCoord);
      gl_FragColor = color0 * color1;
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

  // 设置纹理坐标
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

  // 创建纹理对象
  let texture0 = gl.createTexture();
  let texture1 = gl.createTexture();
  let u_Sampler0 = gl.getUniformLocation(program, "u_Sampler0");
  let u_Sampler1 = gl.getUniformLocation(program, "u_Sampler1");
  // 创建img对象
  let img0 = new Image();
  let img1 = new Image();
  img0.src = new URL(`../assets/img/redflower.jpg`, import.meta.url).href;
  img1.src = new URL(`../assets/img/circle.gif`, import.meta.url).href;

  img0.onload = function () {
    loadTexture(gl, n, texture0, u_Sampler0, img0, 0);
  };
  img1.onload = function () {
    loadTexture(gl, n, texture1, u_Sampler1, img1, 1);
  };

  let g_texUnit0 = false,
    g_texUnit1 = false;
  function loadTexture(
    gl: any,
    n: number,
    texture: any,
    u_Sampler: any,
    image: any,
    texUnit: any
  ) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    if (texUnit == 0) {
      gl.activeTexture(gl.TEXTURE0);
      g_texUnit0 = true;
    } else {
      gl.activeTexture(gl.TEXTURE1);
      g_texUnit1 = true;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler, texUnit);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (g_texUnit0 && g_texUnit1) {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
  }
}
