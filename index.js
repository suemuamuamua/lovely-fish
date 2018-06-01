var can1=document.getElementById('canvas1')
var can2=document.getElementById('canvas2')

var ctx1=can1.getContext('2d')
var ctx2=can2.getContext('2d')

var canWidth=can1.width
var canHeight=can1.height

var deltaTime=0
var lastTime=Date.now()

var bgPic=new Image()

var mx=canWidth*0.5
var my=canHeight*0.5

var ane
var fruit
var mom
var baby
var data



/*************bg*************/
function drawBackground (){
	ctx2.drawImage(bgPic,0,0,canWidth,canHeight);
}

/*************ane*************/
var aneObj=function(){
	this.x=[]
	this.height=[]
	this.num=50
}

//初始化
aneObj.prototype.init=function(){
	for(var i=0;i<this.num;i++){
		this.x[i]=Math.random()*20+i*20
		this.height[i]=Math.random()*50+200
	}
}
//绘制海葵
aneObj.prototype.draw=function(){
	ctx2.save()
	ctx2.globalAlpha=0.6
	ctx2.strokeStyle="#3b154e"
	ctx2.lineWidth=20
	ctx2.lineCap="round"
	for(var i=0;i<this.num;i++){
		ctx2.beginPath()
		ctx2.moveTo(this.x[i],canHeight)
		ctx2.lineTo(this.x[i],canHeight-this.height[i])
		ctx2.stroke()
		
	}
	ctx2.restore()

}
/*************fruits*************/
var fruitObj=function(){
	this.x=[]
	this.y=[]
	this.num=30
	this.alive=[]
	this.l=[]
	this.spd=[]
	this.fruitType=[]
	this.orange=new Image()
	this.blue=new Image()
}
fruitObj.prototype.init=function(){

	for(var i=0;i<this.num;i++){
		this.alive[i]=false
		this.x[i]=0
		this.y[i]=0
		this.l[i]=0
		this.born(i)
		this.fruitType[i]="orange"
		this.spd[i]=Math.random()*0.017+0.003//[0.003,0.02)
	}
}
fruitObj.prototype.draw=function(){
	if(deltaTime>40)deltaTime=40;
	this.orange.src="img/fruit.png"
	this.blue.src="img/blue.png"
	for(var i=0;i<this.num;i++){
		if(this.fruitType[i]=="blue"){
			pic=this.blue
		}else {
			pic=this.orange
		}
		if(this.alive[i]){
			if(this.l[i]<15){
				this.l[i]+=this.spd[i]*deltaTime
				
			}else {
				this.y[i]-=this.spd[i]*6*deltaTime
			}
			ctx2.drawImage(pic,this.x[i]-this.l[i]*0.5,this.y[i]-this.l[i]*0.5,this.l[i],this.l[i])
			if(this.y[i]<10){
				this.alive[i]=false
			}
		}

	}
}
fruitObj.prototype.born=function(i){
	var aneId=Math.floor(Math.random()*ane.num)
	this.x[i]=ane.x[aneId]
	this.y[i]=canHeight-ane.height[aneId]
	this.l[i]=0
	this.alive[i]=true
	if(Math.random()<0.2){
		this.fruitType[i]="blue"
	}else {
		this.fruitType[i]="orange"
	}
}
fruitObj.prototype.fruitMonitor=function(){
	var num=0
	for(var i=0;i<this.num;i++){
		if(this.alive[i]) num++;
	}
	if(num<15){
		sendFruit()
		return;
	}
}
fruitObj.prototype.dead = function(i){
	this.alive[i] = false;
}
function sendFruit(){
	for(var i=0;i<fruit.num;i++){
		if(!fruit.alive[i]){
			fruit.born(i)
			return;
		}
	}
}

