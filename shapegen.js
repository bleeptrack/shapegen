var vsh = `<path class="st1" d="M39.4,35.9h-5.9V30h-5.9v-5.9h-5.9V30h-5.9v5.9h-6v5.9H3.9v41.5v5.9h17.8v-5.9H9.8V71.5h23.7v17.8h11.9V77.4  h-5.9v-5.9h5.9V41.9h-5.9L39.4,35.9L39.4,35.9z M27.6,41.9v5.9h-5.9v-5.9H27.6L27.6,41.9z" id="path6" style="fill:#000000" />`;

paper.install(window);
window.onload = function() {
	// Setup directly from canvas id:
	paper.setup('myCanvas');
	
		project.view.scale(0.53);
	
		project.currentStyle.strokeColor = 'black';
		var vshpath = project.importSVG(vsh);
		vshpath.scale(4);
		vshpath.position = new Point(200,200);
		
		var idx = [0,1,2,3,4,5,6,7,8];
		shuffle(idx);
		
		var border = new Path.Rectangle([0,0],[180*2+2*300,180*2+2*300]);
		
		
		for(var i = 0; i<3; i++){
			for(var j = 0; j<3; j++){
				var vshclone = vshpath.clone();
				vshclone.position = new Point(180+i*300,180+j*300)
				id2func(idx[i*3+j],vshclone);
				//id2func(5,vshclone);
			}
		}
		vshpath.remove();
	
		/*var rect = new Path.Rectangle([250,250], [150,150]);
		var circ = new Path.Circle(rect.bounds.topLeft, 50);
		var shapetmp = rect.unite(circ);
		rect.remove();
		circ.remove();
		
		var minirect = new Path.Rectangle(shapetmp.bounds.bottomRight.subtract([50,50]), [20,20]);
		minirect.rotate(45);
		var shape = shapetmp.subtract(minirect);
		shapetmp.remove();
		minirect.remove();*/
		
		//
		//
		//
		//
		
		
}

//preparing shape if compound path
function applyPattern(func, shape){
	var remo = false;
	if(shape._class=="CompoundPath"){
		shape.children.forEach(function(item){
			remo = func(item);
		});
	}else{
		func(shape);
	}
	if(remo){
		shape.remove();
	}
}

function id2func(id,shape){
	if(id==0){
		avaFlower(shape);
	}else if(id==1){
		mirrorBeam(shape);
	}else if(id==2){
		applyPattern(outerSketch, shape);
	}else if(id==3){
		applyPattern(wiggleShape, shape);
	}else if(id==4){
		circles(shape);
	}else if(id==5){
		applyPattern(innerHair, shape);
	}else if(id==6){
		splitShape(shape);
	}else if(id==7){
		smoothRot(shape);
	}else{
		text(shape);
	}
}

function circlePacking(shape){
	var points = [];
	var dists  = [];
	for(var x = 0; x<2; x++){ 
		for(var i = 0; i<2; i++){
			var p = getPointInShape(shape);
			points.push(p);
			dists.push(p.subtract(shape.getNearestPoint(p)).length);
		}
		var idx = dists.indexOf(Math.max(...dists));
		var circ = new Path.Circle(points[idx],dists[idx]);
		var newshape = shape.subtract(circ);
		shape.remove();
		shape = newshape;
			
		points = [];
		dists  = [];
		
	}
	
	//shape.remove();
}

function circles(shape){
	var circles = [];
	var testshape = shape.clone();
	for(var x = 0; x<5; x++){
		var r = Math.min(shape.bounds.width, shape.bounds.height)/rnd(3,1);
		var center = getPointInShape(testshape);
		for(var i = r; i>5;){
			var offs = rnd(5,20)
			var circ = new Path.Circle(center.add(rnd(-offs/2,offs/2),rnd(-offs/2,offs/2)),i);
			if(i==r){
				var sh = testshape.subtract(circ);
				testshape.remove();
				testshape = sh;
				for(var ci = circles.length-1; ci>=0; ci--){
					if(circ.intersects(circles[ci])){
						var newcircle = circles[ci].subtract(circ);
						circles[ci].remove();
						circles.splice(ci,1);
						circles.push(newcircle);
					}
				}
			}
			
			var c = circ.intersect(shape);
			circ.remove();
			circles.push(c);
			i-=offs;
			
		}
	}
	//shape.remove();
	testshape.remove();
}

