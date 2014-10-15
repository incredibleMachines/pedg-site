var utils = require('../modules/Utils');
var _ = require('underscore')
var https = require('https')
var exec = require('child_process').exec
/*
	{ 	sales: { play_all: '/api/sales',
				 play_single: [ {Event_Title: '/api/slug'},
				 				{Event_Title:'/api/slug'}
				 			  ]
				},
		ambient:{ play_all: '/api/ambient',
				  play_single: [ {Event_Title: '/api/slug'},
				 				{Event_Title:'/api/slug'}
				 			  ]
				}
		commands: { pause: '/api/pause',
					end: '/api/end',
					resume: '/api/resume'
		}
	}
*/

exports.index = function(_Database,EVENT_TYPES){
	return function(req,res){
		//res.jsonp({success:'success'})
		var structure = {};
		structure.sales = {play_all: '/api/play/sales', play_single:[]};
		/*structure.ambient = {play_all: '/api/play/ambient_gradient',
												 play_single:[{'Ambient Gradient':'/api/play/ambient_gradient'},
																		  {'Ambient Clouds': '/api/play/ambient_clouds'},
																			{'Ambient Party':  '/api/play/ambient_party'},
																			{'Ambient Waves':  '/api/play/ambient_waves'}
																																							]};*/
		structure.commands = {pause:'/api/control/pause',resume:'/api/control/resume',end:'/api/control/end',restart:'/api/control/restart'}

		EVENT_TYPES.forEach(function(type,i){

			if(type !== "Default" && type !== "Ambient"){

				//check if type is Ambient or not
				//for now assumes that all content is sales
				var temp={}
				temp[type] = '/api/play/'+utils.makeSlug(type)
				structure.sales.play_single.push(temp)
			}
		})
		res.jsonp(structure)
	}
}



/*
	Play Sales, Ambient ex:

	/api/play/ambient
	/api/play/sales  (-- or should this be default?)

	TODO: decide difference between sales and default, who gets added to what, etc.
*/
exports.sendEvents = function(_type,_Database,_Websocket){
	return function(req,res){

		console.log("sending event type: "+ _type);

		if(_type === "sales") _type = "default";
		//or should it remain "sales"? TODO: decide what is added together for sales duration
		//--> ambient is it's own event...

		_Database.getDocumentBySlug('timeline',_type, function(e, _event){
			if(_event){
				var socketCommand = {
					"command": "play",
					"event": {
						"title": _event.title,
						"slug" : _event.slug,
						"duration": _event.duration,
						"start_time": _event.start_time
					}
				};
				_Websocket.status(function(status){
					if(status ==true){
						_Websocket.socket(function(socket){
							socket.send(JSON.stringify(socketCommand))
							if(_type === "default"){
								console.log('Sending Start Command')
								//var url = "https://SPI33:SPI33@10.1.31.20:8081/assets/state/ctl.pl?command=%7B%22ctl%22%3A%7B%22zoneString%22%3A%22Neighborhood%22%2C%22componentString%22%3A%2230+Park+Place+Marketing+Center%22%2C%22logicalComponentString%22%3A%22%22%2C%22serviceVariantIDString%22%3A%221%22%2C%22serviceString%22%3A%22SVC_GEN_GENERIC%22%2C%22commandString%22%3A%22IMStart%22%2C%22CommandArguments%22%3A%7B%7D%7D%7D"

								sendStartToSavant();
							}
							res.jsonp({success:{socketCommand: socketCommand}})
						})
					}else{
						res.jsonp({error:'PlayerApp Not Connected', socketCommand: socketCommand})
					}
				})
			} else {
				res.jsonp({error:'Event Cannot Be Found', request: _type});
			}
		})
	}
}


