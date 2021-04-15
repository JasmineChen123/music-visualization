function $(s) {
	return document.querySelectorAll(s);
}

var size = 32;
var box = $('#box')[0];
var height, width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots = [];
var line;

/*--------------------------canvas初始化-----------------------------*/
//inital for bar
var bars = [];
var dots = [];
 bar_colors = ['105, 210, 231','27, 103, 107','190, 242, 2',
               '235, 229, 77','0, 205, 172','22, 147, 165',
               '249, 212, 35','255, 78, 80','231, 32, 78',
               '12, 202, 186','255, 0, 111'];
var barWidth = Math.ceil(canvas.width / 8);//64
for (var i = 0; i < 128; i++) {
    dots[i] = 0;
    bars[i] = {
        x: i * barWidth,
        w: barWidth/1.5,
        h: 0,
        color: bar_colors[Math.floor(Math.random() * bar_colors.length)],
        }
 }

//inital for spot
var spot_particles = [];
spot_colors = ['105, 210, 231','27, 103, 107','190, 242, 2',
               '235, 229, 77','0, 205, 172','22, 147, 165',
               '249, 212, 35','255, 78, 80','231, 32, 78',
               '12, 202, 186','255, 0, 111'];
for (var i = 0; i < 128; i++) {
    spot_particles[i] = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        color: 'rgba(' + spot_colors[Math.floor(Math.random() * spot_colors.length)] + ', 0)',
        size: 0,
        opacity: Math.random() + 0.2
    }
}
//initial for bubble
var bub_particles = [];
bub_colors = ['#f35d4f','#f36849','#c0d988','#6ddaf1','#f1e85b'];
for(var i = 0; i < 128; i++){
    bub_particles[i] = {
        x: Math.round(Math.random() * canvas.width),
        y: Math.round(Math.random() * canvas.height),
        rad: Math.round(Math.random() * 10) + 15,
        rgba: bub_colors[intRandom(0, 5)],
        vx: Math.round(Math.random() * 1) - 1.5,
        vy: Math.round(Math.random() * 1) - 1.5
    }
}
//initial for cardiogram
var lastValue = [];
var     seperate = [], // 间隙
        seperateTimer = 0, // 间隙转换计时
        shadowBlur = 0, // 线模糊值
        avarage = 0; // 平均值
for (var i = 0; i < 256; i++) {
     lastValue[i] = 0;
    }
line_color = {r: 100,g: 100,b: 100,
              rS: intRandom(1, 3),gS: intRandom(1, 3),bS: intRandom(1, 3),
              rD: 1, gD: 1, bD: 1,}


/*--------------------接收获取音频频率的函数数组---------------------*/

var mv = new MusicVisualizer({
	size: size,
	visualizer: draw
});

/*-------------------------杂项函数---------------------------------*/

// 随机数
function random(m, n) {
	return Math.round(Math.random() * (n - m) + m);
}
// 获取两点间距离
function findDistance(p1, p2){
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
// 随机数
function intRandom(low, up) {
    return Math.floor(Math.random() * (up - low) + low);
}
// 改变颜色
function changeColor() {
    choice = intRandom(0, 9);
    if (choice < 3) {
        line_color.r = line_color.r + line_color.rS * line_color.rD;
        if (line_color.r > 225) {
            line_color.rD = -1;
        } else if (line_color.r < 100) {
            line_color.rD = 1;
        }
    } else if (choice < 6) {
        line_color.g = line_color.g + line_color.gS * line_color.gD;
        if (line_color.g > 225) {
            line_color.gD = -1;
        } else if (line_color.g < 100) {
            line_color.gD = 1;
        }
    } else {
        line_color.b = line_color.b + line_color.bS * line_color.bD;
        if (line_color.b > 225) {
            line_color.bD = -1;
        } else if (line_color.b < 100) {
            line_color.bD = 1;
        }
    }
}

/*--------------------------canvas绘制--------------------------------*/

//canvas初始化——斑点生成函数
function getDots() {
	Dots = [];

	for (var i = 0; i < size; i++) {
		var x = random(0, width);
		var y = random(0, height);
		var color = "rgba(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ",0)"
		var shadowBlur = Math.floor(Math.random() * 30) + 15;
		var alpha = random(0,1);
		Dots.push({
			x: x,
			y: y,
			dx: random(1, 2), //x坐标移动增量
			color: color,
			cap: 0, //柱状图上的小帽属性
			shadowBlur:shadowBlur,
		});
	}
}

//动态改变canvas区域的宽高
function resize() {
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.height = height;
	canvas.width = width;
	line = ctx.createLinearGradient(0, 0, 0, height); //创建线性渐变
	line.addColorStop(0, "gold");
	line.addColorStop(0.5, "cyan");
	line.addColorStop(1, "magenta");
	getDots();
}
resize();
window.onresize = resize;

