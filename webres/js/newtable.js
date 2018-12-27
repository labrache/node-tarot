$(function () {
	function switchpw(elem) {
		if(elem.value == "priv") {
			$("#passform").show();
		} else {
			$("#passform").hide();
		}
	}
	$("input[name='tableconf']").change(function(elem){switchpw(elem.target)});
	switchpw($("input[name='tableconf']").get(0));
});