/*
	Play single event,  ex:

	/api/play/gastronomy
	/api/play/parks-and-leisure
	/api/play/default
*/
exports.sendSingle = function(_Database, _Websocket){

return function(req,res){
		var slug = req.params.slug;
		console.log("send single");
		console.log("req: "+req);
		console.log("slug: "+slug);

		if(slug.indexOf("ambient")>-1){
			//if its an ambient slug then we need to hardcore them.
			//for now its just ambient_gradient
			_Database.getDocumentBySlug('timeline','ambient', function(e, _event){
				if(_event){
					if(slug !== "ambient"){
						var counter = 0

						var scene = _.findWhere(_event.scenes, {slug: slug})

						if(typeof scene !== "undefined" ){
							var socketCommand ={
								command:"play",
								event:{ title: scene.title,
												slug: scene.slug,
												duration: scene.duration,
												start_time: scene.start_time
								}
							};

							console.log("socketCommand: "+JSON.stringify(socketCommand));
							_Websocket.status(function(status){
								if(status ==true){
									_Websocket.socket(function(socket){
										socket.send(JSON.stringify(socketCommand))
										res.jsonp({success: {socketCommand: socketCommand}});
									})
								}else{
									res.jsonp({error:'PlayerApp Not Connected', socketCommand: socketCommand})
								}
							})

						}else{
							res.jsonp({error:'Event Not Found', requested: slug})
						}


					}else{
							var socketCommand = {
								command: "play",
								event: {
									title: _event.title,//"Ambient Gradient",
									slug: _event.slug,
									/** TODO: DB CALL NEEDS TO POPULATE THIS OBJECT **/
									duration: _event.duration,
									start_time: _event.start_time
								}
							};

							console.log("socketCommand: "+JSON.stringify(socketCommand));
							_Websocket.status(function(status){
								if(status ==true){
									_Websocket.socket(function(socket){
										socket.send(JSON.stringify(socketCommand))
										//sendStartToSavant()
										res.jsonp({success: {socketCommand: socketCommand}});
									})
								}else{
									res.jsonp({error:'PlayerApp Not Connected', socketCommand: socketCommand})
								}
							})
						}

					} else res.jsonp({error:'Event Not Found', requested: slug})

			})


		}else{//ambient or gradient
			_Database.getDocumentBySlug('timeline',slug, function(e, _event){
				if(_event){
					var socketCommand = {
						"command": "play",
						"event": {
						"title": _event.title,
						"slug" : _event.slug,
						"duration": _event.duration,
						"start_time": _event.start_time
						}
					};

					console.log("socketCommand: "+JSON.stringify(socketCommand));

					_Websocket.status(function(status){
						if(status ==true){
							_Websocket.socket(function(socket){
								socket.send(JSON.stringify(socketCommand))
								sendStartToSavant()
								res.jsonp({success: {socketCommand: socketCommand}});
							})
						}else{
							res.jsonp({error:'PlayerApp Not Connected', socketCommand: socketCommand})
						}
					})
				} else {
					res.jsonp({error:'Event Not Found', requested: slug})
				}
			})
		}
	}
}

/* Control Commands, ex:

	/api/control/pause
	/api/control/resume
	/api/control/end
*/
exports.control = function(_Websocket, _playerApp){
	return function(req,res){
		//get control from url parameter
		var control = req.params.ctrl

		if(control == 'pause'||control=='resume'|| control=='end' || control == 'restart'){
			if(control != 'restart'){
				_Websocket.status(function(status){ //check socket status
					//console.log(status)
					if(status==true){ //if we're connected
						_Websocket.socket(function(socket){ //access the websocket async
							//console.log(socket)
							socket.send(JSON.stringify({command: control}))

							if(control =='pause'){
								sendEndToSavant()
							}else if(control =='resume'||control =='restart'){
								sendStartToSavant()
							}
							res.jsonp({success:'Sent Command '+control})

						})

					}else{
						res.jsonp({error:'PlayerApp Not Connected', command: control})
					}
				})
			}else{
				//control does equal restart
				//restart the playerapp
				_playerApp.restart(true)
				_playerApp.end()
				res.jsonp({success:'Sent Command '+control})
			}
		}else{
			res.jsonp({error:'Command Not Recognized: '+control})
		}
	}
}

function sendStartToSavant(){
	console.log('sending Curl Command')
	exec('curl -k https://SPI33:SPI33@10.1.31.20:8081/assets/state/ctl.pl?command=%7B%22ctl%22%3A%7B%22zoneString%22%3A%22Neighborhood%22%2C%22componentString%22%3A%2230+Park+Place+Marketing+Center%22%2C%22logicalComponentString%22%3A%22%22%2C%22serviceVariantIDString%22%3A%221%22%2C%22serviceString%22%3A%22SVC_GEN_GENERIC%22%2C%22commandString%22%3A%22IMStart%22%2C%22CommandArguments%22%3A%7B%7D%7D%7D',
	function(err,stdout,stderr){
		console.log('Sent Curl Start Command from api')
	})
}

function sendEndToSavant(){

exec('curl -k https://SPI33:SPI33@10.1.31.20:8081/assets/state/ctl.pl?command=%7B%22ctl%22%3A%7B%22zoneString%22%3A%22Neighborhood%22%2C%22componentString%22%3A%2230+Park+Place+Marketing+Center%22%2C%22logicalComponentString%22%3A%22%22%2C%22serviceVariantIDString%22%3A%221%22%2C%22serviceString%22%3A%22SVC_GEN_GENERIC%22%2C%22commandString%22%3A%22IMFinish%22%2C%22CommandArguments%22%3A%7B%7D%7D%7D'
,function(err,stdout,stderr){
	console.log('Sent Curl Exit Command from api')
})
}
