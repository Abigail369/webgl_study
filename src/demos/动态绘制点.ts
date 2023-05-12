import _code from "./动态绘制点.ts?raw";
import hljs from "highlight.js";
export const code = hljs.highlight(
  "typescript",
  _code.split("/* - split - */")[2]
).value;

let app = document.getElementById("app");
let canvas: HTMLCanvasElement;
/** webgl上下文 */
let gl: WebGLRenderingContext;
export function enter() {
  canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 500;
  if (app) {
    app.appendChild(canvas);
    drawPointByClick();
  }
}
export function leave() {
  canvas.remove();
}

function drawPointByClick() {
  gl = canvas.getContext("webgl")!;
  if (!gl) return;
  gl.clearColor(0.0, 0.0, 0.0, 0.1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let vertexSource = `
    attribute vec4 a_Position;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = 10.0;
    }
  `;
  let fragmentSource = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      gl_FragColor = u_FragColor;
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

  /* - split - */

  // 存储点位的数组
  let g_points: {
    x: number;
    y: number;
    color: number[];
  }[] = [];
  // canvas坐标下的中心点
  let width = canvas!.width / 2;
  let height = canvas!.height / 2;

  // 获取变量存储位置
  let a_Position = gl.getAttribLocation(program, "a_Position");
  // 获取u_FragColor变量的存储位置
  let u_FragColor = gl.getUniformLocation(program, "u_FragColor");

  // 添加点击事件
  canvas.addEventListener("click", clickFn, false);
  function clickFn(e: MouseEvent) {
    // 将canvas坐标系转换为webgl坐标系
    let clickX = e.pageX - canvas!.offsetLeft;
    let clickY = e.pageY - canvas!.offsetTop;
    let glX = (clickX - width) / width;
    let glY = -(clickY - height) / height;
    g_points.push({
      x: glX,
      y: glY,
      color: [numberRandom(), numberRandom(), numberRandom(), 1.0],
    });

    // 重新绘制前清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    let len = g_points.length;
    for (let i = 0; i < len; i++) {
      gl.vertexAttrib3f(a_Position, g_points[i].x, g_points[i].y, 0.0);
      gl.uniform4fv(u_FragColor, g_points[i].color);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }

  /* - split - */
}
function numberRandom() {
  return +Math.round(Math.random()).toFixed(1);
}
