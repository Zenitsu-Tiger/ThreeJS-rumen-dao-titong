// 生成一个canvas对象，标注文字为参数name
function createCanvas(img,name) {
    /**
     * 创建一个canvas对象，绘制几何图案或添加文字
     */
    const canvas = document.createElement("canvas");
    const w = 140; //根据渲染像素大小设置，过大性能差，过小不清晰
    const h = 80;
    canvas.width = w;
    canvas.height = h;
    const h1 = h * 0.8;
    const c = canvas.getContext('2d');
    c.fillStyle = "rgba(0,0,0,0.0)"; //背景透明
    c.fillRect(0, 0, w, h);
    c.drawImage(img, 0, 0, w, h);//图片绘制到canvas画布上
    // 文字
    c.beginPath();
    c.translate(w / 2, h1 / 2);
    c.fillStyle = "#ffffff"; //文本填充颜色
    c.font = "normal 32px 宋体"; //字体样式设置
    c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText(name, 0, 0);
    return canvas;
}

export default createCanvas;