function splitShape(shape){
	var parts = [shape];
	var s = Math.max(shape.bounds.height, shape.bounds.width);
	
	for(var x = 0; x<rnd(3,5); x++){
		var h = rnd(30,s-30);
		var box = new Path();
		var angle = rnd(0,360);
		box.add(shape.bounds.topLeft.subtract(s));
		box.add(shape.bounds.topRight.add([s,-s]));
		box.add(shape.bounds.topRight.add([s,h]));
		box.add(shape.bounds.topLeft.add([-s,h]));
		box.closePath();
		box.rotate(angle,shape.position);
		var vec = new Point(rnd(0,15),-rnd(3,15)).rotate(angle);
		for(var i = parts.length-1; i>=0; i--){
			var cut = parts[i].intersect(box);
			var rest = parts[i].subtract(box);
			cut.translate(vec);
			parts[i].remove();
			parts.splice(i,1);
			parts.push(cut);
			parts.push(rest);
		}
		box.remove();
	}
}

function wiggleShape(shape){
	for(var i = 0; i<rnd(3,30); i++){
		var line = wiggleLine(shape,rnd(5,10),rnd(20,50),0,rnd(5,10),true);
	}
	return true;
}

function outerSketch(shape){
	for(var x = 0; x<shape.segments.length; x++){
		var mx = rnd(5,15)
		for(var i = 0; i<mx; i++){
			var currentoffset = shape.getOffsetOf(shape.segments[x].point);
			var offset = rnd(currentoffset,currentoffset + shape.segments[x].curve.length);
			var p = shape.getPointAt(offset);
			var t = shape.getTangentAt(offset);
			var n = shape.getNormalAt(offset);
			var c = shape.getCurvatureAt(offset);
			var dist = rnd(1,10);
			//var lgth = rnd(10,20)/20+Math.pow(c,2);
			var lgth = getSmallestDist(shape,p) + rnd(0,10);
			if (i==mx-1){
				var lgth = getSmallestDist(shape,p) + rnd(0,30);
			}
			
			
			var line = new Path.Line(p.add(t.multiply(lgth)), p.subtract(t.multiply(lgth)));
			line.translate(n.multiply(-dist));
			
			/*var intersections = line.getIntersections(shape);
			var intersections2 = line2.getIntersections(shape);
			
			var finalline = new Path();
			if(intersections2.length>0){
				finalline.add(intersections2[0]);
			}else{
				finalline.add(line2.lastSegment.point);
			}
			if(intersections.length>0){
				finalline.add(intersections[0]);
			}else{
				finalline.add(line.lastSegment.point);
			}
			
			line.remove();
			line2.remove();*/
		}
	}
	return true;
}

function getSmallestDist(shape, point){
	var dists = [];
	console.log(shape);
	for(var i = 0; i<shape.segments.length; i++){
		dists.push(shape.segments[i].point.subtract(point).length);
	}
	return Math.min(...dists);
}

function mirrorBeam(shape){
	var startpoint;
	var boundspath = new Path.Rectangle(shape.bounds);
	var linenr = rnd(300,600);
	var line = new Path();
	if(shape._class=="CompoundPath"){
		startpoint = shape.children[0].getPointAt( rnd(0,shape.children[0].length) );
	}else{
		startpoint = shape.getPointAt( rnd(0,shape.length) );
	}
	line.add(startpoint);
	
	for(var i = 0; i<linenr; i++){
		var newpoint = boundspath.getPointAt( rnd(0,boundspath.length) ); 
		var testLine = new Path();
		testLine.add(line.lastSegment.point);
		testLine.add(newpoint);
		
		var intersections = testLine.getIntersections(shape);
		
		
		if(shape.contains( testLine.getPointAt( 1 ))){
			
			if(intersections.length<2){
				line.add(intersections[0]);
			}else{
				line.add(intersections[1]);
			}
		}else{
			//i--;
		}
		testLine.remove();
	}
	boundspath.remove();
	shape.remove();
}

function avaFlower(shape){
	var r = 1;
	var nr = rnd(100,200);
	var point = getPointInShape(shape);
	var circ = new Path.Circle(point,r);
	for(var i = 0; i<circ.length; i+=circ.length/nr){
		var p = circ.getPointAt(i);
		var n = circ.getNormalAt(i);
		var hair = new Path.Line(p, p.add(n.multiply(new Point(shape.bounds.width,shape.bounds.height).length)));
		var wigglehair = wiggleLine(hair,10,20,0,5,false);
		hair.remove();
		
		cutLineByShape(wigglehair,shape);
	}
	shape.remove();
	circ.remove();
	return false;
}

function getPointInShape(shape){
	var point = shape.bounds.topLeft.add( shape.bounds.size.multiply( Point.random() ) );
	//var point = samplePoint(shape);
	while(!shape.contains(point)){
		point = shape.bounds.topLeft.add( shape.bounds.size.multiply( Point.random() ) );
	}
	return point;
	//return samplePoint(shape);
}

