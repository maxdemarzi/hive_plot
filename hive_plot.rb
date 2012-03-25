require 'rubygems'
require 'neography'
require 'sinatra'
require 'uri'
require 'json'

def wroterepos(language)
  neo = Neography::Rest.new
  neo.execute_script("m = [:]
                      g.V.filter{it.type == 'language' && it.name == '#{language}'}.in.transform{m[it.name] = it.in('wrote').gather{it.name}.next()}.iterate()
                      m")
end

def forkedrepos(language)
  neo = Neography::Rest.new
  neo.execute_script("m = [:]
                      g.V.filter{it.type == 'language' && it.name == '#{language}'}.in.transform{m[it.name] = it.in('forked').gather{it.name}.next()}.iterate()
                      m")
end

get '/hive/:name' do
  repos        = []
  writers      = [] 
  forkers      = []
  temp_forkers = []
  temp_writers = []

  wroterepos(params[:name]).each_pair do |key, value|
    repos << {"name" => key, "imports" => value}
    temp_writers << { "name" => value[0] }
  end

  i = 0
  forkedrepos(params[:name]).each_pair do |key, value|
    repos[i]["imports"] =  repos[i]["imports"] + value
    temp_writers[i]["imports"] = value
    temp_forkers << value
    i += 1
  end

  temp_writers.group_by {|i| i["name"]}.each do |w, f|
    writers << {"name" => w, "imports" => f.collect{|y| y["imports"]}.flatten.uniq}
  end

  puts writers.inspect # collect{|y| y["name"]}.inspect

  temp_forkers.flatten.uniq.delete_if{|x| writers.collect{|y| y["name"]}.include?(x)}.each do |f|
    forkers << {"name" => f, "imports" => []}
  end
  puts "-------------------"
  puts forkers.inspect

  (repos + writers + forkers).to_json

end