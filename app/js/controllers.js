'use strict';

var appControllers = angular.module('appControllers', []);

appControllers.controller('AppCtrl', ['$scope', 'Portfolios', 'Securities', function($scope, Portfolios, Securities) {

  $scope.selectedPortfolio = '3';
  $scope.portfolio = Portfolios.get({portfolioId: $scope.selectedPortfolio});
  $scope.portfolioValue = '0';
  $scope.selectedDate = '2011-11-30';
  
  $scope.portfolios = [{id: '3'}, {id: '4'}];
  
  $scope.changePortfolio = function() {
  	$scope.portfolio = Portfolios.get({portfolioId: $scope.selectedPortfolio});	
  };
  
  $scope.calculate = function() {
	Securities.allSecurities(function(securities) {
		$scope.portfolioValue = portfolioCalculation($scope.portfolio, securities, $scope.selectedDate);
	});
  };
}]);
	
function getSecurityHistoryDetails(securities, securityID) {
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

function portfolioCalculation(portfolio, securities, currentDate) {
	var allPortfolioSecurities, counter = 0, historyDetails, portfolioValue = 0.0, shares, securityShares;
	
	allPortfolioSecurities = getAllSecuritiesInPortfolio(portfolio.transactions);
	
	_.each(allPortfolioSecurities, function(securityID) {
		
		historyDetails = getSecurityHistoryDetails(securities, securityID);
		securityShares = 0.0;
		
		_.each(getTransactionsPerSecurity(portfolio.transactions, securityID), function(transaction) {
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