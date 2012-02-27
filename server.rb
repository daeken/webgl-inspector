require 'rubygems'
require 'sinatra'
require 'sinatra/reloader'

get '/' do
	File.read 'index.html'
end

get '/webgl-inspector.js' do
	content_type "text/javascript"
	coffee File.read('webgl-inspector.cs')
end

get '/*.js' do |fn|
	File.read fn + '.js'
end

get '/*.png' do |fn|
	content_type 'image/jpeg'
	File.read fn + '.png'
end
get '/*.jpg' do |fn|
	content_type 'image/png'
	File.read fn + '.jpg'
end