//8种可视化效果的具体实现
function draw(arr) {
	var w = width / size;
	var cw = w * 0.6; // 矩形宽度
	var capH = cw > 10 ? 10 : cw; // 小帽高度

	ctx.fillStyle = line;

	if (draw.type === 'column')// 带颜色渐变的柱状图
	{
		ctx.save();
		var i,b;
        var total = 0, avarage = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        line = ctx.createLinearGradient(0, 0, 0, canvas.height*0.8); //创建线性渐变
	    line.addColorStop(0, "gold");
	    line.addColorStop(0.5, "cyan");
	    line.addColorStop(1, "magenta");

        for (i = 0; i < 128; i++) {
            b = bars[i];
            if (b.h == 0) {
                b.h = arr[i];
            }
            else {
                if (b.h < arr[i]) {
                    b.h += Math.floor((arr[i] - b.h) / 2);
                } else {
                    b.h -= Math.floor((b.h - arr[i]) / 1.2);
                }
            }
            ctx.fillStyle = line;
            b.h *= 1.8;
            ctx.fillRect(b.x, canvas.height - b.h, b.w*0.8, b.h);
            if (dots[i] < b.h) {
                dots[i] = b.h;
            } else {
                dots[i]--;
            };
	        ctx.fillStyle = line;
            ctx.fillRect(b.x, canvas.height - dots[i] - b.w, b.w*0.8, b.w);
            total += arr[i];
	    }
        avarage = Math.floor(total / 32);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(0, canvas.height - avarage, canvas.width, avarage);
        ctx.fillRect(canvas.width - avarage, 0, avarage, canvas.height);
        ctx.fillRect(0, 0, canvas.width, avarage);
        ctx.fillRect(0, 0, avarage, canvas.height);
        ctx.restore();

	} else if (draw.type === 'glim') { //带有颜色放射渐变的斑点
	    ctx.save();
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    for (var i = 0; i < size; i++) {
		    var o = Dots[i];
			ctx.beginPath();
			var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10; //绘制圆的半径(设置最小值为10)
			ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
			var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r); //创建径向渐变
			g.addColorStop(0, "#fff");
			g.addColorStop(1, o.color);
			ctx.fillStyle = g;
			ctx.fill();
			o.x += o.dx;
			o.x = o.x > canvas.width ? 0 : o.x;
		}
		ctx.restore();

	}else if (draw.type === 'dot') { //带有颜色梯度渐变的斑点
	    ctx.save();
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    for (var i = 0; i < size; i++) {
	        ctx.beginPath();
		    var o = Dots[i];
			var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10; //绘制圆的半径(设置最小值为10)
			ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
            ctx.fillStyle = 'rgba(255,255,255,' + o.alpha + ')';
            ctx.fill();
            //ctx.shadowBlur = o.shadowBlur;
            //ctx.shadowColor = o.color;
            o.x+=o.dx;
            o.x=o.x>canvas.width?0:o.x;
            ctx.closePath();
		}
		ctx.restore();
	}else if (draw.type==="star"){ //旋转的星
	    ctx.save();
	    twoPI = 2 * Math.PI,
        angleGap = twoPI / 3,
	    angle = 0;
	    color = 'rgba(186, 135, 72, 0.5)';
	    cx = canvas.width / 2;
	    cy = canvas.height / 2;
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    ctx.globalCompositeOperation = 'lighter';
	    ctx.strokeStyle = color;
	    ctx.lineWidth = 12;
	    total = 0;
	    for (i = 12; i < size; i += 2) {
	        angle += 0.2;
	        ctx.beginPath();
	        ctx.moveTo(cx + 2 * arr[i] * Math.sin(angle), cy + 2 * arr[i] * Math.cos(angle));
	        ctx.lineTo(cx + 2 * arr[i] * Math.sin(angle + angleGap), cy + 2 * arr[i] * Math.cos(angle + angleGap));
	        ctx.lineTo(cx + 2 * arr[i] * Math.sin(angle + angleGap * 2), cy + 2 * arr[i] * Math.cos(angle + angleGap * 2));
	        ctx.closePath();
	        ctx.stroke();
	        total += arr[i];
	    }
	    ctx.restore();
	}else if (draw.type==="bubble"){ //气泡图
	    //initial
        ctx.save();
        len = arr.length / 2 ;  //粒子密度变大

	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    ctx.globalCompositeOperation = 'lighter';
	    ctx.lineWidth = 12;

	    for (i = 0, total = 0; i < len; i++) {
            total += arr[i];
        }
	    avg = total / len;

        for(i = 0; i < len; i++){
            p = bub_particles[i];
            factor = 1;
            for(j = 0; j < len; j++){
                p2 = bub_particles[j];
                if(p.rgba == p2.rgba && findDistance(p, p2) < avg){
                    ctx.strokeStyle = p.rgba;
                    ctx.beginPath();//画一条线
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    factor += 0.6;
                }
            }
            ctx.fillStyle = p.rgba;
            ctx.strokeStyle = p.rgba;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.rad * factor, 0, Math.PI * 2, true);//创建一个圆
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(p.x, p.y, (p.rad + 5) * factor, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.closePath();

            p.x += p.vx;
            p.y += p.vy;

            if(p.x > canvas.width + p.rad) p.x = 0;
            if(p.x < -p.rad) p.x = canvas.width;
            if(p.y > canvas.height + p.rad) p.y = 0;
            if(p.y < -p.rad) p.y = canvas.height;
        }
        ctx.restore();
	}
	else if(draw.type==="bar") //柱状图
	{   var i,b;
        var total = 0, avarage = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (i = 0; i < 128; i++) {
            b = bars[i];
            if (b.h == 0) {
                b.h = arr[i];
            }
            else {
                if (b.h < arr[i]) {
                    b.h += Math.floor((arr[i] - b.h) / 2);
                } else {
                    b.h -= Math.floor((b.h - arr[i]) / 1.2);
                }
            }
            ctx.fillStyle = 'rgba(' + b.color + ', 0.8)';
            b.h *= 1.8;
            ctx.fillRect(b.x, canvas.height - b.h, b.w, b.h);
            if (dots[i] < b.h) {
                dots[i] = b.h;
            } else {
                dots[i]--;
            };
            ctx.fillStyle = ctx.fillStyle.replace('0.8)', '0.5)');
            ctx.fillRect(b.x, canvas.height - dots[i] - b.w, b.w, b.w);
            total += arr[i];
	    }
        avarage = Math.floor(total / 32);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(0, canvas.height - avarage, canvas.width, avarage);
        ctx.fillRect(canvas.width - avarage, 0, avarage, canvas.height);
        ctx.fillRect(0, 0, canvas.width, avarage);
        ctx.fillRect(0, 0, avarage, canvas.height);
        ctx.restore();
    }
    else if(draw.type==="spot") //伸缩斑点图
    {
        var  len = 64;
        ctx.save();
        arr_=arr;//smaller
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (i = 0, len = arr_.length; i < len; i = i + 1) {
            p = spot_particles[i];
            if (p.size == 0) {
                p.size = arr_[i];

            } else {
                if (p.size < arr_[i]) {
                    p.size += Math.floor((arr_[i] - p.size) / 5);
                    p.opacity = p.opacity + 0.02;
                    if (p.opacity > 1) {
                        p.opacity = 1;
                    }
                } else {
                    p.size -= Math.floor((p.size - arr_[i]) / 5);
                    if (arr_[i] == 0) {
                        p.opacity = 0;
                    } else {
                        p.opacity = p.opacity - 0.02;
                        if (p.opacity < 0) {
                            p.opacity = 0;
                            p.x = Math.random() * box.clientWidth;
                            p.y = Math.random() * box.clientHeight;
                        }
                    }
                }
            }
            var color = p.color.replace('0)', p.opacity + ')');
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI, true);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
    else if(draw.type==="cardiogram")//心电图
    {   ctx.save();

        var color = null,
            choice;
        var width = canvas.width / 64,
            x = 0,
            y = 0,
            direction = 1,
            middle =  canvas.height / 2 ,
            seperateLength = 0,
            seperateNum = 0,
            total = 0,
            lastAvarage = avarage;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        changeColor();
        var grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height),
            r = line_color.r,
            g = line_color.g,
            b = line_color.b;
        ctx.shadowColor = 'rgba(' + (r + 70) + ', ' + (g + 70) + ', ' + (b + 70) + ', 1)';
        ctx.shadowBlur = shadowBlur;
        ctx.strokeStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 100;

        ctx.beginPath();//开始画线
        ctx.moveTo(0, canvas.height / 2);

        if (seperateTimer == 0) {
            seperateTimer = Math.floor(Math.random() * 50) + 20;
            for (var i = 0; i <64; i++) {
                seperate[i] = 0;
            }
            seperateNum = Math.floor(Math.random() * 15);
            for (var i = 0; i < seperateNum; i++) {
                seperateLength = Math.floor(Math.random() * 15);
                var temp = Math.floor(Math.random() * 32);
                seperate[temp] = 1;
                for (var j = 1; j < seperateLength; j++) {
                    seperate[temp + j] = 1;
                }
            }
        } else {
            seperateTimer--;
        }
        for (var i = 0; i <64; i++) {
            y = arr[i] - (100 - i) * 0.2;
            y = (y - 80) < 0 ? 0 : y - 80;
            if (y > middle) {
                y = middle;
            }
            if (seperate[i] == 1) {
                lastValue[i] -= 20;
                if (lastValue[i] < 0) {
                    lastValue[i] = 0;
                }
                y = lastValue[i];
            } else {
                if (y - lastValue[i] > 20) {
                    lastValue[i] += 20;
                    y = lastValue[i];
                } else {
                    lastValue[i] = y;
                }
            }
            y = y * direction + middle;
            ctx.lineTo(x, y);
            total += y;
            direction = -direction;
            x = x + 2*width;
        }
        avarage = total / 128;
        if (lastAvarage > avarage) {
            shadowBlur--;
        } else {
            shadowBlur++;
        }
        ctx.lineTo(canvas.width, canvas.height/2);//画线终止
        ctx.stroke();
        ctx.restore();
    }
}
/*--------------------------------------------------------------*/

