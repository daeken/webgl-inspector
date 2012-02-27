var elem, gl;
var width = 512, height = 512, curImg, isVideo;

function init() {
	elem = $('#cvs')[0];
	$(elem).attr('width', width).attr('height', height);
	$(elem).css('width', width).css('height', height);
	gl = elem.getContext('experimental-webgl') || elem.getContext('webgl');
	var verts = new Float32Array([0,0,2,0,0,2,2,0,2,2,0,2]);
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	gl.viewport(0, 0, width, height);
	gl.tex = undefined;

	set_tex('mona_lisa', false);
	gl.ltime = new Date;

	choose_function('normal');

	render();
	return true;
}

function choose_function(name) {
	var prog = gl.createProgram();
	var vs = gl.createShader(gl.VERTEX_SHADER), fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(vs, vertex_shader);
	gl.compileShader(vs);
	gl.attachShader(prog, vs);
	gl.shaderSource(fs, fragment_shader.replace('$func$', name));
	gl.compileShader(fs);
	if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
		console.log('Fragment shader failed: ' + gl.getShaderInfoLog(fs));
		alert('compile fail');
		return false;
	}
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		console.log('Link failed: ' + gl.getProgramInfoLog(prog));
		alert('link fail');
		return false;
	}
	gl.useProgram(prog);
	gl.prog = prog;
	var pos = gl.getAttribLocation(prog, 'pos');
	gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(pos);
	gl.time = gl.getUniformLocation(prog, 'time');
	var res = gl.getUniformLocation(prog, 'resolution');
	gl.uniform2f(res, width, height);
	var sampler = gl.getUniformLocation(prog, 'sampler');
	gl.uniform1i(sampler, 0);
}

function set_tex(img, is_video) {
	if(gl.tex)
		gl.deleteTexture(gl.tex);
	var tex = gl.tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.activeTexture(gl.TEXTURE0);
	if(isVideo)
		curImg.pause();
	curImg = $('#' + img)[0];
	isVideo = is_video;
	if(is_video) {
		curImg.play();
		//curImg.addEventListener('progress', render);
	}
}

function render() {
	if(!isVideo || curImg.readyState === curImg.HAVE_ENOUGH_DATA)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, curImg);
	gl.uniform1f(gl.time, (((new Date()) - gl.ltime) % 30000) / 1e3);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	if(window.mozRequestAnimationFrame) window.mozRequestAnimationFrame(render, curImg);
	//if(window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame(render, elem);
	//setTimeout(function() { render(gl) }, 1000/60);
}

$(document).ready(function() {
	vertex_shader = $('#vertex_shader').html();
	fragment_shader = $('#fragment_shader').html();
	init()
})