/***********mom**************/
var momObj=function(){
	this.x
	this.y
	this.eye=new Image()
	this.body=new Image()
	this.tail=new Image()
	this.angle

}
momObj.prototype.init=function(){
	this.x=canWidth*0.5
	this.y=canHeight*0.5
	this.eye.src="img/bigEye0.png"
	this.body.src="img/big.png"
	this.tail.src="img/bigTail0.png"
	this.angle=0
}
momObj.prototype.draw=function(){
	//mom follow the pointer
	this.x = lerpDistance(mx, this.x, 0.98);
	this.y = lerpDistance(my, this.y, 0.98);
	var deltaY = my - this.y;
	var deltaX = mx - this.x;
	var beta = Math.atan2(deltaY, deltaX) + Math.PI;
	this.angle = lerpAngle(beta, this.angle, 0.6);
	ctx1.save()
	ctx1.translate(this.x,this.y)
	ctx1.rotate(this.angle)
	ctx1.drawImage(this.tail,-this.tail.width*0.5+30,-this.tail.height*0.5)
	ctx1.drawImage(this.body,-this.body.width*0.5,-this.body.height*0.5)
	ctx1.drawImage(this.eye,-this.eye.width*0.5,-this.eye.height*0.5)
	ctx1.restore()
}
function onMouseMove(e){
	if (!data.gameover) {
		mx = e.offsetX;
		my = e.offsetY;
	}
}


/***********mom eat fruits**************/
function momFruitsCollision() {
	if (!data.gameover) {
		for (var i = 0; i < fruit.num; i++) {
			if (fruit.alive[i]) {
				var l = calLength2(fruit.x[i], fruit.y[i], mom.x, mom.y);
				if (l < 900) {
					fruit.dead(i);
					mom.bigBodyCount++;
					if (mom.bigBodyCount > 7) {
						mom.bigBodyCount = 7;
					}

					data.fruitNum++;
					if (fruit.fruitType[i] == "blue") {
						data.double = 2;
					}
				}
			}
		}
	}
}
// 大鱼->小鱼 碰撞检测
function momBabyCollision() {
	if (!data.gameover) {
		if (data.fruitNum > 0) {
			var l = calLength2(mom.x, mom.y, baby.x, baby.y);
			if (l < 900) {
				// 小鱼恢复体力
				baby.babyBodyCount = 0;
				mom.bigBodyCount = 0;
				data.addScore();
				wave.born(baby.x,baby.y);
			}
		}
	}
}

/***********baby**************/
var babyObj=function(){
	this.x
	this.y
	this.angle
	this.babyTailTimer = 0;
	this.babyEyeTimer = 0;
	this.babyEyeCount = 0;
	this.babyEyeInterval = 1000;
	this.babyTailCount = 0;
	this.babyBodyTimer = 0;
	this.babyBodyCount = 0;
}
babyObj.prototype.init=function(){
	this.x=canWidth*0.5
	this.y=canHeight*0.5
	this.angle=0

}
	// 动画序列帧设置
var babyTail = [];
for (var i = 0; i < 8; i++) {
	babyTail[i] = new Image();
	babyTail[i].src = "./img/babyTail" + 0 + ".png";
}
var babyEye = [];
for (var i = 0; i < 2; i++) {
	babyEye[i] = new Image();
	babyEye[i].src = "./img/babyEye" + i + ".png";
}
var babyBody = [];
for (var i = 0; i < 20; i++) {
	babyBody[i] = new Image();
	babyBody[i].src = "./img/babyFade" + i + ".png";
}

babyObj.prototype.draw=function(){
	this.x=lerpDistance(mom.x,this.x,0.99)
	this.y=lerpDistance(mom.y,this.y,0.99)
	var deltaX=mom.x-this.x
	var deltaY=mom.y-this.y
	var beta = Math.atan2(deltaY, deltaX) + Math.PI;
	this.angle=lerpAngle(beta,this.angle,0.5)
	// 尾巴切换循环
		this.babyTailTimer += deltaTime;
		if (this.babyTailTimer > 50) {
			this.babyTailCount = (this.babyTailCount + 1) % 8;
			this.babyTailTimer = 0;
		}
		// 眼睛切换循环
		this.babyEyeTimer += deltaTime;
		if (this.babyEyeTimer > this.babyEyeInterval) {
			this.babyEyeCount = (this.babyEyeCount + 1) % 2;
			this.babyEyeTimer = 0;
			if (this.babyEyeCount == 0) {
				this.babyEyeInterval = Math.random() * 2000 + 1000; //[1000,3000]
			} else {
				this.babyEyeInterval = 200;
			}
		}
		this.babyBodyTimer += deltaTime;
		if (this.babyBodyTimer > 300) {
			this.babyBodyCount = this.babyBodyCount + 1;
			this.babyBodyTimer = 0;
			if (this.babyBodyCount > 19) {
				this.babyBodyCount = 19;
				// GAME OVER
				data.gameover = true;
			}
		}

		ctx1.save();
		ctx1.translate(this.x, this.y);
		ctx1.rotate(this.angle);
		// 尾巴图片切换
		var babyTailCount = this.babyTailCount;
		ctx1.drawImage(babyTail[babyTailCount], -babyTail[babyTailCount].width / 2 + 25, -babyTail[babyTailCount].height / 2);

		// 身体颜色切换
		var babyBodyCount = this.babyBodyCount;
		ctx1.drawImage(babyBody[babyBodyCount], -babyBody[babyBodyCount].width / 2, -babyBody[babyBodyCount].height / 2);

		// 眼睛图片切换
		var babyEyeCount = this.babyEyeCount;
		ctx1.drawImage(babyEye[babyEyeCount], -babyEye[babyEyeCount].width / 2, -babyEye[babyEyeCount].height / 2);

		ctx1.restore();
}