/* 切换展示效果 */
draw.type = "glim"; // 默认展现glim图
var types = $("#type li");
for (var i = 0; i < types.length; i++) {
	types[i].onclick = function() {
		for (var j = 0; j < types.length; j++) {
			types[j].className = "";
		}
		this.className = "selected";
		draw.type = this.getAttribute('data-type');
	}
}
var types2 = $("#effect-list li");
for (var i = 0; i < types.length; i++) {
	types2[i].onclick = function() {
		for (var j = 0; j < types2.length; j++) {
			types2[j].className = "";
		}
		this.className = "selected";
		draw.type = this.getAttribute('data-type');
	}
}

/*用DOM方法添加临时增加的歌曲*/
$('h1').onclick = function(){
    $("#input-file")[0].onclick();
}

var append_url=[];
$("#input-file")[0].addEventListener('change',function selectedFileChanged(){
    var file=this.files[0];
	var mname=file.name;

	var filelist = $("#file-list");
	var textNode = document.createTextNode(mname);
	var newli = document.createElement("li");
	newli.title = mname;
	newli.appendChild(textNode);
	$("#file-list")[0].appendChild(newli);

    var murl= URL.createObjectURL(file);//获取播放路径
    append_url.push(murl);

    newli.onclick = function(){
		for (var j = 0; j < lis2.length; j++) {
		    lis2[j].className = "";
		}
		this.className = "selected";
        mv.restart(murl);
	    audio.src = murl;
        audio.play();
    }
        newli.oncontextmenu = function(e){
        for (var j = 0; j < lis2.length; j++) {
		    lis2[j].className = "";
		}
        e.preventDefault();
        mv.pause();

		if (audio.paused == true) {
            audio.play();
        } else {
            audio.pause();
        }
    }
}
);

