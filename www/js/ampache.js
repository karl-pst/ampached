(function(){


var app = angular.module('ampache',['ngRoute']);

    app.config(function($routeProvider){
        $routeProvider
            .when('/', {
                templateUrl : 'pages/home.html',
                controller : 'mainController'
            })

            .when('/login', {
                templateUrl : 'pages/login.html',
                controller : 'loginController'
            })

            .when('/player', {
                templateUrl : 'pages/player.html',
                controller : 'playerController'
            })

            .when('/about', {
                templateUrl : 'pages/about.html',
                controller : 'aboutController'
            });
        
    });

    app.controller('mainController', function($scope, sharedResources){
        $scope.shared = sharedResources;
        $scope.message = "HOME";

        console.log($scope.shared.isLoggedin);
    });

    app.controller('loginController', function($scope){
        $scope.message = "LOGIN";

        $scope.login = function(){
            console.log($scope.username);
        };
    });

    app.controller('aboutController', function($scope){
        $scope.message = "ABOUT";
    });

    app.service('sharedResources', function(){


    });

    app.factory('dataSource', ['$http',function($http){
  
    var time = Math.floor(new Date().getTime() / 1000);
    var key = sha256('root');
    var passphrase = sha256(time + key);

    var url = 'http://devel.io/server/xml.server.php';
    var config = {
        action: 'handshake',
        auth: passphrase,
        timestamp: time,
        version: 370001,
        user: 'admin',

    };

    return {
       get: function(callback){
            $http.get(
                // 'http://devel.io/server/xml.server.php?action=handshake&auth='+passphrase+'&timestamp='+time+'&version=370001&user=admin',
                // 'http://devel.io/server/xml.server.php?action=handshake&auth=172726c763967f83b2776502263b8245',
                'http://devel.io/server/xml.server.php?action=songs&auth=09ac8626675d4c8b2dc67c20da2ff7a7&offset=1&limit=10',
                {transformResponse:function(data) {
                  // convert the data to JSON and provide
                  // it to the success function below       
                  console.log(data);
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


    app.factory('dataFormatter', function(){
        return {
            songs : function(data){
                var raw = data.root.song;
                
                var tracks = [];
                for(var x=0; x<raw.length; x++){
                    var temp = {};
                    temp['title'] = raw[x].title.__cdata;
                    temp['url'] = raw[x].url.__cdata;

                    tracks.push(temp);
                }

                //return JSON.stringify(tracks);
                return tracks;
            },
            albums : function(){
            }
        };
    });

    app.factory('player', function(audio, $rootScope){
        var player,
        playlist = [],
        paused = false,
        current = {
            track: 0,
        };

    player = {
        playlist: playlist,

        current: current,

        playing: false,

        play: function(track) {
            console.log(playlist.length);
            if (!playlist.length) return;

            if (angular.isDefined(track)) current.track = track;
            console.log(playlist);

            if (!paused) audio.src = playlist[current.track].url;
            audio.play();
            player.playing = true;
            paused = false;
        },

        pause: function() {
        if (player.playing) {
            audio.pause();
            player.playing = false;
            paused = true;
        }
        },

        reset: function() {
            player.pause();
            current.track = 0;
        },

        next: function() {
            if (!playlist.length) return; //playlist empty
            paused = false;
            if (playlist.length > (current.track + 1)) {
              current.track++;
            } else {
              current.track = 0;
            }
            if (player.playing) player.play();
        },

        previous: function() {
            if (!playlist.length) return;
            paused = false;
            if (current.track > 0) {
              current.track--;
            } else {
              current.track = playlist.length - 1;
            }
            if (player.playing) player.play();
        }

    };

    playlist.add = function(song) {
        if (playlist.indexOf(song) != -1) return;
        playlist.push(song);
    };

    //Check if audio has ended, if it is, continue to next
    audio.addEventListener('ended', function() {
        console.log("ended");
        $rootScope.$apply(player.next);
    }, false);


    return player;

    });


    // extract the audio for making the player easier to test
    app.factory('audio', function($document) {
        var audio = $document[0].createElement('audio');
        return audio;
    });
 
    app.controller('playerController', function($scope, player, dataSource, dataFormatter, $sce) {

        $scope.player = player;
        
         
        //This is the callback function
        setData = function(data) {
            
            //$scope.test = $sce.trustAsResourceUrl($scope.dataSet.root.song[0].url.__cdata);
            
            /*$scope.trustSrc = function(src) {
                return $sce.trustAsResourceUrl(src);
              };*/

           $scope.songs = dataFormatter.songs(data);

        };
             
        dataSource.get(setData);
            
    });

    


})();