var triCartes1 = function(carda,cardb){
	if(carda.color == cardb.color)
	{
		return carda.level > cardb.level;
	}else{
		return carda.color < cardb.color;
	}
};
function tri(deck,fonctionDeTri){
    for(var i= 0 ; i< deck.length; i++){ 
        for(var j=i+1; j< deck.length; j++){
		   if(fonctionDeTri( deck[j], deck[i]) ){
				var temp = deck[j];
			   deck[j]=deck[i];
			   deck[i]=temp;
			}
        }
    }
    return deck;
}
function rotate(pos) {
	var list = [1,2,3,4,5];
	var orlist = {};
	for (var i = 1; i <= list.length; i++) {
		var dec = (i - pos) + 4; //4 est la position du joueur
		if(dec > list.length) {
			dec = dec - list.length;
		}
		if(dec === 0) {
			dec = list.length;
		}
		orlist[i] = dec;
	}
	return orlist;
}
function removeFriend(btn) {
	var login = $("#playermodal").data("login");
	$.ajax({
		url: "/user/"+login+"/removeFriend.json",
		success: function(data){
			$("#playermodal").find(".isNotfriend").show();
			$("#playermodal").find(".isfriend").hide();
		}
	});
}
function addFriend(btn) {
	var login = $("#playermodal").data("login");
	$.ajax({
		url: "/user/"+login+"/addFriend.json",
		success: function(data){
			$("#playermodal").find(".isNotfriend").hide();
			$("#playermodal").find(".isfriend").show();
		}
	});
}
function switchdisplay() {
	if($(".content-page").hasClass("container-fluid")){
		$(".content-page").removeClass("container-fluid");
		$(".content-page").addClass("container");
	} else {
		$(".content-page").removeClass("container");
		$(".content-page").addClass("container-fluid");
	}
}
function addHistoryLine(historyLine,historyCount) {
	var tr = jQuery("<tr />").appendTo($("#scoretable tbody"));
	jQuery("<td />",{text:historyCount}).appendTo(tr);
	for(var k in historyLine) {
		jQuery("<td />",{text:historyLine[k]}).appendTo(tr);
	}
}
function centerFrame(svg,data,selector,tableWidth,mtop,callback) {
	var obj = new XMLSerializer().serializeToString(data.documentElement);
	$(svg).find("#layerBase").append(obj);
	var placementX = (tableWidth / 2) - ($(svg).find(selector).closest("svg").attr("width") / 2);
	$(svg).find(selector).closest("svg").attr("y",90+mtop).attr("x",placementX);
	callback();
}
function showSelectPlacementForm(svg,socket,tableWidth,tableid,pw) {
	$.get("webres/img/placement.svg", function(data) {
		centerFrame(svg,data,"#place_bords",tableWidth,20,function() {
			$(svg).find("#p1").click(function() {socket.emit('joinTable',tableid,1,pw);});
			$(svg).find("#p2").click(function() {socket.emit('joinTable',tableid,2,pw);});
			$(svg).find("#p3").click(function() {socket.emit('joinTable',tableid,3,pw);});
			$(svg).find("#p4").click(function() {socket.emit('joinTable',tableid,4,pw);});
			$(svg).find("#p5").click(function() {socket.emit('joinTable',tableid,5,pw);});
			$(svg).find("#spec").click(function() {
				$(svg).find("#place_bords").closest("svg").remove();
			});
		});
	});
}
function createRect(height,width,x,y) {
	var rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
	rect.setAttributeNS(null,'height',height);
	rect.setAttributeNS(null,'width',width);
	rect.setAttributeNS(null,'x',x);
	rect.setAttributeNS(null,'y',y);
	rect.setAttributeNS(null,'style',"fill:#88aa00;stroke:#000000;stroke-width:1.12036586;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1");
	rect.setAttributeNS(null, 'visibility', 'visible');
	return rect;
}
function createText(x,y,value,lh) {
	var tspan = document.createElementNS('http://www.w3.org/2000/svg','tspan');
	tspan.setAttributeNS(null,'x',x);
	tspan.setAttributeNS(null,'y',y);
	tspan.setAttributeNS(null, 'visibility', 'visible');
	tspan.textContent = value;
	var text = document.createElementNS('http://www.w3.org/2000/svg','text');
	text.setAttributeNS(null,'x',x);
	text.setAttributeNS(null,'y',y);
	text.setAttributeNS(null,'style',"font-style:normal;font-weight:normal;font-size:10.58333302px;line-height:"+lh+";font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.26458332");
	text.setAttributeNS(null, 'visibility', 'visible');
	text.appendChild(tspan);
	return text;
}
function showAnnonceForm(svg,socket,tableWidth,inAnnonce,tableid,selectCardsFromDeck,cbCancel) {
	$.get("webres/img/annonce.svg", function(data) {
		centerFrame(svg,data,"#annonce_bords",tableWidth,20,function() {
			// Bouton misere atout
			$(svg).find("#misere_atout").data("matout",false);
			$(svg).find("#misere_atout").click(function() {
			  	if($(this).data("matout") !== true)
			  	{
			  		$(this).data("matout",true);
			  		$(svg).find("#led_matout").css("fill", "red");
			  	}else{
			  		$(this).data("matout",false);
			  		$(svg).find("#led_matout").css("fill", "white");
			  	}
			});
			// Bouton misere tete
			$(svg).find("#ok_mtete").data("mtete",false);
			$(svg).find("#ok_mtete").click(function() {
			  	if($(this).data("mtete") !== true)
			  	{
			  		$(this).data("mtete",true);
			  		$(svg).find("#led_mtete").css("fill", "red");
			  	}else{
			  		$(this).data("mtete",false);
			  		$(svg).find("#led_mtete").css("fill", "white");
			  	}
			});
			//Bouton ok
			$(svg).find("#ok_annonce").click(function() {
				var miseres = {atout:$(svg).find("#misere_atout").data("matout"),tete:$(svg).find("#ok_mtete").data("mtete")};
				socket.emit('annonce',tableid,miseres,selectCardsFromDeck("deck_poignee"));
			});
			//Bouton cancel_annonce
			$(svg).find("#cancel_annonce").click(function() {
				cbCancel();
			});
		});
	});
}
 $(function () {
	var svgholder = document.getElementById("table_jeu");
	svgholder.onload = function() {
		var tableid = $(svgholder).data("id");
		var socket = io();
		var svgDoc = svgholder.getSVGDocument();
		var tableWidth = $(svgDoc).find("#fond").attr("width");
		var isInSelectStep = false;
		var isInCallStep = false;
		var gameStarted = false;
		var debug = false;
		var autopilot = false;
		var inAnnonce = false;
		var pw = null;
		var tl = rotate(4);
		var messages;
		var removeDropOnNextPlay = false;
		$(".creator").hide();
		$.ajax({
			url: "/messages.json",
			success: function(data){
				messages = data;
			}
		});
		if($(svgholder).data("autoplay")) {
			autopilot = true;
		}
		if($(svgholder).data("debug")) {
			debug = true;
		}
		if($(svgholder).data("pw")) {
			pw = $(svgholder).data("pw");
		}
		socket.emit('spectate',tableid,pw);
		socket.on('gotLog', function(log){
			window.open("/log_"+log); 
		});
		socket.on('enableCreator', function(){
			$(".creator").show();
			function removeinvite(user){
				$.ajax({
					method: "post",
					data: {remove:user.login},
					url: "/removeinvite_"+tableid+".json",
					success: function(data){
						listInvites(data);
					}
				});
			}
			function addinvite(user){
				$.ajax({
					method: "post",
					data: {invite:user.login},
					url: "/invite_"+tableid+".json",
					success: function(data){
						listInvites(data);
					}
				});
			}
			function listInvites(list){
				$("#invited").empty();
				$(list.invited).each(function(id,elem){
					var tr = jQuery("<tr />").appendTo($("#invited"));
					jQuery("<td />",{text:elem.name}).appendTo(tr);
					var td = jQuery("<td />").appendTo(tr);
					var a = jQuery("<a />",{href:"javascript:void(0)"}).click(function(){removeinvite(elem)}).appendTo(td);
					jQuery("<span />",{class:"oi","data-glyph":"trash"}).appendTo(a);
				});
				$("#invitables").empty();
				$(list.invitables).each(function(id,elem){
					var tr = jQuery("<tr />").appendTo($("#invitables"));
					jQuery("<td />",{text:elem.name}).appendTo(tr);
					var td = jQuery("<td />").appendTo(tr);
					var a = jQuery("<a />",{href:"javascript:void(0)"}).click(function(){addinvite(elem)}).appendTo(td);
					jQuery("<span />",{class:"oi","data-glyph":"envelope-closed"}).appendTo(a);
				});
			}
			$('#invite').on('show.bs.modal', function (e) {
				$.ajax({
					url: "/invited_"+tableid+".json",
					success: function(data){
						listInvites(data);
					}
				});
			});
			$("#inviteform").submit(function(e){
				$.ajax({
					method: "post",
					data: $(e.target).serializeArray(),
					url: "/invite_"+tableid+".json",
					success: function(data){
						$("#inviteform").get(0).reset();
						listInvites(data);
					}
				});
				e.preventDefault();
			})
		});
		showSelectPlacementForm(svgDoc,socket,tableWidth,tableid,pw);
		//socket.on('joined', onJoin);
		socket.on('joined', function(id,player){
			console.log("joinedid",id);
			console.log("joinedplayer",player);
			onJoin(id,player);
		});
		socket.on('leave', onLeave);
		function setTurn(pos) {
			var list = [1,2,3,4,5];
			for (var i = 1; i <= list.length; i++) {
				if(pos == i) {
					$(svgDoc).find("#j"+tl[i]+"_cadre").css("stroke", "red");
				} else {
					$(svgDoc).find("#j"+tl[i]+"_cadre").css("stroke", "#000");
				}
			}
		}
		socket.on('resumePlayer', function(playerTurn,deck,attplayers,ctrplayers,scores){
			cleanTeams();
			setTurn(playerTurn);
			deck = tri(deck,triCartes1);
			placeToDeck("deck",deck,"#layerBase");
			setAttaque(attplayers);
			for(var k in ctrplayers) {
				if(ctrplayers[k] !== null){
					var ctrlib = ctr2Text(ctrplayers[k]);
					if(ctrplayers[k].chelem) {
						$(svgDoc).find("#j"+tl[k]+"_state tspan").css("fill", "red");
					} else	{
						$(svgDoc).find("#j"+tl[k]+"_state tspan").css("fill", "#000");
					}
					$(svgDoc).find("#j"+tl[k]+"_state tspan").text(ctrlib);
				}
			}
			for(var j in scores) {
				addHistoryLine(scores[j],parseInt(j)+1);
			}
		});
		socket.on('turn', function(pos){
			setTurn(pos);
		});
		socket.on('closetable', function(){
			window.location.href = "/closetable";
		});
		
		socket.on('okJoin', function(pos,players){
			// Rotation de la table
			for (var id in players) {
				if(players[id] !== null) {
					onLeave(id);
				}
			}
			tl = rotate(pos);
			for (var id in players) {
				if(players[id] !== null) {
					onJoin(id,players[id]);
				}
			}
			$(svgDoc).find("#place_bords").closest("svg").remove();
		});
		function onJoin(pos,player) {
			$(svgDoc).find("#p"+tl[pos]+"_txt").text(player.name);
			$(svgDoc).find("#p"+tl[pos]+"_led").css("fill","#FF0000");
			$(svgDoc).find("#j"+tl[pos]+"_name tspan").text(player.name);
			if(player.pict !== null){
				console.log(player);
				playerImage(pos,player.pict);
			}
			$(svgDoc).find("#j"+tl[pos]).addClass("playerProfil");
			$(svgDoc).find("#j"+tl[pos]).click(function(){
				$("#playermodal").modal("show");
				$.ajax({
					url: "/user/json/"+player.login,
					success: function(data){
						$("#playermodal").data("login",data.user.login);
						if(data.user.picture !== null) {
							$("#playermodal").find("img").attr("src",data.user.picture);
						}
						$("#playermodal").find(".playername").text(data.user.name);
						$("#playermodal").find(".playerlogin").text(data.user.login);
						$("#playermodal").find(".statPlay").text(data.playerStats.table);
						$("#playermodal").find(".statWin").text(data.playerStats.win);
						if(data.canBeFriend) {
							if(data.isFriend) {
								$("#playermodal").find(".isNotfriend").hide();
								$("#playermodal").find(".isfriend").show();
							} else {
								$("#playermodal").find(".isNotfriend").show();
								$("#playermodal").find(".isfriend").hide();
							}
						} else {
							$("#playermodal").find(".isNotfriend").hide();
							$("#playermodal").find(".isfriend").hide();
						}
					}
				});
			});
		}
		function onLeave(pos) {
			$(svgDoc).find("#p"+tl[pos]+"_txt").text("Libre");
			$(svgDoc).find("#p"+tl[pos]+"_led").css("fill","#66FF00");
			$(svgDoc).find("#j"+tl[pos]+"_name tspan").text("Libre");
			removePlayerImage(pos);
			$(svgDoc).find("#j"+tl[pos]).unbind( "click" );
			$(svgDoc).find("#j"+tl[pos]).removeClass("playerProfil");
		}
		socket.on('players', function(data){
			for (var id in data) {
				if(data[id] !== null) {
					console.log("players",data[id]);
					onJoin(id,data[id]);
				}
			}
		});
		socket.on('gotDeck', function(cards){
			cleanTeams();
			cards = tri(cards,triCartes1);
			placeToDeck("deck",cards,"#layerBase");

		});
		function ctr2Text(ctr) {
			var lctr = {1:"Passe",2:"Prise",3:"Garde",4:"G. Sans",5:"G. Contre"};
			var ctrlib = lctr[ctr.ctr];
			if(ctr.chelem) {
				ctrlib = "[Chelem] "+ctrlib;
			}
			return ctrlib;
		}
		socket.on('gotCtr', function(player_ctr,ctr){
			var ctrlib = ctr2Text(ctr);
			if(ctr.chelem) {
				$(svgDoc).find("#j"+tl[player_ctr]+"_state tspan").css("fill", "red");
			} else	{
				$(svgDoc).find("#j"+tl[player_ctr]+"_state tspan").css("fill", "#000");
			}
			$(svgDoc).find("#j"+tl[player_ctr]+"_state tspan").text(ctrlib);
		});
		function setAttaque(players) {
			var list = [1,2,3,4,5];
			for (var i = 1; i <= list.length; i++) {
				var isAtt = false;
				for(var k in players) {
					if(i == parseInt(players[k])) {
						isAtt = true;
					}
				}
				if(isAtt) {
					$(svgDoc).find("#j"+tl[i]+"_ctr tspan").text("Attaque");
					$(svgDoc).find("#j"+tl[i]+"_ctr tspan").css("fill", "red");
				}
			}
		}
		function cleanTeams() {
			var list = [1,2,3,4,5];
			for (var i = 1; i <= list.length; i++) {
				$(svgDoc).find("#j"+tl[i]+"_ctr tspan").text("");
				$(svgDoc).find("#j"+tl[i]+"_ctr tspan").css("fill", "#000");
				$(svgDoc).find("#j"+tl[i]+"_state tspan").text("");
				$(svgDoc).find("#j"+tl[i]+"_state tspan").css("fill", "#000");
			}
		}
		socket.on('gotHighCtr', function(player_ctr){
			setAttaque([player_ctr]);
		});
		socket.on('gotTeam', function(players){
			setAttaque(players);
		});
		socket.on('promptCall', function(callable){
			$.get("webres/img/appel_card.svg", function(data) {
				centerFrame(svgDoc,data,"#call_bords",tableWidth,20,function() {
					placeToDeck("deck_call",callable,"#layerCallCard");
					isInCallStep = true;
				});
			});
		});
		socket.on('promptCtr', function(){
			$.get("webres/img/contrat.svg", function(data) {
				centerFrame(svgDoc,data,"#c_bords",tableWidth,20,function() {
					$(svgDoc).find("#chelem_btn").data("chelem",false);
					$(svgDoc).find("#passe_btn").click(function() {
					  	socket.emit('setCtr',tableid,1,false);
					});
					$(svgDoc).find("#p_btn").click(function() {
					  	socket.emit('setCtr',tableid,2,$(svgDoc).find("#chelem_btn").data("chelem"));
					});
					$(svgDoc).find("#g_btn").click(function() {
					  	socket.emit('setCtr',tableid,3,$(svgDoc).find("#chelem_btn").data("chelem"));
					});
					$(svgDoc).find("#gs_btn").click(function() {
					  	socket.emit('setCtr',tableid,4,$(svgDoc).find("#chelem_btn").data("chelem"));
					});
					$(svgDoc).find("#gc_btn").click(function() {
					  	socket.emit('setCtr',tableid,5,$(svgDoc).find("#chelem_btn").data("chelem"));
					});
					$(svgDoc).find("#chelem_btn").click(function() {
					  	if($(this).data("chelem") !== true)
					  	{
					  		$(this).data("chelem",true);
					  		$(svgDoc).find("#chelem_led").css("fill", "red");
					  	}else{
					  		$(this).data("chelem",false);
					  		$(svgDoc).find("#chelem_led").css("fill", "white");
					  	}
					});
				});
			});
		});
		socket.on('okCall', function(chien){
			$(svgDoc).find("#call_bords").closest("svg").remove();
			isInCallStep = false;
		});
		socket.on('okAnnonce', function(ok,message){
			if(ok) {
				$(svgDoc).find("#annonce_bords").closest("svg").remove();
				inAnnonce = false;
			} else {
				alert(message);
			}
		});
		socket.on('okCallChien', function(chien){
			$(svgDoc).find("#call_bords").closest("svg").remove();
			isInCallStep = false;
			$.get("webres/img/chien.svg", function(data) {
				centerFrame(svgDoc,data,"#chien_bords",tableWidth,20,function() {
					placeToDeck("deck_chien",chien,"#layerChien");
					isInSelectStep = true;
					$(svgDoc).find("#valider_chien").click(function() {
						socket.emit('setChien',tableid,selectCardsFromDeck("deck_chien"));
					});
				});
			});

		});
		socket.on('called', function(card,show){
			if(!isInSelectStep && show) {
				$(svgDoc).find("#chien_bords").closest("svg").remove();
				$.get("webres/img/appel_show.svg", function(data) {
					centerFrame(svgDoc,data,"#carte_bords",tableWidth,20,function() {
						placeToDeck("deck_appel",[card],"#layerAppel");
						$(svgDoc).find("#ok_appel").click(function() {
							$(svgDoc).find("#carte_bords").closest("svg").remove();
						});
					});
				});
			}
		});
		socket.on('okCtr', function(){
			$(svgDoc).find("#c_bords").closest("svg").remove();
		});
		socket.on('chien', function(chien){
			$.get("webres/img/chien_show.svg", function(data) {3
				centerFrame(svgDoc,data,"#chien_bords",tableWidth,20,function() {
					placeToDeck("show_chien",chien,"#layerChien");
					$(svgDoc).find("#ok_chien").click(function() {
						$(svgDoc).find("#chien_bords").closest("svg").remove();
					});
				});
			});
		});
		socket.on('recap', function(highPlayer,ctr,chien,callCard){
			if(isInSelectStep){
				isInSelectStep = false;
				$(svgDoc).find("#chien_bords").closest("svg").remove();
			} else {
				$(svgDoc).find("#carte_bords").closest("svg").remove();
			}
			$.get("webres/img/recap.svg", function(data) {
				centerFrame(svgDoc,data,"#recap_bords",tableWidth,20,function() {
					$(svgDoc).find("#app_txt tspan").text(highPlayer);
					$(svgDoc).find("#ctr_txt tspan").text(ctr2Text(ctr));
					$(svgDoc).find("#ok_recap").data("ready",false);
					$(svgDoc).find("#led_recap").css("fill", "red");
					placeToDeck("recap_chien",chien,"#layerRecap");
					placeToDeck("deck_call",[callCard],"#layerRecap");
					$(svgDoc).find("#ok_recap").click(function() {
				  		if($(this).data("ready") !== true)
				  		{
				  			$(this).data("ready",true);
				  			$(svgDoc).find("#led_recap").css("fill", "green");
				  		}else{
				  			$(this).data("ready",false);
				  			$(svgDoc).find("#led_recap").css("fill", "red");
				  		}
						socket.emit('ready',tableid,$(this).data("ready"));
					});
					$(svgDoc).find("#declar_btn").click(function() {
						if(!inAnnonce) {
							inAnnonce = true;
							showAnnonceForm(svgDoc,socket,tableWidth,inAnnonce,tableid,selectCardsFromDeck,function(){
								$(svgDoc).find("#annonce_bords").closest("svg").remove();
								inAnnonce = false;
							});	
						}
					});
					/*
					if(autopilot) {
						socket.emit('ready',tableid,true);
					}
					*/
				});
			});
		});
		socket.on('removeCard', function(card){
			$(svgDoc).find("image.cards[data-id='"+card+"']").remove();
		});
		socket.on('recapAnnonce', function(annonces){
			$(svgDoc).find("#recap_bords").closest("svg").remove();
			$.get("webres/img/recap_annonce.svg", function(data) {
				centerFrame(svgDoc,data,"#recapannonce_bords",tableWidth,0,function() {
					var heightPoignee = 42.5;
					var heightTexte = 10;
					var heightFrame = parseInt($(svgDoc).find("#recapannonce_bords").attr("y"),10);
					var placement = heightFrame + 25;
					for (var i = 0; i < annonces.length; i++) {
						$(createText(55,placement,annonces[i].player,1.25)).appendTo($(svgDoc).find("#layerRecapAnnonce"));
						placement = placement + heightTexte+1;
						if(annonces[i].poignee) {
							var thisDeck = "deck"+i;
							var deck = createRect(heightPoignee,170,60,placement);
							$(deck).attr("id",thisDeck);
							$(deck).appendTo($(svgDoc).find("#layerRecapAnnonce"));
							placeToDeck(thisDeck,annonces[i].poigneeCards,"#layerRecapAnnonce");
							placement = placement + heightPoignee+10;
						}
						if(annonces[i].misereAtout) {
							$(createText(60,placement,"Misere atout",1.5)).appendTo($(svgDoc).find("#layerRecapAnnonce"));
							placement = placement + heightTexte+1;
						}
						if(annonces[i].misereTete) {
							$(createText(60,placement,"Misere têtes",1.5)).appendTo($(svgDoc).find("#layerRecapAnnonce"));
							placement = placement + heightTexte+1;
						}
						if(annonces[i].teteauchien) {
							$(createText(60,placement,"Tête au chien",1.5)).appendTo($(svgDoc).find("#layerRecapAnnonce"));
							placement = placement + heightTexte+1;
						}
					}
					$(svgDoc).find("#ok_recap").data("ready",false);
					$(svgDoc).find("#led_recap").css("fill", "red");
					$(svgDoc).find("#ok_recap").click(function() {
				  		if($(this).data("ready") !== true)
				  		{
				  			$(this).data("ready",true);
				  			$(svgDoc).find("#led_recap").css("fill", "green");
				  		}else{
				  			$(this).data("ready",false);
				  			$(svgDoc).find("#led_recap").css("fill", "red");
				  		}
						socket.emit('ready',tableid,$(this).data("ready"));
					});
					$(svgDoc).find("#declar_btn").click(function() {
						if(!inAnnonce) {
							inAnnonce = true;
							showAnnonceForm(svgDoc,socket,tableWidth,inAnnonce,tableid,selectCardsFromDeck,function(){
								$(svgDoc).find("#annonce_bords").closest("svg").remove();
								inAnnonce = false;
							});	
						}
					});
				});
			});
			//gameStarted = true;
			
		});
		socket.on('startGame', function(){
			gameStarted = true;
			$(svgDoc).find("#recap_bords").closest("svg").remove();
			$(svgDoc).find("#recapannonce_bords").closest("svg").remove(); // si annonce
		});
		socket.on('redistrib', function(){
			cleanTeams();
			$(svgDoc).find("#c_bords").closest("svg").remove();
			$(svgDoc).find("#end_bords").closest("svg").remove();
			$(svgDoc).find("image.cards").remove();
		});
		socket.on('setDrop', function(cards){
			gameStarted = true;
			for(var k in cards) {
				placeToDrop(k,cards[k]);
			}
		});
		socket.on('play', function(player,nextPlayer,card,nt){
			if(removeDropOnNextPlay) {
				removeDrop();
				removeDropOnNextPlay = false;
			}
			placeToDrop(player,card);
			removeFromDeck("deck",card.id)
			setTurn(nextPlayer);
			if(nt){removeDropOnNextPlay = true;}
		});
		socket.on('message', function(rule){
			var msg = {level:2,message:"N/A"};
			for(var k in messages) {
				if(k == rule) {
					msg = messages[k];
				}
			}
			if(msg.level == 1) {
				msg.class = "alert-primary";
			}else if(msg.level == 2) {
				msg.class = "alert-warning";
			} else {
				msg.class = "alert-secondary";
			}
			var alertbox = jQuery("<div />",{class:"alert alert-dismissible fade show "+msg.class,role:"alert",text:msg.message}).appendTo("#alertBox");
			var alertButton = jQuery("<button />",{type:"button",class:"close","data-dismiss":"alert","aria-label":"Close"}).appendTo(alertbox);
			jQuery("<span />",{"aria-hidden":"true"}).html("&times;").appendTo(alertButton);
			setTimeout(function(){
				$(alertbox).alert('close');
			}, 3000);
		});
		socket.on('yourturn', function(playableCards){
			var isMyTurn = true;
			$(svgDoc).find("image.deck").each(function(it,elem){
				if(playableCards.indexOf($(elem).data("card").id) !== -1) {
					$(elem).removeClass("deny");
				} else {
					$(elem).addClass("deny");
				}
			});
			if(autopilot) {
				if(playableCards.length !== 0) {
					var cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
					socket.emit('selectCard',tableid,cardToPlay);
				}
			}
		});
		socket.on('endGame', function(recap,chien,historyLine,historyCount,debugRecap){
			if(historyLine !== null) {
				addHistoryLine(historyLine,historyCount);
			}
			gameStarted = false;
			$.get("webres/img/end.svg", function(data) {
				centerFrame(svgDoc,data,"#end_bords",tableWidth,20,function() {
					placeToDeck("recap_chien",chien,"#layerEnd");
					$(svgDoc).find("#end_txt tspan").text(recap.resultContrat);
					$(svgDoc).find("#bouts_txt tspan").text(recap.attOuldersCount);
					$(svgDoc).find("#obj_txt tspan").text(recap.pointsToWin);
					$(svgDoc).find("#pts_txt tspan").text(recap.diffAtt);
					$(svgDoc).find("#res_txt tspan").text(recap.pointsAtt);
					$(svgDoc).find("#ctr_txt tspan").text(ctr2Text(recap.ctr));
					$(svgDoc).find("#tot_txt tspan").text(recap.totalPointsAtt);
					$(svgDoc).find("#pre_txt tspan").text(recap.PrePoints);
					$(svgDoc).find("#coe_txt tspan").text(recap.CoePoints);
					$(svgDoc).find("#def_txt tspan").text(recap.DefPoints);
					$(svgDoc).find("#ok_end").data("ready",false);
					$(svgDoc).find("#led_end").css("fill", "red");
					$(svgDoc).find("#ok_end").click(function() {
				  		if($(this).data("ready") !== true)
				  		{
				  			$(this).data("ready",true);
				  			$(svgDoc).find("#led_end").css("fill", "green");
				  		}else{
				  			$(this).data("ready",false);
				  			$(svgDoc).find("#led_end").css("fill", "red");
				  		}
						socket.emit('ready',tableid,$(this).data("ready"));
					});
					if(debugRecap) {
						$(svgDoc).find("#errorbutton").click(function() {
							socket.emit('getlog',tableid);
						});
					} else {
						$(svgDoc).find("#errorbutton").remove();
					}
					/*
					if(autopilot) {
						socket.emit('ready',tableid,true);
					}
					*/
				});
			});
		});
		
		function selectCard(card) {
			if(isInSelectStep){
				var cards = selectCardsFromDeck($(card).data("deck"));
				cards.push($(card).data("card"));
				var cardsChien = selectCardsFromDeck("deck_chien");
				var cardsDeck = selectCardsFromDeck("deck");
				if($(card).data("deck") == "deck_chien") {
					for (var i = cardsChien.length; i--;) {
					    if (cardsChien[i].id === $(card).data("card").id) {
					        cardsChien.splice(i, 1);
					    }
					}
					cardsDeck.push($(card).data("card"));
				}else {
					for (var i = cardsDeck.length; i--;) {
					    if (cardsDeck[i].id === $(card).data("card").id) {
					        cardsDeck.splice(i, 1);
					    }
					}
					cardsChien.push($(card).data("card"));
				}
				placeToDeck("deck_chien",cardsChien,"#layerChien");
				placeToDeck("deck",cardsDeck,"#layerBase");
			}else if(isInCallStep) {
				if($(card).data("deck") == "deck_call") {
					socket.emit('setCall',tableid,$(card).data("card"));
				}
			}else if (inAnnonce) {
				var cardspoignee = selectCardsFromDeck("deck_poignee");
				if($(card).data("deck") == "deck_poignee") {
					for (var i = cardspoignee.length; i--;) {
					    if (cardspoignee[i].id === $(card).data("card").id) {
					        cardspoignee.splice(i, 1);
					    }
					}
				}else if($(card).data("deck") == "deck") {
					var added = false;
					for (var i = cardspoignee.length; i--;) {
					    if (cardspoignee[i].id === $(card).data("card").id) {
					        added = true;
					    }
					}
					if(!added) {
						cardspoignee.push($(card).data("card"));
					}else {
						alert("Déjà ajoutée !");
					}
				}
				placeToDeck("deck_poignee",cardspoignee,"#layerAnnonce");
			}else if (gameStarted) {
				if($(card).data("deck") == "deck") {
					socket.emit('selectCard',tableid,$(card).data("card").id);
				}
			}
		}
		function selectCardsFromDeck(deck) {
			var cards = [];
			$(svgDoc).find("image.cards").each(function(it,elem){
				if($(elem).data("deck") == deck) {
					cards.push($(elem).data("card"));
				}
			});
			return cards;
		}
		function removeFromDeck(deckname,id) {
			var removed = false;
			$(svgDoc).find("image.cards").each(function(it,elem){
				if($(elem).data("deck") == deckname) {
					if($(elem).data("card").id == id) {
						$(elem).remove();
						removed = true;
					}
				}
			});
			if(removed) {
				var cards = [];
				$(svgDoc).find("image.cards").each(function(it,elem){
					if($(elem).data("deck") == deckname) {
						cards.push($(elem).data("card"));
					}
				});
				placeToDeck(deckname,cards,"#layerBase");
			}
		}
		function placeToDeck(deckname,cards,place) {
			$(svgDoc).find("image.cards").each(function(it,elem){
				if($(elem).data("deck") == deckname) {
					$(elem).remove();
				}
			});
			var deckspace = parseInt($(svgDoc).find("#"+deckname).attr("width"),10);
			var decky = parseInt($(svgDoc).find("#"+deckname).attr("y"),10);
			var deckx = parseInt($(svgDoc).find("#"+deckname).attr("x"),10);
			var cardw = 22;
			var ratioimage = 1.86;
			var spacebcards = Math.floor(deckspace / cards.length)
			
			for (var i = 0; i < cards.length; i++) {
				var card = cards[i];
				if(cards.length * cardw > deckspace) {
					var placement = i*spacebcards + deckx +1;
				} else {
					var placement = i*cardw + deckx + (deckspace - (cards.length * cardw)) / 2;
				}
				var img = document.createElementNS('http://www.w3.org/2000/svg','image');
				img.setAttributeNS(null,'height',(cardw*ratioimage));
				img.setAttributeNS(null,'width',cardw);
				img.setAttributeNS('http://www.w3.org/1999/xlink','href',"cards/"+card.image);
				img.setAttributeNS(null,'x',placement);
				img.setAttributeNS(null,'y',decky + 1);
				img.setAttributeNS(null, 'visibility', 'visible');
				img.setAttributeNS(null, 'data-card', JSON.stringify(card));
				img.setAttributeNS(null, 'data-deck', deckname);
				img.setAttributeNS(null, 'class', 'cards '+deckname);
				img.onclick = function() {
					selectCard(this);
				};
				$(svgDoc).find(place).append(img);
			}
		}
		function placeToDrop(player,card) {
			var cardw = 22;
			var ratioimage = 1.86;
			var placex = $(svgDoc).find("#j"+tl[player]+"_deck").attr("x");
			var placey = $(svgDoc).find("#j"+tl[player]+"_deck").attr("y");
			var img = document.createElementNS('http://www.w3.org/2000/svg','image');
			img.setAttributeNS(null,'height',(cardw*ratioimage));
			img.setAttributeNS(null,'width',cardw);
			img.setAttributeNS('http://www.w3.org/1999/xlink','href',"cards/"+card.image);
			img.setAttributeNS(null,'x',placex);
			img.setAttributeNS(null,'y',placey);
			img.setAttributeNS(null, 'visibility', 'visible');
			img.setAttributeNS(null, 'data-card', JSON.stringify(card));
			img.setAttributeNS(null, 'data-deck', 'drop');
			img.setAttributeNS(null, 'class', 'cards drop');
			$(svgDoc).find("#layerBase").append(img);
		}
		function playerImage(player,picture) {
			var placex = $(svgDoc).find("#j"+tl[player]+"_img").attr("x");
			var placey = $(svgDoc).find("#j"+tl[player]+"_img").attr("y");
			var width = parseInt($(svgDoc).find("#j"+tl[player]+"_img").attr("width"),10);
			var height = parseInt($(svgDoc).find("#j"+tl[player]+"_img").attr("height"),10);
			var img = document.createElementNS('http://www.w3.org/2000/svg','image');
			img.setAttributeNS('http://www.w3.org/1999/xlink','href',picture.small);
			img.setAttributeNS(null,'height',height);
			img.setAttributeNS(null,'width',width);
			img.setAttributeNS(null,'x',placex);
			img.setAttributeNS(null,'y',placey);
			img.setAttributeNS(null, 'visibility', 'visible');
			img.setAttributeNS(null, 'data-player', player);
			img.setAttributeNS(null, 'class', 'playerimage');
			$(svgDoc).find("#j"+tl[player]).append(img);
		}
		function removePlayerImage(player) {
			$(svgDoc).find("#j"+tl[player]).find("image.playerimage").remove();
		}
		function removeDrop() {
			$(svgDoc).find("image.cards").each(function(it,elem){
				if($(elem).data("deck") == "drop") {
					$(elem).remove();
				}
			});
		}
	};
});