var audio = $('audio')[0];
audio.pause();

/*选择某一首歌播放*/
var lis2_ = document.getElementById('file-list');
var lis2 =lis2_.getElementsByTagName('li');
for (var i = 0; i < lis2.length; i++) {
    lis2[i].onclick = function(){

		for (var j = 0; j < lis2.length; j++) {
			lis2[j].className = "";
		}
        this.className = "selected";

        var url_= "/media/" + this.title;
         mv.restart(url_)
        audio.src=("/media/"+this.title);
		audio.play();

        }

    lis2[i].oncontextmenu = function(e){
        e.preventDefault();
        for (var j = 0; j < lis2.length; j++) {
			lis2[j].className = "";
		}

		mv.pause();
		if (audio.paused == true) {
            audio.play();
        } else {
            audio.pause();
        }
    }
}

/*显示或隐藏左右列表*/
var fileListWrapper = document.getElementById('file-list-wrapper');
var effectListWrapper = document.getElementById('effect-list-wrapper');
var fileListHeader = document.getElementById('file-list-header');
var effectListHeader = document.getElementById('effect-list-header');

fileListHeader.oncontextmenu=function(e){
    e.preventDefault();
    if (fileListWrapper.style.left!= '0px') {
        fileListWrapper.style.left='0px';
        effectListWrapper.style.right='0px';
    } else {
        fileListWrapper.style.left='-190px';
        effectListWrapper.style.right='-190px';
    }
}
effectListHeader.oncontextmenu=function(e){
    e.preventDefault();
    if (fileListWrapper.style.left!= '0px') {
        fileListWrapper.style.left='0px';
        effectListWrapper.style.right='0px';
    } else {
        fileListWrapper.style.left='-190px';
        effectListWrapper.style.right='-190px';
    }
}


/*音量调节*/
$('#volume')[0].onmousemove = function() {
	mv.changeVolume(this.value / this.max);
}
$('#volume')[0].onmousemove();

/*help按钮*/
var help_image = document.getElementById('help-image');
var help = document.getElementById('help');
var help_btn = document.getElementById('help-btn');
$('#help-btn')[0].onclick = function(){
    help_image.style.display = 'block';
    help.style.display = 'block';
}

$('#help')[0].onclick = function(){
    help_image.style.display = 'none';
    help.style.display = 'none';
    help_btn.style.display = 'none';
}