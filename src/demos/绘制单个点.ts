import _code from "./绘制单个点.ts?raw";
import hljs from "highlight.js";
export const code = hljs.highlight(
  "typescript",
  _code.split("/* - split - */")[2]
).value;

let app = document.getElementById("app");
let canvas: HTMLCanvasElement;
/** webgl上下文 */
let gl: WebGLRenderingContext | null;
export function enter() {
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

/* - split - */
function drawPoint() {
  gl = canvas.getContext("webgl");
  if (!gl) return;
  // 使用完全不透明的黑色清除所有图像
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清除缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 顶点着色器
  let vertexSource = `
    attribute vec4 a_Position;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = 10.0;
    }
  `;
  // 片元着色器
  let fragmentSource = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      gl_FragColor = u_FragColor;
    }
  `;
  // 初始化并编译顶点着色器
  const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log("编译顶点着色器失败");
    gl.deleteShader(vertexShader);
    return;
  }
  // 初始化并编译片元着色器
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log("编译片元着色器失败");
    gl.deleteShader(fragmentShader);
    return;
  }

  // 创建着色器程序
  let program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("创建程序失败");
    return;
  }
  gl.useProgram(program);

  // 获取变量存储位置
  let a_Position = gl.getAttribLocation(program, "a_Position");
  let u_FragColor = gl.getUniformLocation(program, "u_FragColor");

  // 测试点
  let testPoint = [0.0, 0.0, 0.0];
  // 测试颜色
  let testColor = [0.0, 0.0, 1.0, 0.5];

  // 给位置赋值
  gl.vertexAttrib3fv(a_Position, testPoint);
  gl.uniform4fv(u_FragColor, testColor);

  // 绘制
  gl.drawArrays(gl.POINTS, 0, 1);
}
