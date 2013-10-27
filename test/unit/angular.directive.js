describe('Unit testing easypiechart', function() {
	var $compile;
	var $rootScope;

	beforeEach(module('easypiechart'));

	beforeEach(inject(function(_$compile_, _$rootScope_){
		$compile = _$compile_;
		$rootScope = _$rootScope_;
	}));

	it('inserts the element with a canvas element', function() {
		var element = $compile("<div easypiechart></div>")($rootScope);
		$rootScope.$digest();
		expect(element.html()).toContain("canvas");
	});

	it('takes size option the right way', function() {
		$rootScope.options = {
			size: 200
		};
		var element = $compile("<div easypiechart options='options'></div>")($rootScope);
		$rootScope.$digest();
		expect(element.html()).toContain("200");
	});
});
