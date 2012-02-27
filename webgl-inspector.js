(function() {
	function ContextInspector = function(ctx) {
		this.ctx = ctx;
	};


	Function.prototype.capture = function(cfunc) {
		var name = /function (.*?)\(/.exec(this.toString())[1];
		var _this = this, old = this.bind(this.ctx);
		this.ctx[name] = (function() {
			return cfunc.apply(_this.ctx, [old].concat(arguments))
		}).bind(this.ctx);
	};
	HTMLCanvasElement.prototype.origGetContext = HTMLCanvasElement.prototype.getContext;
	HTMLCanvasElement.prototype.getContext = function(type) {
		if(type.indexOf('webgl') < 0)
			return this.origGetContext(type);
		var ctx = this.origGetContext(type);
		if(ctx == null) return null;

		for(name in ctx)
			if(ctx[name].bind)
				ctx[name].ctx = ctx;

		var textures = [];

		ctx.createTexture.capture(function(old) {
				var tex = old();
				textures.push(tex);
				console.log(textures);
				return tex;
		});
		ctx.deleteTexture.capture(function(old, tex) {
			old(tex);
			var index = textures.indexOf(tex);
			if(index < 0) return;
			textures.splice(index, 1);
		});

		return ctx;
	};
})()