function samplePoint(shape){
	var boundpath = new Path.Rectangle(shape.bounds);
	var its = [];
	var line = new Path();
	while(its.length==0 || its.length%2==1){
		var p1 = boundpath.getPointAt(rnd(0,boundpath.length-1));
		var p2 = boundpath.getPointAt(rnd(0,boundpath.length-1));
		boundpath.remove();
		line = new Path();
		line.add(p1);
		line.add(p2);
		its = shape.getIntersections(line);
		line.remove();
	}
	//console.log(its.length);
	var offset = rnd(line.getOffsetOf(its[0].point), line.getOffsetOf(its[1].point));
	//console.log(offset);
	
	return line.getPointAt(offset);
}

function cutLineByShape(line, shape){
	if(line.intersects(shape)){
			var intersections = line.getIntersections(shape);
			for(var x = 0; x<intersections.length; x++){
				var part = line.splitAt(intersections[x]);
				
				if(!shape.contains(line.getPointAt(line.length/2))){
					line.remove();
				}
				line = part;
				
				
			}
			if(!shape.contains(line.getPointAt(line.length/2))){
				line.remove();
			}
			
			//part.remove();
			
		}else{
			line.remove();
		}
}

function wiggleLine(line, minLineDist, maxLineDist, minLineOffset, maxLineOffset, close){
	var newline = new Path();
	newline.add(line.firstSegment.point);
	for(var i = minLineDist; i<line.length; i += rnd(minLineDist,maxLineDist)){
		var p = line.getPointAt(i);
		var n = line.getNormalAt(i);
		
		var newp = rnd(0,1);
		if(newp==0){
			newp = p.add(n.multiply(rnd(minLineOffset, maxLineOffset)));
		}else{
			newp = p.subtract(n.multiply(rnd(minLineOffset, maxLineOffset)));
		}
		
		newline.add( newp );
	}
	if(!close){
		newline.add(line.lastSegment.point);
	}else{
		newline.closed = close;
	}
	newline.smooth();
	return newline;
}

function text(shape){
	var sz = [20,30];
	var rect = new Rectangle(shape.bounds.topLeft,sz);
	var txt1 = printText("KULTUR",rect);
	var txt2 = printText("NACHT",rect);
	var txt3 = printTextNumber("2019",rect);
	
	txt1.scale(shape.bounds.width/txt1.bounds.width);
	txt2.scale(shape.bounds.width/txt2.bounds.width);
	txt3.scale(shape.bounds.width/txt3.bounds.width);
	
	txt2.position = shape.position;
	txt1.bounds.bottomCenter = txt2.bounds.topCenter.subtract([0,10]);
	txt3.bounds.topCenter = txt2.bounds.bottomCenter.add([0,10]);
	shape.remove();
}

function printText(txt,rect){	
	var group = new Group();
	for(var i = 0; i<txt.length; i++){
		var r = new Rectangle([(rect.width+5)*i,0],rect.size);
		eval("var letter = "+txt.charAt(i)+"(r);");
		group.addChild(letter);
	}
	return group;
}

function printTextNumber(txt,rect){	
	var group = new Group();
	for(var i = 0; i<txt.length; i++){
		var r = new Rectangle([(rect.width+5)*i,0],rect.size);
		var letter = number(txt.charAt(i),r);
		group.addChild(letter);
	}
	return group;
}

function number(number,rect){
	var z = new Path();
	switch(number){
		case "2":
			z.add(rect.topLeft.add([0,rect.height/5]));
			z.add(rect.topLeft.add([rect.height/5,0]));
			z.add(rect.topRight.subtract([rect.height/5,0]));
			z.add(rect.topRight.add([0,rect.height/5]));
			z.add(rect.bottomLeft);
			z.add(rect.bottomRight);
			break;
		case "0":
			z.add(rect.topLeft.add([0,rect.height/5]));
			z.add(rect.topLeft.add([rect.height/5,0]));
			z.add(rect.topRight.subtract([rect.height/5,0]));
			z.add(rect.topRight.add([0,rect.height/5]));
			z.add(rect.bottomRight.subtract([0,rect.height/5,0]));
			z.add(rect.bottomRight.subtract([rect.height/5,0]));
			z.add(rect.bottomLeft.add([rect.height/5,0]));
			z.add(rect.bottomLeft.subtract([0,rect.height/5]));
			z.closePath();
			break;
		case "1":
			z.add(rect.leftCenter);
			z.add(rect.topRight);
			z.add(rect.bottomRight);
			break;
		case "9":
			z.add(rect.rightCenter);
			z.add(rect.leftCenter.add([rect.height/5,0]));
			z.add(rect.leftCenter.subtract([0,rect.height/5]));
			z.add(rect.topLeft.add([0,rect.height/5]));
			z.add(rect.topLeft.add([rect.height/5,0]));
			z.add(rect.topRight.subtract([rect.height/5,0]));
			z.add(rect.topRight.add([0,rect.height/5]));
			z.add(rect.bottomRight.subtract([0,rect.height/5,0]));
			z.add(rect.bottomRight.subtract([rect.height/5,0]));
			z.add(rect.bottomLeft);
			break;
	}
	return z;
}

