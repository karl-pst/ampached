(function(){
	var app = angular.module('store', ['ampache']);

	app.controller('StoreController', function(){
		this.product = gems;
	});

	var gems =
		{
			name : 'Gem 1',
			price : 2.95,
			description : 'This is the description of the product.',
			canPurchase : true,
			soldOut : false
		};


	app.controller('PanelController', function(){
		this.tab = 1;

		this.selectTab = function(setTab){
			this.tab = setTab;
		};

		this.isSelected = function(checkTab){
			return this.tab === checkTab;
		};
	});
})();