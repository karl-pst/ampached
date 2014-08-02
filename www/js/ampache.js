(function(){


var app = angular.module('ampache',[]);

    app.factory('DataSource', ['$http',function($http){
  
    var time = Math.floor(new Date().getTime() / 1000);
    var key = sha256('root');
    var passphrase = sha256(time + key);

    return {
       get: function(callback){
            $http.get(
                'http://devel.io/server/xml.server.php?action=handshake&auth='+passphrase+'&timestamp='+time+'&version=370001&user=admin',
                {transformResponse:function(data) {
                  // convert the data to JSON and provide
                  // it to the success function below
                    var x2js = new X2JS();
                    var json = x2js.xml_str2json( data );
                    return json;
                    }
                }
            ).success(function(data, status) {
                // send the converted data back
                // to the callback function
                callback(data);
            });
       }
    };

    }]);
 
    app.controller('AmpacheController', function($scope, DataSource) {
         
        //This is the callback function
        setData = function(data) {
            $scope.dataSet = data;
            
        };
             
        DataSource.get(setData);
            
    });

    app.controller('EventController', function(){
        
    });
 


})();