/***********score**************/
var dataObj = function(){
	this.fruitNum = 0;
	this.double = 1;
	this.score = 0;
	this.gameover = false;
	this.alpha = 0;
}

dataObj.prototype.draw = function(){
	var w = can1.width;
	var h = can1.height;
	// 
	ctx1.save();
	ctx1.shadowBlur = 10;
	ctx1.shadowColor = "#fff";
	// 
	ctx1.fillStyle = "#fff";
	ctx1.font = "30px Verdana";
	ctx1.textAlign = "center";
	ctx1.fillText("Score: "+this.score,w/2,h-30);

	// 
	if(this.gameover){
		this.alpha += deltaTime*0.0005;
		if(this.alpha >1)this.alpha=1;
		ctx1.fillStyle = "rgba(255,255,255,"+this.alpha+")";
		ctx1.fillText("GAME OVER",w/2,h/2);
	}
		ctx1.restore();
}
dataObj.prototype.addScore = function(){
	this.score += this.fruitNum*this.double*100;
	this.fruitNum = 0;
	this.double = 1;
}

/***********wave**************/
//  吃果实特效
var waveObj = function() {
	this.x = [];
	this.y = [];

	this.alive = [];
	this.r = [];
	this.num = 10;
}
waveObj.prototype.init = function() {
	for (var i = 0; i < this.num; i++) {
		this.alive[i] = false;
		this.r[i] = 0;
	}
}
waveObj.prototype.draw = function() {
	ctx1.save();
	ctx1.lineWidth = 2;
	ctx1.shadowBlur = 10;
	ctx1.shadowColor = "#fff";
	for (var i = 0; i < this.num; i++) {
		if (this.alive[i]) {
			// draw
			this.r[i] += deltaTime *0.04;
			if(this.r[i]>80){
				this.alive[i] = false;
				break;
			}
			var alpha = 1 - this.r[i]/100;
			// 

			ctx1.beginPath();
			ctx1.arc(this.x[i],this.y[i],this.r[i],0,Math.PI*2);
			ctx1.closePath();
			ctx1.strokeStyle = "rgba(255,255,255,"+alpha+")";
			ctx1.stroke();
		}
	}
	ctx1.restore();
}
waveObj.prototype.born = function(x,y) {
	for (var i = 0; i < this.num; i++) {
		if (!this.alive[i]) {
			// born
			this.alive[i] = true;
			this.r[i] = 10;
			this.x[i] = x;
			this.y[i] = y;
			return;
		}
	}
}


/***********main**************/
game();
function game (){
	init();
	gameloop();
}
function init(){
	

	//can1  fish 
	//can2  bg ane fruit	
	bgPic.src="img/background.jpg"
	drawBackground()	

	ane=new aneObj()
	ane.init()

	fruit=new fruitObj()
	fruit.init()

	mom=new momObj()
	mom.init()

	baby=new babyObj()
	baby.init()

	data=new dataObj()
	
	can1.addEventListener("mousemove",onMouseMove,false)

}
function gameloop(){
	window.requestAnimFrame(gameloop)
	ctx2.clearRect(0,0,canWidth,canHeight)
	drawBackground()
	ane.draw()
	fruit.draw()
	fruit.fruitMonitor()


	ctx1.clearRect(0,0,canWidth,canHeight)
	mom.draw()
	momFruitsCollision()
	baby.draw()
	momBabyCollision()
	data.draw()

	//序列帧变化
	var now=Date.now()
	deltaTime=now-lastTime
	lastTime=now
}
