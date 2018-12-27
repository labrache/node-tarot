$(document).ready(function(){
	$.ajax({
		url: "/cards.json",
		success: function(data){
			var cards = data;
			function lookfocard(id) {
				for(var k in cards) {
					if(cards[k].id == id) {
						return cards[k];
					}
				}
			}
			function translatelevel(level) {
				if(level === 14) {return "R";}
				else if (level === 13) {return "D";}
				else if (level === 12) {return "C";}
				else if (level === 11) {return "V";}
				else {return level;}
			}
			function translateatout(level) {
				if(level === 0) {return "&#10033;";}
				else {return level;}
			}
			$(".cards").each(function(it,elem){
				$(elem).addClass("badge badge-pill");
				var color = "";
				var thiscars = lookfocard($(elem).data("id"));
				if(thiscars.color === 0) {
					$(elem).addClass("badge-info");
					$(elem).html(translateatout(thiscars.level));
				} else if(thiscars.color === 1 || thiscars.color === 4) {
					$(elem).addClass("badge-dark");
					if(thiscars.color === 1) {
						color = "&clubs;";
					} else {
						color = "&spades;";
					}
					$(elem).html(translatelevel(thiscars.level)+" "+color);
				} else if(thiscars.color === 2 || thiscars.color === 3) {
					$(elem).addClass("badge-danger");
					if(thiscars.color === 2) {
						color = "&diams;";
					} else {
						color = "&hearts;";
					}
					$(elem).html(translatelevel(thiscars.level)+" "+color);
				}
				
			});
		}
	});
});