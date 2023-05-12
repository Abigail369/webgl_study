import { GUI } from "lil-gui";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import "highlight.js/styles/github-dark.css";
hljs.registerLanguage("typescript", typescript);
const div = document.getElementById("app") as HTMLDivElement;
const doc = document.getElementById("doc") as HTMLDivElement;

const gui = new GUI({
  title: "控制面板",
});
gui
  .add(
    {
      显示源码: true,
    },
    "显示源码"
  )
  .onChange((val: boolean) => {
    doc.style.display = val ? "" : "none";
  });
const menu: any = {};
let folder: GUI | undefined = gui.addFolder("组件列表");
const demos = import.meta.glob("./demos/*.ts");

for (const key in demos) {
  const exec = /\/([\u4e00-\u9fa5a-z]+)\.ts/.exec(key);
  if (exec) {
    const name = exec[1];
    menu[name] = () => {
      location.href = "./#/" + name;
    };
    folder.add(menu, name);
  }
}
folder = undefined;
let leave: (() => void) | undefined = undefined;
function locate() {
  if (folder) {
    folder.destroy();
    folder = undefined;
  }
  if (leave) {
    leave();
    leave = undefined;
  }
  const hash = decodeURI(location.hash);
  const key = hash.replace("#", "./demos") + ".ts";
  const demo = demos[key];

  if (demo) {
    demo().then((e: any) => {
      doc.children[0].innerHTML = e.code;
      if (e.enter) {
        e.enter(div);
      }
      if (e.getMenu) {
        folder = e.getMenu(gui);
      }
      leave = e.leave;
    });
  }
}
window.onhashchange = locate;
locate();
