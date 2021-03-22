function $(s) {
	return document.querySelectorAll(s);
}

var lis = $('#list li');
var size = 32;

var box = $('#box')[0];
var height, width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots = [];
var line;

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

/**----------------------------------------------------------------------------**/
//接收获取音频频率的函数数组
var mv = new MusicVisualizer({
	size: size,
	visualizer: draw
});

for (var i = 0; i < lis.length; i++) {
	lis[i].onclick = function() {
		for (var j = 0; j < lis.length; j++) {
			lis[j].className = "";
		}
		this.className = "selected";
		mv.play("/media/" + this.title);
	}
}
/*杂项函数*/
// 随机生成两个数之间的数
function random(m, n) {
	return Math.round(Math.random() * (n - m) + m);
}

// 获取两点间距离
function findDistance(p1, p2){
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function intRandom(low, up) {
    return Math.floor(Math.random() * (up - low) + low);
}


//斑点生成函数
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
			//alpha:alpha
		});
	}
}


function resize() { //动态改变canvas区域的宽高
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

function draw(arr) { // 绘制矩形函数
	ctx.clearRect(0, 0, width, height); // 清除上次canvas,保证流畅效果
	var w = width / size;
	var cw = w * 0.6; // 矩形的宽度
	var capH = cw > 10 ? 10 : cw; // 小帽的高度
	ctx.fillStyle = line; // 每次点击矩形展示，会到矩形展示

	if (draw.type === 'column')
	{   ctx.clearRect(0, 0, width, height); // 清除上次canvas,保证流畅效果
	    for (var i = 0; i < size; i++) {
		    var o = Dots[i];
			var h = arr[i] / 256 * height;
			ctx.fillRect(w * i, height - h, cw, h); //x轴坐标,y轴坐标,宽度(0.4留为间隙),高度
			ctx.fillRect(w * i, height - (o.cap + capH), cw, capH); //绘制小帽
			o.cap--;
			if (o.cap < 0) { // 没点击歌曲时小帽的初始位置
				o.cap = 0;
			}
			if (h > 0 && o.cap < h + 40) { // 保持小帽和矩形条的距离是40
				o.cap = h + 40 > height - capH ? height - capH : h + 40;
			}
		}
		ctx.restore();
	} else if (draw.type === 'glim') {
	    ctx.save();
	    ctx.clearRect(0, 0, width, height);
	    for (var i = 0; i < size; i++) {
		    var o = Dots[i];
			ctx.beginPath(); // 表示要开始绘制，没有该方法会有连线
			var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10; //绘制圆的半径(设置最小值为10)
			ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
			var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r); //创建径向渐变
			g.addColorStop(0, "#fff");
			g.addColorStop(1, o.color);
			ctx.fillStyle = g;
			ctx.fill();
			o.x += o.dx; // 圆向右移动
			o.x = o.x > width ? 0 : o.x; // 移到最右边时回到最左边
		}
		ctx.restore();
	}else if (draw.type === 'dot') {
	    ctx.save();
	    ctx.clearRect(0, 0, width, height);
	    for (var i = 0; i < size; i++) {
	        ctx.beginPath(); // 表示要开始绘制，没有该方法会有连线
		    var o = Dots[i];
			var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10; //绘制圆的半径(设置最小值为10)
			ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
            ctx.fillStyle = 'rgba(255,255,255,' + o.alpha + ')';
            ctx.fill();
            //ctx.shadowBlur = o.shadowBlur;
            //ctx.shadowColor = o.color;
            o.x+=o.dx;
            o.x=o.x>width?0:o.x;
            ctx.closePath();
		}
		ctx.restore();
	}else if (draw.type==="star"){
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
	}else if (draw.type==="bubble"){
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
	else if(draw.type==="bar")
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
    else if(draw.type==="spot")
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

}

/* 切换柱状图或者点状的展现 */
draw.type = "column"; // 在draw函数上绑定一个属性，默认展现柱状图
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

/*音量*/
$('#volume')[0].onmousemove = function() {
	mv.changeVolume(this.value / this.max); //频率
}
$('#volume')[0].onmousemove(); // 让它默认60生效

//$('#box').onclick = function() {
//	$("#box").hide(1);
//}