function Messages() {
	this.messages = {
		"e1": {level:1,link:"link",message:"Petit sec"},
		"e2": {level:2,link:"link",message:"Fausse donne"},
		"e3": {level:2,link:"link",message:"Vous ne pouvez pas défausser si vous avez de l'atout"},
		"e4": {level:2,link:"link",message:"Vous devez jouer à la couleur, impossible de défausser"},
		"e5": {level:2,link:"link",message:"Vous devez jouer à la couleur, impossible de mettre de l'atout"},
		"e6": {level:2,link:"link",message:"Impossible de commencer par la couleur appelée"},
		"e7": {level:2,link:"link",message:"Vous devez présenter un atout plus grand"},
		"e8": {level:1,link:"link",message:"Pas de contrats, redistribution"},
		"p1": {level:2,link:"link",message:"Carte invalide dans la déclaration"},
		"p2": {level:2,link:"link",message:"L'excuse ne peut être présentée que si le joueur ne possède aucun autre bout"},
		"p3": {level:2,link:"link",message:"Veuillez présenter une poignée dans laquelle les cartes se suivent"},
		"p4": {level:2,link:"link",message:"Veuillez présenter une poignée avec le bon nombre de cartes"},
		"m1": {level:2,link:"link",message:"Vous avez de l'atout"},
		"m2": {level:2,link:"link",message:"Vous avez des têtes"},
		"m3": {level:2,link:"link",message:"Les miseres ne sont pas acceptées sur cette table"},
		"m4": {level:2,link:"link",message:"Les poignées ne sont pas acceptées sur cette table"},
		"a1": {level:2,link:"link",message:"Annonce déjà enregistrés"},
		"a2": {level:2,link:"link",message:"Vous devez déclarer quelque chose"},
		"c1": {level:2,link:"link",message:"Vous devez mettre au chien un nombre correct de cartes"},
		"c2": {level:2,link:"link",message:"Vous devez proposer un contrat superieur"},
		"r1": {level:1,link:"link",message:"Partie en pause"},
		"r2": {level:2,link:"link",message:"Vous ne pouvez pas faire d'appels pour le moment"},
		"r3": {level:2,link:"link",message:"Vous ne pouvez pas faire de contrat pour le moment"},
		"r4": {level:2,link:"link",message:"Vous ne pouvez pas faire de chien pour le moment"},
		"r5": {level:2,link:"link",message:"Vous ne pouvez pas faire de chien"},
		"r6": {level:2,link:"link",message:"Impossible pour le moment"},
		"r7": {level:2,link:"link",message:"Ce n'est pas votre tour"},
		"r8": {level:2,link:"link",message:"La table n'est pas jouable pour le moment"},
		"r9": {level:2,link:"link",message:"Vous n'êtes pas en jeu"}
	};
}
Messages.prototype.get = function() {
	return this.messages;
};
Messages.prototype.getLib = function(code) {
	if(this.messages[code] !== undefined) {
		return this.messages[code];
	}
};
module.exports = Messages;