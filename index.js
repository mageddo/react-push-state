import React from 'react';

export default class Router {

	static map = {};
	static observers = [];
	static options;

	static _construct = (() => {
		console.debug('constructed!')
		window.onpopstate = function(e){
			var st = e.state;
			console.debug('m=onpopstate, state=%o, e=%o', st, e)
			Router.getAndLoad(st);
		}
	})()

	/**
	 * Register listeners to be trigered when a new page must be load
	 * observer - a React.component, the .pushState method will be called when a page must be loaded
	 */
	static register(observer, map){
		Router.observers.push({observer: observer, map: map})
	}

	/**
	 * Register the state and call the page load, this method is recommended to be called in link clicks
	 * @see #Link element
	 * e - the click event
	 * page - react element to be rendered
	 */
	static load(e, data, page){
		e.preventDefault();
		var state = {
			data: data,
			path: e.currentTarget.getAttribute('href'),
			title: e.currentTarget.getAttribute('title'),
			queryString: document.location.search
		};
		var pushState = e.currentTarget.getAttribute('pushstate');
		console.debug('m=load, state=%o, pushstate=%o', state, pushState);
		if(pushState === 'true'){
			Router.pushAndLoad(state);
		}else{
			state.page = page;
			Router.doLoad(state);
		}
	}

	static pushAndLoad(state){
		console.debug('m=pushAndLoad state=%o', state);
		state.path = Router.getPath(state.path);
		window.history.pushState(state, state.title, state.path);
		Router.doLoad(state);
	}

	static getAndLoad(state){
		var extraInfo = {path: document.location.pathname, queryString: document.location.search};
		console.debug('m=getAndLoad, state=%o, extraInfo=%o', state, extraInfo);
		if(state === null){
			Router.doLoad(extraInfo);
		} else {
			state = Object.assign({}, state, extraInfo);
			Router.doLoad(state);
		}
	}
	/**
	 * Call listeners with the passed state
	 */
	static doLoad(state){

		state.path = Router.stripBasePath(state.path)

		// currently browsers does not consider the pushState title property
		// so we need to set it using document
		// window.document.title = state.title;
		Router.observers.forEach(o => {
			console.debug('m=doLoad, status=call-observer, observerIsNull=%o, state=%o', o == null, state);
			if(!state.page) {
				Router.invoke(state, o.map);
			}else{
				if(o.observer.load !== undefined){
					o.observer.load(state);
				}
			}
		})
	}

	/**
	 * Call the respective function in map if it exists
	 * The callback will have the state as parameter
	 * If no one key matches then 404 key will be called
	 */
	static invoke(state, map){
		var keys = Object.keys(map);
		for(var i=0; i < keys.length; i++){
			var key = keys[i], pathVar;
			if((pathVar = new RegExp(key).exec(state.path)) != null){
				console.debug('m=invoke, status=invoking, state=%s, key=%s, pathVar=%o', state, key, JSON.stringify(pathVar));
				var data = Object.assign({}, state, {pathVar: pathVar.splice(1), query: Router.parseQuery(state.queryString)});
				map[key].call(data, data);
				return data;
			}
		}
		console.debug('m=invoke, status=not-found, path=%s', state.path);
		if(map['404']){
			map['404'].call(state, state);
		}
	}

	/**
	 * Must be called just after page load to load the the current state of the passed if it does not exists
	 */
	static start(options){
		console.info('m=start, options=%o', options);
		if(options){
			options.basePath = options.basePath || '';
		}else{
			options = {
				basePath: ''
			};
		}
		Router.options = options;
		Router.getAndLoad(window.history.state);
	}

	static parseQuery(queryString) {
		var query = {};
		if(!queryString){
			return query;
		}
		var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split('=');
			query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
		}
		return query;
	}

	static stripBasePath(path) {
		return path.replace(Router.options.basePath, '') || '/'
	}

	static getPath(path) {
		return (Router.options.basePath + path).replace(new RegExp('//+', 'g'), '/')
	}

}

/**
 * It's prepared to load pages without make a refresh, just provide the URL and the react element at the 'page' property to be renderized
 */
export class Link extends React.Component {

	constructor(props){
		super();
		this.props = props;
	}

	render(){
		return <a className="load-link" pushstate="true" onClick={(e) => Router.load(e, this.props.data, this.props.page)} {...this.props}>{this.props.children}</a>
	}
}