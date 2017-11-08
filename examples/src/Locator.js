export default class Locator {

	static JSON_PLACE_HOLDER = new Locator("https://jsonplaceholder.typicode.com");

	constructor(url){
		this.url = url;
	}

	solve(path){
		return this.url + path;
	}
}