$(function () {
	var socket = io();
	socket.on('gotInvite', function(table,conf,proposer){
		console.log(table,conf,proposer);
		$("#invitedmodal").modal("show");
		$("#invitedmodal").data("table",table);
		if(proposer.picture !== null) {
			$("#invitedmodal").find("img.playerpict").attr("src",proposer.picture);
		}
		$("#invitedmodal").find(".playername").text(proposer.name);
		$("#invitedmodal").find(".playerlogin").text(proposer.login);
		$("#invitedmodal").find(".tablename").text(conf.name);
		$("#invitedmodal").find(".playercount").text(conf.playercount);
		$("#invitedmodal").find(".joinbutton").unbind( "click" );
		$("#invitedmodal").find(".joinbutton").click(function(){
			window.location.href = "/table_"+table;
		});
	});
	socket.on('noInvite', function(table){
		if($("#invitedmodal").data("table") == table) {
			$("#invitedmodal").modal("hide");
		}
	});
});