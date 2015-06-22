'use strict';

var appServices = angular.module('appServices', ['ngResource']);

appServices.factory('Portfolios', ['$resource', function($resource){
  return $resource('../Portfolios/:portfolioId.json');
}]);

appServices.factory('Securities', ['$resource', function($resource){
  return $resource('../Securities/:securityId.json', {}, {
  	allSecurities: {method:'GET', params:{securityId:'securities'}, isArray:true}
  });
}]);