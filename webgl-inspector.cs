Contexts = []

class Context
	constructor: (@ctx, @element) ->
		@canvas = $(@element)
		Contexts.push this
		@changeFunction = null
		@textures = []
		@buffers = []
		@programs = []
		@framebuffers = []
		@renderbuffers = []
		@shaders = []

	change: (changeFunction) ->
		@changeFunction = changeFunction if changeFunction?
		@changeFunction() if @changeFunction?

	render: (inspector) ->
		dropdown = (name, func) ->
			shown = false
			container = $('<div></div>')
			container.append $('<span>' + name + '</span>').click ->
				if shown then sub.hide()
				else sub.show()
				shown = !shown
			container.append sub = $('<div style="display: none; padding-left: 10px">')
			func sub
			container
		highlighted = false
		origBorder = null
		highlight = =>
			if highlighted
				@canvas.css 'border', origBorder
			else
				origBorder = @canvas.css 'border' # This does not pull the original border.
				@canvas.css 'border', '5px solid green'
			highlighted = !highlighted
		if @canvas.attr('id')
			id = '#' + @canvas.attr('id')
		else
			id = 'unknown'
		inspector.append 'Current canvas ' + id
		inspector.append $('<span> (Hover over to highlight)</span>').hover highlight
		inspector.append '<br><br>'
		inspector.append dropdown 'Programs', (elem) =>
			for i of @programs
				elem.append dropdown i, (elem) =>
					for s of @programs[i]._shaders
						shader = @programs[i]._shaders[s]
						type = if shader._type == @ctx.FRAGMENT_SHADER then 'Fragment shader' else 'Vertex shader'
						elem.append dropdown type, (elem) =>
							elem.append '<pre>' + shader._source + '</pre>'

	insert: (arr, val, dtor) ->
		val._arr = arr
		val._dtor = dtor.bind this
		arr.push val
		val

	delete: (val) ->
		return if !val._arr? || !val._dtor?
		val._dtor val
		index = val._arr.indexOf val
		return if index < 0
		val._arr.splice index, 1

	createTexture: ->
		@insert @textures, @_createTexture(), @_deleteTexture
	deleteTexture: (tex) ->
		@delete tex

	createBuffer: ->
		@insert @buffers, @_createBuffer(), @_deleteBuffer
	deleteBuffer: (buf) ->
		@delete buf

	createProgram: ->
		prog = @insert @programs, @_createProgram(), @_deleteProgram
		prog._shaders = []
		prog
	deleteProgram: (prog) ->
		@delete prog

	createFramebuffer: ->
		@insert @framebuffers, @_createFramebuffer(), @_deleteFramebuffer
	deleteFramebuffer: (fbo) ->
		@delete fbo

	createRenderbuffer: ->
		@insert @renderbuffers, @_createRenderbuffer(), @_deleteRenderbuffer
	deleteRenderbuffer: (rb) ->
		@delete rb

	createShader: (type) ->
		shader = @insert @shaders, @_createShader(type), @_deleteShader
		shader._type = type
		shader._source = null
		shader
	deleteShader: (shader) ->
		@delete shader

	attachShader: (program, shader) ->
		@_attachShader program, shader
		program._shaders.push shader
		shader._program = program

	shaderSource: (shader, source) ->
		@_shaderSource shader, source
		shader._source = source
		@change()

HTMLCanvasElement.prototype.origGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = (type) ->
	ctx = @origGetContext type
	return ctx if type.indexOf('webgl') < 0 || !ctx?

	for name of ctx
		ctx[name].ctx = ctx if ctx[name].bind

	sctx = new Context ctx, this
	for name of ctx
		sctx['_' + name] = ctx[name].bind ctx if ctx[name].bind?
		ctx[name] = sctx[name].bind sctx if sctx[name]?
	textures = []

	ctx

$(document).ready ->
	show = ->
		button.hide()

		Contexts[0].change ->
			inspector.contents().remove()
			Contexts[0].render inspector

		inspector.show()

	button = $('<div style="position: absolute; top: 0%; right: 0%; background-color: #999; color: #fff;">WebGL Inspector</div>');
	button.click show
	$(document.body).append button
	inspector = $('<div style="display: none; position: absolute; float-top: 0%; top: 0%; right: 0%; background-color: #fff; color: #000; border: 1px solid black; width: 20%; height: 100%;"></div>');
	$(document.body).append inspector