function H(rect){
	var h = new Path();
	h.add(rect.topLeft);
	h.add(rect.bottomLeft);
	h.add(rect.leftCenter);
	h.add(rect.rightCenter);
	h.add(rect.topRight);
	h.add(rect.bottomRight);
	return h;
}

function C(rect){
	var c = new Path();
	c.add(rect.topRight);
	c.add(rect.topLeft.add([rect.height/5,0]));
	c.add(rect.topLeft.add([0,rect.height/5]));
	c.add(rect.bottomLeft.subtract([0,rect.height/5]));
	c.add(rect.bottomLeft.add([rect.height/5,0]));
	c.add(rect.bottomRight);
	return c;
}

function A(rect){
	var a = new Path();
	a.add(rect.bottomLeft);
	a.add(rect.topLeft.add([0,rect.height/5]));
	a.add(rect.topLeft.add([rect.height/5,0]));
	a.add(rect.topRight.subtract([rect.height/5,0]));
	a.add(rect.topRight.add([0,rect.height/5]));
	a.add(rect.bottomRight);
	a.add(rect.rightCenter);
	a.add(rect.leftCenter);
	return a;
}

function N(rect){
	var n = new Path();
	n.add(rect.bottomLeft);
	n.add(rect.topLeft);
	n.add(rect.bottomRight);
	n.add(rect.topRight);
	return n;
}

function K(rect){
	var k = new Path();
	k.add(rect.topLeft);
	k.add(rect.bottomLeft);
	k.add(rect.leftCenter);
	k.add(rect.topRight);
	k.add(rect.leftCenter);
	k.add(rect.bottomRight);
	return k;
}

function U(rect){
	var u = new Path();
	u.add(rect.topLeft);
	u.add(rect.bottomLeft.subtract([0,rect.height/5]));
	u.add(rect.bottomLeft.add([rect.height/5,0]));
	u.add(rect.bottomRight.subtract([rect.height/5,0]));
	u.add(rect.bottomRight.subtract([0,rect.height/5]));
	u.add(rect.topRight);
	return u;
}

function L(rect){
	var l = new Path();
	l.add(rect.topLeft);
	l.add(rect.bottomLeft);
	l.add(rect.bottomRight);
	return l;
}

function T(rect){
	var t = new Path();
	t.add(rect.topLeft);
	t.add(rect.topRight);
	t.add(rect.topCenter);
	t.add(rect.bottomCenter);
	return t;
}

function R(rect){
	var r = new Path();
	r.add(rect.bottomLeft);
	r.add(rect.topLeft);
	r.add(rect.topRight.subtract([rect.height/5,0]));
	r.add(rect.topRight.add([0,rect.height/5]));
	r.add(rect.rightCenter.subtract([0,rect.height/5]));
	r.add(rect.rightCenter.subtract([rect.height/5,0]));
	r.add(rect.leftCenter);
	r.add(rect.center);
	r.add(rect.bottomRight);
	return r;
}

function smoothRot(shape){
	for(var i = 0; i<rnd(3,8); i++){
		var s = shape.clone();
		s.smooth({ type: 'catmull-rom', factor: i/5 });
		s.translate([3*i,3*i]);
	}
	shape.remove();
}

function innerHair(shape){
	var dist = 3;
	
	for(var i = 0; i<shape.length; i+=dist){
		var p = shape.getPointAt(i);
		var n = shape.getNormalAt(i);
		var hair = new Path.Line(p, p.add(n.multiply(rnd(3,15))));
	}
	
	/*shape.segments.forEach(function(segment){
		var offset = shape.getOffsetOf(segment.point);
		var n1 = shape.getNormalAt( (offset-dist) % shape.length );
		var n2 = shape.getNormalAt( (offset+dist) % shape.length );
		var angle = n2.getDirectedAngle(n1);
		
	});*/
	return true;
}

function rnd(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function rndGauss() {
  var rand = 0;

  for (var i = 0; i < 6; i += 1) {
    rand += Math.random();
  }

  return rand / 6;
}

function downloadSVG(){
	var svg = project.exportSVG({ asString: true });    
	var svgBlob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
	var svgUrl = URL.createObjectURL(svgBlob);
	var downloadLink = document.createElement("a");
	downloadLink.href = svgUrl;
	downloadLink.download = "kulturnacht2019.svg";
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
}
