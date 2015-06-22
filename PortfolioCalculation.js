/**
 * @author Joao Silva
 */
(function() { 'use strict';
	
	var _ = require("underscore");
	
	var	securities = [], portfolios = [], result;
	
	function getPortfolioTransactions(portfolioID) {
		var currentPortfolio = _.find(portfolios, function(portfolio) {
			return portfolio.id === portfolioID;
		});
		
		if(currentPortfolio) {
			return currentPortfolio.transactions;
		}
	};
	
	function getSecurityHistoryDetails(securityID) {
		var currentSecurity = _.find(securities, function(security) {
			return security.id === securityID;
		});
		
		if(currentSecurity) {
			return currentSecurity.historyDetails;
		}
	};
	
	function getSecurityValueByDate(historyDetails, date) {
		var latestEvent, newDate = new Date(date);
		
		latestEvent = _.max(_.filter(historyDetails, function(historyDetail) {
			return new Date(historyDetail.endDate) <= newDate;
		}), function(previousOccurence) {
			return new Date(previousOccurence.endDate);
		});
		
		if(latestEvent) {
			return latestEvent.value;
		}
	};
	
	function getAllSecuritiesInPortfolio(transactions) {
		return _.uniq(_.pluck(transactions, "securityId"));
	};
	
	function getTransactionsPerSecurity(transactions, securityID) {
		return _.filter(transactions, function(transaction) {
			return transaction.securityId === securityID;
		});
	};
	
	function calculateShares(quantity, price) {
		return quantity / price;
	};
	
	function portfolioCalculation(portfolioID, currentDate) {
		var transactions, historyDetails, portfolioValue = 0.0, shares, securityShares;

		transactions = getPortfolioTransactions(portfolioID);
		if(!transactions) {
			return "There's no Portfolio with ID " + portfolioID;
		}
		
		_.each(getAllSecuritiesInPortfolio(transactions), function(securityID) {
			historyDetails = getSecurityHistoryDetails(securityID);
			securityShares = 0.0;
			
			_.each(getTransactionsPerSecurity(transactions, securityID), function(transaction) {
				shares = calculateShares(transaction.amount, getSecurityValueByDate(historyDetails, transaction.date));
				if(transaction.type === "buy") {
					securityShares += shares;
				} else {
					securityShares -= shares;
				}
			});
			
			portfolioValue += securityShares * getSecurityValueByDate(historyDetails, currentDate);
		});
		
		return Math.round(portfolioValue * 100) / 100;
	};
	
	function loadData() {
		var securityFileNames = ["A", "B", "C", "D"],
			portfolioFileNames = ["3", "4"],
			jsonData;
		
		_.each(securityFileNames, function(fileName) {
			jsonData = require("./Securities/" + fileName + ".json");
			securities.push(jsonData);
		});

		_.each(portfolioFileNames, function(fileName) {
			jsonData = require("./Portfolios/" + fileName + ".json");
			portfolios.push(jsonData);
		});
	};
	
	// Main program
	if(process.argv.length === 4) {
		loadData();
		result = portfolioCalculation(process.argv[2], process.argv[3]);
		console.log(result);
	} else {
		console.log("Wrong number of arguments, usage:\nnode PortfolioCalculation.js portfolioID date");
	}
	
}());
