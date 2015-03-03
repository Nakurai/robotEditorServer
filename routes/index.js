//"use strict";

var express = require('express');
var router = express.Router();
var webSearcher = require ("./webSearcher").getInstance();
var nlp = require('./nlp.js').getInstance();
var q = require('q');

//get params from body
var getParams  = function(req) { 
	if (req.is("application/x-www-form-urlencoded")) {
		return req.body;
		} else 	
		if (req.is("text/plain")) {
			return  JSON.parse(req.body) ;
		}		
	};



/* GET Documentation : home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Hapteo' });
});


/* GET Documentation : analyze page. */
router.get('/analyze', function(req, res, next) {
	res.render('analyze', { title: '/analyze' });
});

/* GET Documentation : test the workflow. */
router.get('/test', function(req, res, next) {
	res.render('test', {title: 'test'});
});


/** 
* POST analyze page with string. 
* @todo: sanitize user input !
*/
router.post('/analyze', function(req, res, next) {

	var params = getParams(req);
	var output = "no answer";

	if (params.string === undefined || params.string.length == 0) {
		output="Body malformed : String parameter is missing";
		res.render('test', { title: 'test', answer:output });

	} 
	else {
		// This function takes all the user's text and sends back a table of Sentences{tokens, nbTokens, literal, needle, img, web}
		nlp.userTextAnalysis(params.string).then(
			function(sentences_apart){

				// once sentences are separated, web search is done to retrieve relevant web content
				webSearcher.go(sentences_apart).then(

					function(sentences_completed){

						// Now, all the sentences have been attached to images and webresult. Nlp is once again used 
						// to rank these results
						sentences_completed = nlp.rankSentences(sentences_completed);

						// The analysis is over, the answer is constructed and sent back
						var ans = [];
						var nbSentences = sentences_completed.length;
						for(var cpt=0; cpt<nbSentences; cpt++){
							ans.push(sentences_completed[cpt].getJson());
						}
						
						//res.render('test', { title: 'test', answer:ans });
						res.status(200).json(ans);

					},
					function(error){
						res.render('test', { title: 'test', answer:error });
					}
				).done();
				
			},
			function(error){
				res.render('test', { title: 'test', answer:error });
			}

		).done();
	}
	

});


module.exports = router;
